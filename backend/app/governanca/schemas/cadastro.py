"""Schemas da aba Cadastros — fornecedores e unidades."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel


class FornecedorResumo(BaseModel):
    id: str
    nome: str
    cnpj: str
    email_faturamento: str | None = None
    contratos_ativos: int = 0
    situacao: Literal["Ativo", "Inativo"]


class UnidadeResumo(BaseModel):
    """Unidade não tem tabela própria: é derivada de `contrato_itens.unidade`.

    Criar cadastro de unidade agora seria inventar uma entidade que ninguém pediu.
    Quando houver dado que só a unidade tem (responsável, cidade, centro de custo),
    aí a tabela passa a se pagar.
    """

    codigo: str

    # NÃO existe "nome da unidade" no banco. O que existe é a descrição do serviço
    # contratado naquela unidade — "Limpeza, 2 postos 30h/semana". Chamar isso de
    # `nome` fazia a tela exibir o serviço na coluna Unidade, afirmando algo que o
    # sistema não sabe. O código é a identidade honesta; o serviço vem separado.
    servico: str | None = None
    contratos: int = 0
    situacao: Literal["Ativa", "Inativa"]
