"""Regras de leitura das faturas.

O dossiê é a fonte: ele é o único registro que sabe o que o robô decidiu e por quê.
Duas informações que a tela pede não moram nele, e por isso são costuradas aqui:

* **`servico`** vem de `contratos.categoria_servico` — é a mesma categoria que dá
  nome à pasta no arquivamento (etapa 9). Procura-se primeiro pelo número do
  contrato que a própria medição usou; só quando a medição não rodou é que se
  cai no contrato ativo do CNPJ.

* **`emissao`** só existe em `documentos_coletados`. O dossiê guarda vencimento,
  não emissão. O casamento é feito por (fornecedor, número da NF) e, na falta
  dela, (fornecedor, número da fatura).

Ambas as costuras são feitas em UMA consulta extra para o lote inteiro, nunca uma
por linha: a listagem é a tela mais aberta do sistema e um N+1 aqui aparece como
lentidão que ninguém consegue explicar.
"""

from __future__ import annotations

from decimal import Decimal
from typing import Sequence

from sqlalchemy import Select, func, or_, select, tuple_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.governanca.models.contrato import GovContrato
from app.governanca.models.documento import GovDocumentoColetado
from app.governanca.models.dossie import GovDossie
from app.governanca.schemas.fatura import (
    ArquivoSaida,
    ConferenciaSaida,
    FaturaDetalhe,
    FaturaResumo,
    MedicaoSaida,
)

ZERO = Decimal("0")


class NaoEncontrado(Exception):
    pass


# `desfecho` (banco) -> `status` (tela). Os quatro rótulos já existem no front com
# suas cores; inventar um quinto quebraria a tela em silêncio.
DESFECHO_PARA_STATUS: dict[str, str] = {
    "LiberadoParaPagamento": "conciliada",
    "DevolvidoAoFornecedor": "divergente",
    "TravadoAguardandoPedido": "pendente",
    "PendenteConferenciaHumana": "pendente",
}

STATUS_PARA_DESFECHOS: dict[str, tuple[str, ...]] = {
    "conciliada": ("LiberadoParaPagamento",),
    "divergente": ("DevolvidoAoFornecedor",),
    "pendente": ("TravadoAguardandoPedido", "PendenteConferenciaHumana"),
    # "recebida" é o documento coletado que ainda não virou dossiê. Nenhum dossiê
    # tem esse status, então o filtro é legítimo e devolve lista vazia.
    "recebida": (),
}


def apenas_digitos(valor: str) -> str:
    return "".join(c for c in valor if c.isdigit())


def _consulta_base() -> Select[tuple[GovDossie]]:
    return select(GovDossie).order_by(GovDossie.processado_em.desc(), GovDossie.id.desc())


def _aplicar_filtros(
    consulta: Select[tuple[GovDossie]],
    *,
    status: str | None,
    competencia: str | None,
    fornecedor_cnpj: str | None,
    busca: str | None,
) -> Select[tuple[GovDossie]]:
    if status:
        desfechos = STATUS_PARA_DESFECHOS.get(status.strip().lower())
        if desfechos is None:
            # Status desconhecido não é erro do servidor nem do formato: é filtro
            # que não casa com nada. Lista vazia diz isso sem inventar um 4xx.
            desfechos = ()
        consulta = consulta.where(GovDossie.desfecho.in_(desfechos))

    if competencia:
        consulta = consulta.where(GovDossie.competencia == competencia.strip())

    if fornecedor_cnpj:
        # Os portais entregam CNPJ com e sem máscara. Comparar por dígitos evita
        # que o filtro dependa de como o usuário digitou.
        digitos = apenas_digitos(fornecedor_cnpj)
        if digitos:
            consulta = consulta.where(
                func.regexp_replace(GovDossie.fornecedor_cnpj, r"\D", "", "g") == digitos
            )

    if busca and busca.strip():
        alvo = f"%{busca.strip()}%"
        consulta = consulta.where(
            or_(
                GovDossie.lancamento_referencia.ilike(alvo),
                GovDossie.fornecedor_nome.ilike(alvo),
                GovDossie.numero_nota_fiscal.ilike(alvo),
                GovDossie.numero_fatura.ilike(alvo),
                GovDossie.conferencia_pedido_numero.ilike(alvo),
                GovDossie.unidade.ilike(alvo),
            )
        )

    return consulta


