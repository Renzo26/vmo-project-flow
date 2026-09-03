"""Schema dos cartões do dashboard."""

from __future__ import annotations

from pydantic import BaseModel

from app.governanca.schemas.comuns import DataHora, Dinheiro


class Indicadores(BaseModel):
    """Os números do topo da tela, todos da MESMA competência.

    `conciliadas + divergentes + pendentes == total_faturas`: a tela soma os
    cartões e o usuário percebe na hora se a conta não fecha.

    `economia_identificada` tem campo próprio, e não derivado na tela, porque é o
    número que justifica o projeto — a soma do que foi cobrado a mais e a medição
    barrou antes de virar pagamento.
    """

    competencia: str
    total_faturas: int
    conciliadas: int
    divergentes: int
    pendentes: int
    valor_total: Dinheiro
    valor_liberado: Dinheiro
    valor_retido: Dinheiro
    economia_identificada: Dinheiro
    ultima_execucao: DataHora | None = None
