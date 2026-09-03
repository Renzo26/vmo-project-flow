"""Schema da fila de pendências.

Pendência não é tabela: é uma LEITURA do dossiê. Guardá-la duplicaria o estado —
resolver a divergência no dossiê deixaria a fila desatualizada, que é o pior
defeito possível numa fila de trabalho.
"""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel

from app.governanca.schemas.comuns import DataHora, Dinheiro

TipoPendencia = Literal[
    "Valor diferente",
    "Pedido não encontrado",
    "Unidade não identificada",
    "Sem contrato cadastrado",
]
Prioridade = Literal["Alta", "Média", "Baixa"]


class Pendencia(BaseModel):
    id: int
    fatura_id: int
    referencia: str
    tipo: TipoPendencia
    prioridade: Prioridade
    descricao: str
    fornecedor: str
    unidade: str | None = None
    valor: Dinheiro | None = None
    competencia: str | None = None
    aberta_em: DataHora
    responsavel: str
