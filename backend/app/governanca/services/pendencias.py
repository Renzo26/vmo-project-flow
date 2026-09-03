"""A fila de trabalho humano, derivada dos dossiês.

Pendência não é tabela. Ela é o que sobrou de um dossiê que o robô não conseguiu
liberar, e por isso é sempre CALCULADA. Persistir uma cópia criaria dois estados
para o mesmo fato: reprocessar a nota corrigiria o dossiê e deixaria a fila
apontando para um problema que já não existe — o defeito mais caro que uma fila
de trabalho pode ter.

Um dossiê pode gerar DUAS pendências: a medição barrou o valor E a conferência
não achou o pedido. São problemas de pessoas diferentes (comprador e requisitante)
e resolver um não resolve o outro, então colapsá-los em uma linha só esconderia
metade do trabalho.
"""

from __future__ import annotations

from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.governanca.models.dossie import GovDossie
from app.governanca.schemas.pendencia import Pendencia

LIBERADO = "LiberadoParaPagamento"

# `tipo` é um conjunto fechado de quatro rótulos no front. O banco tem sete
# motivos de não aderência, então três deles caem no balde "não há base de
# comparação" — que é literalmente o que "sem contrato cadastrado" significa para
# quem vai tratar a pendência.
MOTIVO_PARA_TIPO: dict[str, tuple[str, str]] = {
    "ValorAcimaDoContrato": ("Valor diferente", "Alta"),
    "UnidadeNaoCoberta": ("Unidade não identificada", "Média"),
    "SemContratoCadastrado": ("Sem contrato cadastrado", "Média"),
    "ForaDaVigencia": ("Sem contrato cadastrado", "Média"),
    "ValorIlegivel": ("Sem contrato cadastrado", "Baixa"),
    "CompetenciaIndefinida": ("Sem contrato cadastrado", "Baixa"),
}

# Prioridade: Alta quando há dinheiro retido por divergência de valor; Média
# quando falta cadastro interno (pedido não criado, unidade fora do contrato);
# Baixa no resto.
CONFERENCIA_PARA_TIPO: dict[str, tuple[str, str, str]] = {
    "Divergente": ("Valor diferente", "Alta", "Contas a Pagar"),
    "PedidoNaoLocalizado": ("Pedido não encontrado", "Média", "Área Requisitante"),
}

ORDEM_PRIORIDADE = {"Alta": 0, "Média": 1, "Baixa": 2}


def _reais(valor: Decimal | None) -> str:
    """`R$ 10.980,75` — a descrição é lida por gente, não por máquina."""
    if valor is None:
        return "valor não informado"
    inteiro, _, centavos = f"{valor:.2f}".partition(".")
    milhares = f"{int(inteiro):,}".replace(",", ".")
    return f"R$ {milhares},{centavos}"


def _percentual(valor: Decimal) -> str:
    return f"{valor:+.2f}".replace(".", ",") + "%"


def _descricao_medicao(dossie: GovDossie) -> str:
    """Prefere a explicação que o próprio agente escreveu; só compõe na falta dela."""
    if dossie.medicao_explicacao:
        return dossie.medicao_explicacao

    cobrado = dossie.medicao_valor_cobrado
    contratado = dossie.medicao_valor_contratado
    if cobrado is not None and contratado is not None and contratado != 0:
        excedente = (cobrado - contratado) / contratado * 100
        return (
            f"Valor cobrado {_reais(cobrado)} excede o contratado "
            f"{_reais(contratado)} ({_percentual(excedente)})."
        )
    return f"Medição não aderente ({dossie.medicao_motivo or 'motivo não informado'})."


def _descricao_conferencia(dossie: GovDossie) -> str:
    if dossie.conferencia_explicacao:
        return dossie.conferencia_explicacao
    if dossie.conferencia_divergencias:
        return " ".join(dossie.conferencia_divergencias)
    if dossie.conferencia_situacao == "PedidoNaoLocalizado":
        return "Nenhum pedido de compra foi localizado no Linx para este documento."
    return "Documento diverge do pedido de compra."


def _pendencias_do_dossie(dossie: GovDossie) -> list[Pendencia]:
    """No máximo uma pendência de medição e uma de conferência, nesta ordem.

    O `id` é `dossie.id * 10 + índice`: derivado, estável entre requisições (a
    tela usa como chave de lista) e sem risco de colisão, porque o índice nunca
    passa de 9.
    """
    encontradas: list[tuple[int, str, str, str, str]] = []

    if dossie.medicao_situacao and dossie.medicao_situacao != "Aderente":
        tipo, prioridade = MOTIVO_PARA_TIPO.get(
            dossie.medicao_motivo or "", ("Sem contrato cadastrado", "Baixa")
        )
        encontradas.append((0, tipo, prioridade, _descricao_medicao(dossie), "Contas a Pagar"))

    if dossie.conferencia_situacao and dossie.conferencia_situacao != "Conforme":
        tipo, prioridade, responsavel = CONFERENCIA_PARA_TIPO[dossie.conferencia_situacao]
        encontradas.append(
            (1, tipo, prioridade, _descricao_conferencia(dossie), responsavel)
        )

    if not encontradas:
        # Dossiê travado sem laudo que explique: PendenteConferenciaHumana antes
        # de a medição rodar. Some da fila seria pior do que uma linha genérica —
        # é justamente a nota que ninguém está olhando.
        encontradas.append(
            (
                0,
                "Sem contrato cadastrado",
                "Baixa",
                "Lançamento retido para conferência humana; nenhuma etapa automática "
                "produziu laudo.",
                "Contas a Pagar",
            )
        )

    return [
        Pendencia(
            id=dossie.id * 10 + indice,
            fatura_id=dossie.id,
            referencia=dossie.lancamento_referencia,
            tipo=tipo,
            prioridade=prioridade,
            descricao=descricao,
            fornecedor=dossie.fornecedor_nome,
            unidade=dossie.unidade,
            valor=dossie.valor,
            competencia=dossie.competencia,
            aberta_em=dossie.processado_em,
            responsavel=responsavel,
        )
        for indice, tipo, prioridade, descricao, responsavel in encontradas
    ]


async def listar(sessao: AsyncSession) -> list[Pendencia]:
    dossies = (
        await sessao.scalars(
            select(GovDossie)
            .where(GovDossie.desfecho != LIBERADO)
            .order_by(GovDossie.processado_em.desc(), GovDossie.id.desc())
        )
    ).all()

    pendencias = [p for dossie in dossies for p in _pendencias_do_dossie(dossie)]

    # Mais grave primeiro, mais recente antes dentro da mesma gravidade: é a
    # ordem em que a fila é efetivamente trabalhada.
    pendencias.sort(key=lambda p: (ORDEM_PRIORIDADE[p.prioridade], -p.aberta_em.timestamp()))
    return pendencias
