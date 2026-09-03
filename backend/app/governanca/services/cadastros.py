"""Aba Cadastros — fornecedores e unidades.

`fornecedores` é tabela; `unidades` não é. Unidade existe hoje só como o código
que aparece em `contrato_itens.unidade`, e criar tabela para ela agora seria
inventar um cadastro que ninguém pediu — com o custo garantido de mantê-lo
sincronizado com os contratos. Quando houver dado que só a unidade tem
(responsável, cidade, centro de custo), a tabela passa a se pagar.
"""

from __future__ import annotations

from sqlalchemy import case, distinct, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.governanca.models.contrato import GovContrato, GovContratoItem, GovFornecedor
from app.governanca.schemas.cadastro import FornecedorResumo, UnidadeResumo


async def listar_fornecedores(sessao: AsyncSession) -> list[FornecedorResumo]:
    """GovFornecedor com a contagem de contratos ATIVOS.

    `situacao` é derivada dessa contagem: `fornecedores` não tem coluna `ativo`, e
    acrescentar uma criaria um segundo lugar onde a mesma verdade pode divergir —
    fornecedor "ativo" sem contrato válido é fornecedor com quem não se opera.
    """
    ativos = func.count(distinct(case((GovContrato.ativo.is_(True), GovContrato.id))))

    linhas = (
        await sessao.execute(
            select(GovFornecedor, ativos.label("contratos_ativos"))
            .outerjoin(GovContrato, GovContrato.fornecedor_id == GovFornecedor.id)
            .group_by(GovFornecedor.id)
            .order_by(GovFornecedor.nome)
        )
    ).all()

    return [
        FornecedorResumo(
            id=fornecedor.id,
            nome=fornecedor.nome,
            cnpj=fornecedor.cnpj,
            email_faturamento=fornecedor.email_faturamento,
            contratos_ativos=contratos_ativos,
            situacao="Ativo" if contratos_ativos else "Inativo",
        )
        for fornecedor, contratos_ativos in linhas
    ]


async def listar_unidades(sessao: AsyncSession) -> list[UnidadeResumo]:
    """Unidades agregadas a partir dos itens de contrato.

    Devolve o CÓDIGO como identidade e a descrição do contrato como `servico`.
    Não existe nome de unidade no banco, e batizar a descrição de "nome" fazia a
    tela mostrar o serviço na coluna Unidade.

    `contratos` conta todos os contratos que citam a unidade —
    inclusive inativos, porque a unidade continua existindo depois que o contrato
    vence; quem diz se ela está em operação é `situacao`.
    """
    linhas = (
        await sessao.execute(
            select(
                GovContratoItem.unidade,
                # Uma unidade pode aparecer em vários contratos com descrições
                # diferentes; a mais longa costuma ser a que tem o nome completo,
                # e é ela que a tela quer mostrar.
                func.max(GovContratoItem.descricao).label("descricao"),
                func.count(distinct(GovContratoItem.contrato_id)).label("contratos"),
                func.count(
                    distinct(case((GovContrato.ativo.is_(True), GovContrato.id)))
                ).label("contratos_ativos"),
            )
            .join(GovContrato, GovContrato.id == GovContratoItem.contrato_id)
            .group_by(GovContratoItem.unidade)
            .order_by(GovContratoItem.unidade)
        )
    ).all()

    return [
        UnidadeResumo(
            codigo=unidade,
            servico=descricao,
            contratos=contratos,
            situacao="Ativa" if contratos_ativos else "Inativa",
        )
        for unidade, descricao, contratos, contratos_ativos in linhas
    ]
