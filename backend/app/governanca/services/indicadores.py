"""Os cartões do dashboard.

Tudo em duas consultas agregadas, não em Python: somar dinheiro trazendo mil
dossiês para a memória é o tipo de coisa que funciona na demonstração e derruba a
tela quando o robô roda por três meses.

A competência é o recorte de TODOS os cartões. Sem recorte, "12 faturas" viraria
o total histórico e o dashboard deixaria de responder à pergunta que ele existe
para responder: como está o mês que está sendo fechado.
"""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.governanca.models.dossie import GovDossie
from app.governanca.models.operacao import GovExecucaoAgente
from app.governanca.schemas.comuns import FUSO_BRASILIA
from app.governanca.schemas.indicador import Indicadores

ZERO = Decimal("0")

LIBERADO = "LiberadoParaPagamento"
DEVOLVIDO = "DevolvidoAoFornecedor"
PENDENTES = ("TravadoAguardandoPedido", "PendenteConferenciaHumana")


async def _competencia_corrente(sessao: AsyncSession) -> str:
    """A competência mais recente com dossiê; na ausência de dados, o mês atual.

    Fixar "mês atual" sempre estaria errado no começo de outubro, quando o que
    está sendo fechado ainda é setembro.
    """
    mais_recente = await sessao.scalar(
        select(func.max(GovDossie.competencia)).where(GovDossie.competencia.is_not(None))
    )
    if mais_recente:
        return mais_recente
    return datetime.now(FUSO_BRASILIA).strftime("%Y-%m")


async def _ultima_execucao(sessao: AsyncSession) -> datetime | None:
    """Quando o robô rodou pela última vez — sem recorte de competência.

    É um fato sobre o robô, não sobre o mês: recortá-lo faria a tela dizer "nunca
    rodou" ao abrir uma competência antiga.
    """
    execucao = await sessao.scalar(
        select(
            func.max(func.coalesce(GovExecucaoAgente.finalizada_em, GovExecucaoAgente.iniciada_em))
        )
    )
    if execucao is not None:
        return execucao
    # Sem registro de execução, o carimbo do último dossiê processado é a melhor
    # aproximação disponível — e continua sendo verdade sobre o robô.
    return await sessao.scalar(select(func.max(GovDossie.processado_em)))


async def obter(sessao: AsyncSession, *, competencia: str | None = None) -> Indicadores:
    alvo = (competencia or "").strip() or await _competencia_corrente(sessao)

    def soma_se(condicao) -> object:
        return func.coalesce(
            func.sum(case((condicao, func.coalesce(GovDossie.valor, 0)), else_=0)), 0
        )

    # Divergência PARA MAIS que a medição barrou. `greatest(..., 0)` porque cobrar
    # abaixo do contrato não é economia identificada — é só um valor menor.
    excedente = func.greatest(
        func.coalesce(GovDossie.medicao_valor_cobrado, 0)
        - func.coalesce(GovDossie.medicao_valor_contratado, 0),
        0,
    )

    linha = (
        await sessao.execute(
            select(
                func.count(GovDossie.id),
                func.count(case((GovDossie.desfecho == LIBERADO, 1))),
                func.count(case((GovDossie.desfecho == DEVOLVIDO, 1))),
                func.count(case((GovDossie.desfecho.in_(PENDENTES), 1))),
                func.coalesce(func.sum(func.coalesce(GovDossie.valor, 0)), 0),
                soma_se(GovDossie.desfecho == LIBERADO),
                soma_se(GovDossie.desfecho != LIBERADO),
                func.coalesce(
                    func.sum(
                        case(
                            (
                                (GovDossie.medicao_situacao == "NaoAderente")
                                & GovDossie.medicao_valor_cobrado.is_not(None)
                                & GovDossie.medicao_valor_contratado.is_not(None),
                                excedente,
                            ),
                            else_=0,
                        )
                    ),
                    0,
                ),
            ).where(GovDossie.competencia == alvo)
        )
    ).one()

    (
        total,
        conciliadas,
        divergentes,
        pendentes,
        valor_total,
        valor_liberado,
        valor_retido,
        economia,
    ) = linha

    return Indicadores(
        competencia=alvo,
        total_faturas=total,
        conciliadas=conciliadas,
        divergentes=divergentes,
        pendentes=pendentes,
        valor_total=Decimal(valor_total),
        valor_liberado=Decimal(valor_liberado),
        valor_retido=Decimal(valor_retido),
        economia_identificada=Decimal(economia),
        ultima_execucao=await _ultima_execucao(sessao),
    )
