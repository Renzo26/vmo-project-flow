"""Gravação do resultado do agente no banco.

Enquanto o agente .NET persistir em JSON, é por aqui que o resultado dele chega ao
Postgres — e portanto ao dashboard. Não é um atalho de demonstração: o dossiê já é a
saída canônica do agente, e este serviço apenas o materializa nas tabelas que a leitura
consulta. Quando o agente passar a escrever direto no banco, o que muda é quem chama;
as invariantes abaixo continuam sendo as mesmas.

Três regras que valem explicação:

* **Reprocessar substitui, não empilha.** Um lançamento tem UM dossiê — é a UNIQUE
  (fornecedor_id, lancamento_referencia). Numa apresentação a mesma nota é rodada várias
  vezes de propósito; se cada passagem criasse uma linha, o dashboard contaria a mesma
  fatura três vezes e o número deixaria de significar algo.

* **Documento é idempotente por hash.** O mesmo arquivo coletado de novo não entra
  duas vezes — é a regra que o próprio agente aplica em memória, aqui garantida pelo
  banco. Documento novo entra; repetido é ignorado em silêncio, porque não é erro.

* **`conferencia_conforme` nunca é escrito.** É coluna gerada a partir da situação.
"""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.governanca.models.documento import GovDocumentoColetado
from app.governanca.models.dossie import GovDossie, GovDossieArquivo, GovDossieTrilha
from app.governanca.schemas.ingestao import (
    DocumentoEntrada,
    DossieEntrada,
    IngestaoEntrada,
    IngestaoSaida,
)
from app.services.faturas import DESFECHO_PARA_STATUS


class ErroDeIngestao(Exception):
    """Dado que o banco recusou — vira 409, nunca 500."""


def _aplicar_dossie(dossie: GovDossie, dados: DossieEntrada) -> None:
    dossie.lancamento_referencia = dados.lancamento_referencia
    dossie.fornecedor_id = dados.fornecedor_id
    dossie.fornecedor_nome = dados.fornecedor_nome
    dossie.fornecedor_cnpj = dados.fornecedor_cnpj
    dossie.canal = dados.canal
    dossie.processado_em = dados.processado_em
    dossie.desfecho = dados.desfecho
    dossie.competencia = dados.competencia
    dossie.unidade = dados.unidade
    dossie.numero_nota_fiscal = dados.numero_nota_fiscal
    dossie.numero_fatura = dados.numero_fatura
    dossie.vencimento = dados.vencimento
    dossie.valor = dados.valor
    dossie.protocolo_linx = dados.protocolo_linx
    dossie.rascunho_devolucao = dados.rascunho_devolucao
    dossie.destinatario_rascunho = dados.destinatario_rascunho

    # Medição e conferência ausentes viram NULL, não zeros: a leitura distingue
    # "medido e deu zero de divergência" de "não medido", e um zero aqui apagaria
    # essa diferença justamente nas notas que travaram antes da etapa 4.
    m = dados.medicao
    dossie.medicao_situacao = m.situacao if m else None
    dossie.medicao_motivo = m.motivo if m else None
    dossie.medicao_explicacao = m.explicacao if m else None
    dossie.medicao_contrato_numero = m.contrato_numero if m else None
    dossie.medicao_item_contratado = m.item_contratado if m else None
    dossie.medicao_valor_contratado = m.valor_contratado if m else None
    dossie.medicao_valor_cobrado = m.valor_cobrado if m else None
    dossie.medicao_observacao = m.observacao if m else None

    c = dados.conferencia
    dossie.conferencia_situacao = c.situacao if c else None
    dossie.conferencia_pedido_numero = c.pedido_numero if c else None
    dossie.conferencia_valor_pedido = c.valor_pedido if c else None
    dossie.conferencia_valor_documento = c.valor_documento if c else None
    dossie.conferencia_explicacao = c.explicacao if c else None
    dossie.conferencia_divergencias = list(c.divergencias) if c else None


def _arquivos(dados: DossieEntrada) -> list[GovDossieArquivo]:
    return [
        GovDossieArquivo(
            nome_origem=a.nome_origem,
            nome_final=a.nome_final,
            tipo=a.tipo,
            hash_sha256=a.hash_sha256,
        )
        for a in dados.arquivos
    ]


def _trilha(dados: DossieEntrada) -> list[GovDossieTrilha]:
    return [GovDossieTrilha(ordem=i, texto=texto) for i, texto in enumerate(dados.trilha)]


