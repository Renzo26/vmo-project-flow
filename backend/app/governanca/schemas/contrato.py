"""Schemas de entrada e saída de contratos (Pydantic v2).

O contrato é o teto contra o qual a etapa 4 mede toda nota do fornecedor. Um erro de
digitação aqui não gera erro visível: gera nota errada aprovada, ou nota certa devolvida
ao fornecedor. Por isso a validação é rígida — é mais barato recusar um formulário do que
descobrir o problema três competências depois.
"""

from __future__ import annotations

import re
from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

CNPJ_LIMPO = re.compile(r"\D")


def _formatar_cnpj(bruto: str) -> str:
    """Guarda sempre no formato `00.000.000/0000-00`.

    Normalizar na entrada, e não na consulta, é o que permite casar o CNPJ do contrato
    com o do documento coletado — os portais entregam com e sem máscara.
    """
    digitos = CNPJ_LIMPO.sub("", bruto)
    if len(digitos) != 14:
        raise ValueError("CNPJ deve ter 14 dígitos.")
    return f"{digitos[:2]}.{digitos[2:5]}.{digitos[5:8]}/{digitos[8:12]}-{digitos[12:]}"


class ContratoItemBase(BaseModel):
    unidade: str = Field(min_length=1, max_length=40, description="Código da unidade/loja, ex.: UN-014")
    descricao: str | None = Field(default=None, max_length=2000)
    valor_mensal: Decimal = Field(ge=0, decimal_places=2, max_digits=14)

    @field_validator("unidade")
    @classmethod
    def normalizar_unidade(cls, valor: str) -> str:
        return valor.strip().upper()


class ContratoItemEntrada(ContratoItemBase):
    pass


class ContratoItemSaida(ContratoItemBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


class ContratoBase(BaseModel):
    numero: str = Field(min_length=1, max_length=60)
    fornecedor_cnpj: str = Field(min_length=14, max_length=18)
    fornecedor_nome: str = Field(min_length=1, max_length=200)
    fornecedor_id: str | None = Field(default=None, max_length=64)
    objeto: str | None = Field(default=None, max_length=4000)
    categoria_servico: str | None = Field(
        default=None, max_length=120, description="Vira a pasta de serviço no arquivamento (etapa 9)."
    )
    gestor: str | None = Field(default=None, max_length=120)
    email_fornecedor: str | None = Field(default=None, max_length=200)
    vigencia_inicio: date | None = None
    vigencia_fim: date | None = None

    tolerancia_percentual: Decimal = Field(
        default=Decimal("0"),
        ge=0,
        le=100,
        max_digits=6,
        decimal_places=3,
        description="Divergência aceita PARA MAIS. Cobrar abaixo do contratado nunca reprova.",
    )
    ativo: bool = True

    @field_validator("numero")
    @classmethod
    def normalizar_numero(cls, valor: str) -> str:
        return valor.strip()

    @field_validator("fornecedor_cnpj")
    @classmethod
    def normalizar_cnpj(cls, valor: str) -> str:
        return _formatar_cnpj(valor)

    @model_validator(mode="after")
    def validar_vigencia(self):
        if self.vigencia_inicio and self.vigencia_fim and self.vigencia_fim < self.vigencia_inicio:
            raise ValueError("A vigência final não pode ser anterior à inicial.")
        return self


class ContratoEntrada(ContratoBase):
    itens: list[ContratoItemEntrada] = Field(min_length=1)

    @model_validator(mode="after")
    def validar_itens(self):
        # Contrato sem item não tem teto, e sem teto a etapa 4 não mede nada: a nota
        # cairia em "não mensurável" e viraria trabalho humano. Recusar aqui é mais
        # honesto do que aceitar um contrato que não serve para o que foi criado.
        unidades = [item.unidade for item in self.itens]
        repetidas = {u for u in unidades if unidades.count(u) > 1}
        if repetidas:
            raise ValueError(f"Unidade repetida no contrato: {', '.join(sorted(repetidas))}.")
        return self


class ContratoAtualizacao(ContratoEntrada):
    pass


class ContratoSaida(ContratoBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    itens: list[ContratoItemSaida] = []


class ContratoResumo(BaseModel):
    """Linha da listagem — sem os itens, que só interessam ao abrir o contrato."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    numero: str
    fornecedor_nome: str
    fornecedor_cnpj: str
    categoria_servico: str | None
    vigencia_inicio: date | None
    vigencia_fim: date | None
    tolerancia_percentual: Decimal
    ativo: bool
    total_itens: int = 0
    valor_mensal_total: Decimal = Decimal("0")