async def _servicos_por_dossie(
    sessao: AsyncSession, dossies: Sequence[GovDossie]
) -> dict[int, str | None]:
    """Categoria de serviço de cada dossiê, em uma consulta só."""
    numeros = {d.medicao_contrato_numero for d in dossies if d.medicao_contrato_numero}
    cnpjs = {d.fornecedor_cnpj for d in dossies if d.fornecedor_cnpj}
    if not numeros and not cnpjs:
        return {}

    condicoes = []
    if numeros:
        condicoes.append(GovContrato.numero.in_(numeros))
    if cnpjs:
        condicoes.append(GovContrato.fornecedor_cnpj.in_(cnpjs))

    linhas = (
        await sessao.execute(
            select(
                GovContrato.numero,
                GovContrato.fornecedor_cnpj,
                GovContrato.categoria_servico,
                GovContrato.ativo,
            ).where(or_(*condicoes))
        )
    ).all()

    por_numero: dict[str, str | None] = {}
    por_cnpj: dict[str, str | None] = {}
    for numero, cnpj, categoria, ativo in linhas:
        por_numero[numero] = categoria
        # GovContrato inativo só entra se nada ativo tiver preenchido a chave: ele
        # ainda descreve corretamente notas antigas do mesmo fornecedor.
        if ativo or cnpj not in por_cnpj:
            por_cnpj[cnpj] = categoria

    return {
        d.id: (
            por_numero.get(d.medicao_contrato_numero or "")
            or por_cnpj.get(d.fornecedor_cnpj)
        )
        for d in dossies
    }


async def _emissoes_por_dossie(
    sessao: AsyncSession, dossies: Sequence[GovDossie]
) -> dict[int, str | None]:
    """Data de emissão de cada dossiê, buscada no documento que o originou.

    Não há chave estrangeira entre dossiê e documento — o agente .NET grava os
    dois lados sem ligá-los —, então o casamento é pela chave de negócio.
    """
    por_nota = {
        (d.fornecedor_id, d.numero_nota_fiscal)
        for d in dossies
        if d.numero_nota_fiscal
    }
    por_fatura = {
        (d.fornecedor_id, d.numero_fatura) for d in dossies if d.numero_fatura
    }
    if not por_nota and not por_fatura:
        return {}

    condicoes = []
    if por_nota:
        condicoes.append(
            tuple_(
                GovDocumentoColetado.fornecedor_id, GovDocumentoColetado.numero_nota_fiscal
            ).in_(por_nota)
        )
    if por_fatura:
        condicoes.append(
            tuple_(GovDocumentoColetado.fornecedor_id, GovDocumentoColetado.numero_fatura).in_(
                por_fatura
            )
        )

    linhas = (
        await sessao.execute(
            select(
                GovDocumentoColetado.fornecedor_id,
                GovDocumentoColetado.numero_nota_fiscal,
                GovDocumentoColetado.numero_fatura,
                GovDocumentoColetado.emissao,
            ).where(or_(*condicoes), GovDocumentoColetado.emissao.is_not(None))
        )
    ).all()

    notas: dict[tuple[str, str], str] = {}
    faturas: dict[tuple[str, str], str] = {}
    for fornecedor_id, numero_nf, numero_fatura, emissao in linhas:
        if numero_nf:
            notas[(fornecedor_id, numero_nf)] = emissao
        if numero_fatura:
            faturas[(fornecedor_id, numero_fatura)] = emissao

    resultado: dict[int, str | None] = {}
    for d in dossies:
        emissao = None
        if d.numero_nota_fiscal:
            emissao = notas.get((d.fornecedor_id, d.numero_nota_fiscal))
        if emissao is None and d.numero_fatura:
            emissao = faturas.get((d.fornecedor_id, d.numero_fatura))
        resultado[d.id] = emissao
    return resultado