async def _substituir_filhos(
    sessao: AsyncSession, dossie: GovDossie, dados: DossieEntrada
) -> None:
    """Troca arquivos e trilha de um dossiê JÁ existente pelo estado novo.

    O `flush` entre limpar e repovoar não é zelo: sem ele o SQLAlchemy emite os INSERTs
    antes dos DELETEs, e a UNIQUE (dossie_id, ordem) da trilha estoura em todo
    reprocessamento — que é exatamente o caso que a apresentação exercita.
    """
    dossie.arquivos.clear()
    dossie.trilha.clear()
    await sessao.flush()

    dossie.arquivos = _arquivos(dados)
    dossie.trilha = _trilha(dados)


async def _gravar_documentos(
    sessao: AsyncSession, documentos: list[DocumentoEntrada]
) -> int:
    """Insere só os documentos ainda desconhecidos. Devolve quantos entraram."""
    if not documentos:
        return 0

    hashes = {d.hash_sha256 for d in documentos}
    chaves = {d.chave_natural for d in documentos}

    ja_conhecidos = set(
        (
            await sessao.scalars(
                select(GovDocumentoColetado.hash_sha256).where(
                    GovDocumentoColetado.hash_sha256.in_(hashes)
                )
            )
        ).all()
    )
    chaves_usadas = set(
        (
            await sessao.scalars(
                select(GovDocumentoColetado.chave_natural).where(
                    GovDocumentoColetado.chave_natural.in_(chaves)
                )
            )
        ).all()
    )

    novos = 0
    for d in documentos:
        if d.hash_sha256 in ja_conhecidos or d.chave_natural in chaves_usadas:
            continue
        # Um lote pode trazer o mesmo arquivo duas vezes; marcar aqui evita que a
        # segunda cópia passe pela checagem, que foi feita antes do flush.
        ja_conhecidos.add(d.hash_sha256)
        chaves_usadas.add(d.chave_natural)

        meta = d.metadados
        sessao.add(
            GovDocumentoColetado(
                fornecedor_id=d.fornecedor_id,
                fornecedor_nome=d.fornecedor_nome,
                fornecedor_cnpj=d.fornecedor_cnpj,
                canal=d.canal,
                tipo=d.tipo,
                nome_arquivo_origem=d.nome_arquivo_origem,
                caminho_relativo=d.caminho_relativo,
                hash_sha256=d.hash_sha256,
                tamanho_bytes=d.tamanho_bytes,
                chave_natural=d.chave_natural,
                id_origem=meta.id_origem,
                numero_fatura=meta.numero_fatura,
                numero_nota_fiscal=meta.numero_nota_fiscal,
                serie_nota_fiscal=meta.serie_nota_fiscal,
                numero_pedido=meta.numero_pedido,
                competencia=meta.competencia,
                unidade=meta.unidade,
                emissao=meta.emissao,
                vencimento=meta.vencimento,
                valor=meta.valor,
                coletado_em=d.coletado_em,
            )
        )
        novos += 1

    return novos


async def registrar(sessao: AsyncSession, entrada: IngestaoEntrada) -> IngestaoSaida:
    dados = entrada.dossie

    # `selectinload` não é otimização aqui: as duas coleções são substituídas logo
    # abaixo, e num serviço assíncrono o carregamento preguiçoso não acontece — ele
    # levanta `MissingGreenlet`. Carregar junto é o que torna o reprocessamento
    # possível.
    existente = await sessao.scalar(
        select(GovDossie)
        .options(selectinload(GovDossie.arquivos), selectinload(GovDossie.trilha))
        .where(
            GovDossie.fornecedor_id == dados.fornecedor_id,
            GovDossie.lancamento_referencia == dados.lancamento_referencia,
        )
    )

    criado = existente is None

    if existente is None:
        # Dossiê novo: as coleções são montadas ANTES do `add`, e o cascade as insere
        # junto. Tocá-las depois do flush faria o SQLAlchemy tentar carregar do banco
        # uma coleção que não existe — e num serviço assíncrono isso não é uma consulta
        # a mais, é `MissingGreenlet`.
        dossie = GovDossie()
        _aplicar_dossie(dossie, dados)
        dossie.arquivos = _arquivos(dados)
        dossie.trilha = _trilha(dados)
        sessao.add(dossie)
    else:
        dossie = existente
        _aplicar_dossie(dossie, dados)
        await _substituir_filhos(sessao, dossie, dados)

    novos = await _gravar_documentos(sessao, entrada.documentos)

    try:
        await sessao.commit()
    except IntegrityError as erro:
        await sessao.rollback()
        raise ErroDeIngestao(f"O banco recusou o dossie: {erro.orig}") from erro

    await sessao.refresh(dossie)

    return IngestaoSaida(
        id=dossie.id,
        referencia=dossie.lancamento_referencia,
        desfecho=dossie.desfecho,
        status=DESFECHO_PARA_STATUS.get(dossie.desfecho, "pendente"),
        criado=criado,
        documentos_novos=novos,
    )
