"""Tipos compartilhados pelos schemas de leitura.

Duas conversões aparecem em quase toda resposta e por isso moram aqui em vez de
serem repetidas em cada modelo:

* **Dinheiro sai como string decimal.** `float` para valor de nota é erro de
  arredondamento esperando uma auditoria, e o front conta com `"18450.00"` —
  string com duas casas SEMPRE, inclusive para valores calculados (divergência,
  percentual), que nascem com escala indefinida.

* **Data-hora sai no fuso de Brasília.** O banco guarda em UTC; devolver UTC
  faria a tela mostrar "02:15" como "05:15" a menos que ela convertesse. O
  Brasil não tem horário de verão desde 2019, então o offset fixo -03:00 é
  correto e não depende do banco de fusos do sistema operacional (que no
  Windows exige o pacote `tzdata`).
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from decimal import ROUND_HALF_UP, Decimal
from typing import Annotated

from pydantic import PlainSerializer

FUSO_BRASILIA = timezone(timedelta(hours=-3))

_DUAS_CASAS = Decimal("0.01")


def formatar_decimal(valor: Decimal) -> str:
    return str(valor.quantize(_DUAS_CASAS, rounding=ROUND_HALF_UP))


def formatar_data_hora(valor: datetime) -> str:
    # Data-hora sem fuso vinda do banco é UTC por convenção do esquema
    # (todas as colunas são TIMESTAMPTZ); assumir isso é melhor do que
    # devolver um instante ambíguo.
    if valor.tzinfo is None:
        valor = valor.replace(tzinfo=timezone.utc)
    return valor.astimezone(FUSO_BRASILIA).isoformat()


Dinheiro = Annotated[Decimal, PlainSerializer(formatar_decimal, return_type=str)]
"""Valor monetário — sempre string com duas casas, nunca `float`."""

Percentual = Annotated[Decimal, PlainSerializer(formatar_decimal, return_type=str)]
"""Percentual em pontos (`"50.00"` = 50%), mesma disciplina de escala do dinheiro."""

DataHora = Annotated[datetime, PlainSerializer(formatar_data_hora, return_type=str)]
"""ISO 8601 no fuso de Brasília."""