def _montar_resumo(
    dossie: GovDossie, servico: str | None, emissao: str | None
) -> dict[str, object]:
    return {
        "id": dossie.id,
        "referencia": dossie.lancamento_referencia,
        "fornecedor": dossie.fornecedor_nome,
        "fornecedor_cnpj": dossie.fornecedor_cnpj,
        "unidade": dossie.unidade,
        "servico": servico,
        "pedido": dossie.conferencia_pedido_numero,
        "valor": dossie.valor,
        "valor_pedido": dossie.conferencia_valor_pedido,
        "competencia": dossie.competencia,
        "emissao": emissao,
        "vencimento": dossie.vencimento,
        "status": DESFECHO_PARA_STATUS.get(dossie.desfecho, "pendente"),
        "canal": dossie.canal,
        "processado_em": dossie.processado_em,
    }


def montar_medicao(dossie: GovDossie) -> MedicaoSaida | None:
    """`None` quando a etapa 4 não rodou — nunca zeros.

    A tela precisa distinguir "medido e deu zero de divergência" de "não medido":
    o primeiro caso está resolvido, o segundo é trabalho humano pendente.
    """
    if dossie.medicao_situacao is None:
        return None

    contratado = dossie.medicao_valor_contratado
    cobrado = dossie.medicao_valor_cobrado

    divergencia: Decimal | None = None
    percentual: Decimal | None = None
    if contratado is not None and cobrado is not None:
        divergencia = cobrado - contratado
        if contratado != ZERO:
            percentual = divergencia / contratado * Decimal("100")

    return MedicaoSaida(
        situacao=dossie.medicao_situacao,
        motivo=dossie.medicao_motivo,
        contrato_numero=dossie.medicao_contrato_numero,
        item_contratado=dossie.medicao_item_contratado,
        valor_contratado=contratado,
        valor_cobrado=cobrado,
        divergencia=divergencia,
        divergencia_percentual=percentual,
        explicacao=dossie.medicao_explicacao,
    )


def montar_conferencia(dossie: GovDossie) -> ConferenciaSaida | None:
    """`None` quando as etapas 5 e 6 não rodaram.

    `conforme` vem da coluna GERADA no banco: é leitura, nunca escrita, e por
    isso não tem como divergir de `situacao`.
    """
    if dossie.conferencia_situacao is None:
        return None

    return ConferenciaSaida(
        situacao=dossie.conferencia_situacao,
        pedido_numero=dossie.conferencia_pedido_numero,
        valor_pedido=dossie.conferencia_valor_pedido,
        valor_documento=dossie.conferencia_valor_documento,
        conforme=bool(dossie.conferencia_conforme),
        divergencias=list(dossie.conferencia_divergencias or []),
        explicacao=dossie.conferencia_explicacao,
    )


async def listar(
    sessao: AsyncSession,
    *,
    status: str | None = None,
    competencia: str | None = None,
    fornecedor_cnpj: str | None = None,
    busca: str | None = None,
) -> list[FaturaResumo]:
    consulta = _aplicar_filtros(
        _consulta_base(),
        status=status,
        competencia=competencia,
        fornecedor_cnpj=fornecedor_cnpj,
        busca=busca,
    )
    dossies = list((await sessao.scalars(consulta)).all())
    if not dossies:
        return []

    servicos = await _servicos_por_dossie(sessao, dossies)
    emissoes = await _emissoes_por_dossie(sessao, dossies)

    return [
        FaturaResumo(**_montar_resumo(d, servicos.get(d.id), emissoes.get(d.id)))
        for d in dossies
    ]


async def obter(sessao: AsyncSession, fatura_id: int) -> FaturaDetalhe:
    dossie = await sessao.scalar(
        select(GovDossie)
        .options(selectinload(GovDossie.arquivos), selectinload(GovDossie.trilha))
        .where(GovDossie.id == fatura_id)
    )
    if dossie is None:
        raise NaoEncontrado(f"Fatura {fatura_id} não encontrada.")

    servicos = await _servicos_por_dossie(sessao, [dossie])
    emissoes = await _emissoes_por_dossie(sessao, [dossie])

    return FaturaDetalhe(
        **_montar_resumo(dossie, servicos.get(dossie.id), emissoes.get(dossie.id)),
        arquivos=[ArquivoSaida.model_validate(a) for a in dossie.arquivos],
        medicao=montar_medicao(dossie),
        conferencia=montar_conferencia(dossie),
        protocolo_linx=dossie.protocolo_linx,
        destinatario_rascunho=dossie.destinatario_rascunho,
        trilha=[linha.texto for linha in dossie.trilha],
    )
