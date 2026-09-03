"""Regras de negócio de contratos.

Todo o comportamento vive aqui — o router só traduz HTTP. A regra mais importante não é
CRUD: é impedir que exista mais de um contrato válido para o mesmo fornecedor no mesmo
período. Se existirem dois, a etapa 4 escolhe um deles sem critério, e a medição passa a
depender da ordem de cadastro. Um erro assim não levanta exceção nenhuma — só produz nota
aprovada contra o teto errado.
"""

from __future__ import annotations

from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.governanca.models.contrato import GovContrato, GovContratoItem, GovFornecedor
from app.governanca.schemas.contrato import ContratoEntrada, ContratoResumo


class ErroDeNegocio(Exception):
    """Violação de regra que o usuário pode corrigir — vira 409/422, nunca 500."""

    def __init__(self, mensagem: str, campo: str | None = None) -> None:
        super().__init__(mensagem)
        self.mensagem = mensagem
        self.campo = campo


class NaoEncontrado(Exception):
    pass


async def listar(sessao: AsyncSession, *, apenas_ativos: bool = False) -> list[ContratoResumo]:
    consulta = (
        select(
            GovContrato,
            func.count(GovContratoItem.id).label("total_itens"),
            func.coalesce(func.sum(GovContratoItem.valor_mensal), 0).label("valor_mensal_total"),
        )
        .outerjoin(GovContratoItem, GovContratoItem.contrato_id == GovContrato.id)
        .group_by(GovContrato.id)
        .order_by(GovContrato.fornecedor_nome, GovContrato.numero)
    )

    if apenas_ativos:
        consulta = consulta.where(GovContrato.ativo.is_(True))

    linhas = (await sessao.execute(consulta)).all()

    return [
        ContratoResumo(
            id=c.id,
            numero=c.numero,
            fornecedor_nome=c.fornecedor_nome,
            fornecedor_cnpj=c.fornecedor_cnpj,
            categoria_servico=c.categoria_servico,
            vigencia_inicio=c.vigencia_inicio,
            vigencia_fim=c.vigencia_fim,
            tolerancia_percentual=c.tolerancia_percentual,
            ativo=c.ativo,
            total_itens=total,
            valor_mensal_total=Decimal(soma),
        )
        for c, total, soma in linhas
    ]


async def obter(sessao: AsyncSession, contrato_id: int) -> GovContrato:
    contrato = await sessao.scalar(
        select(GovContrato).options(selectinload(GovContrato.itens)).where(GovContrato.id == contrato_id)
    )
    if contrato is None:
        raise NaoEncontrado(f"Contrato {contrato_id} não encontrado.")
    return contrato


async def _garantir_sem_sobreposicao(
    sessao: AsyncSession, dados: ContratoEntrada, *, ignorar_id: int | None = None
) -> None:
    """Recusa dois contratos ativos do mesmo CNPJ com vigências que se cruzam.

    Vigência aberta (sem início ou sem fim) conta como "vale sempre" desse lado — é o que
    o usuário quer dizer ao deixar o campo vazio, e ignorar isso deixaria a checagem
    passar justamente no caso mais perigoso.
    """
    if not dados.ativo:
        return

    consulta = select(GovContrato).where(
        GovContrato.fornecedor_cnpj == dados.fornecedor_cnpj,
        GovContrato.ativo.is_(True),
    )
    if ignorar_id is not None:
        consulta = consulta.where(GovContrato.id != ignorar_id)

    for existente in (await sessao.scalars(consulta)).all():
        comeca_depois_do_fim = (
            dados.vigencia_inicio is not None
            and existente.vigencia_fim is not None
            and dados.vigencia_inicio > existente.vigencia_fim
        )
        termina_antes_do_inicio = (
            dados.vigencia_fim is not None
            and existente.vigencia_inicio is not None
            and dados.vigencia_fim < existente.vigencia_inicio
        )
        if comeca_depois_do_fim or termina_antes_do_inicio:
            continue

        raise ErroDeNegocio(
            f"O contrato {existente.numero} já cobre este fornecedor no mesmo período. "
            "Encerre a vigência dele ou marque-o como inativo antes de cadastrar outro.",
            campo="vigencia_inicio",
        )


async def _garantir_fornecedor(sessao: AsyncSession, dados: ContratoEntrada) -> str:
    """Cria o fornecedor se ele ainda não existe, a partir dos dados do próprio contrato.

    O contrato já carrega nome, CNPJ e e-mail de faturamento — exigir um cadastro
    separado antes só para satisfazer a chave estrangeira transformaria a primeira
    tarefa do usuário em duas, sem acrescentar informação nenhuma.

    Quando o id não vem, ele é derivado do CNPJ. Assim dois contratos do mesmo
    fornecedor apontam para a mesma linha em vez de duplicá-la.
    """
    identificador = (dados.fornecedor_id or "").strip().lower()
    if not identificador:
        digitos = "".join(c for c in dados.fornecedor_cnpj if c.isdigit())
        identificador = f"cnpj-{digitos}"

    fornecedor = await sessao.get(GovFornecedor, identificador)
    if fornecedor is None:
        sessao.add(
            GovFornecedor(
                id=identificador,
                nome=dados.fornecedor_nome,
                cnpj=dados.fornecedor_cnpj,
                email_faturamento=dados.email_fornecedor,
            )
        )
        await sessao.flush()

    return identificador


async def _aplicar(sessao: AsyncSession, contrato: GovContrato, dados: ContratoEntrada) -> None:
    for campo, valor in dados.model_dump(exclude={"itens"}).items():
        setattr(contrato, campo, valor)

    # Substituir a coleção inteira (em vez de casar item a item) é intencional: o
    # formulário envia o estado final do contrato, e `delete-orphan` remove o resto.
    #
    # O `flush` entre limpar e repovoar NÃO é zelo: sem ele o SQLAlchemy emite os
    # INSERTs das linhas novas antes dos DELETEs das antigas, e a UNIQUE
    # (contrato_id, unidade) estoura em toda edição que mantenha alguma unidade —
    # que é o caso normal. O erro só aparece ao editar, nunca ao criar.
    if contrato.itens:
        contrato.itens.clear()
        await sessao.flush()

    contrato.itens = [
        GovContratoItem(
            unidade=item.unidade,
            descricao=item.descricao,
            valor_mensal=item.valor_mensal,
        )
        for item in dados.itens
    ]


async def criar(sessao: AsyncSession, dados: ContratoEntrada) -> GovContrato:
    await _garantir_sem_sobreposicao(sessao, dados)
    identificador = await _garantir_fornecedor(sessao, dados)

    contrato = GovContrato()
    await _aplicar(sessao, contrato, dados)
    contrato.fornecedor_id = identificador
    sessao.add(contrato)

    try:
        await sessao.commit()
    except IntegrityError as erro:
        await sessao.rollback()
        if "contratos_numero_key" in str(erro.orig):
            raise ErroDeNegocio(
                f"Já existe um contrato com o número {dados.numero}.", campo="numero"
            ) from erro
        # Qualquer outra violação ainda é problema de dado, não do servidor: devolver
        # 500 esconderia do usuário exatamente o que ele precisa corrigir.
        raise ErroDeNegocio(f"O banco recusou os dados do contrato: {erro.orig}") from erro

    return await obter(sessao, contrato.id)


async def atualizar(sessao: AsyncSession, contrato_id: int, dados: ContratoEntrada) -> GovContrato:
    contrato = await obter(sessao, contrato_id)
    await _garantir_sem_sobreposicao(sessao, dados, ignorar_id=contrato_id)
    identificador = await _garantir_fornecedor(sessao, dados)

    await _aplicar(sessao, contrato, dados)
    contrato.fornecedor_id = identificador

    try:
        await sessao.commit()
    except IntegrityError as erro:
        await sessao.rollback()
        if "contratos_numero_key" in str(erro.orig):
            raise ErroDeNegocio(
                f"Já existe um contrato com o número {dados.numero}.", campo="numero"
            ) from erro
        # Qualquer outra violação ainda é problema de dado, não do servidor: devolver
        # 500 esconderia do usuário exatamente o que ele precisa corrigir.
        raise ErroDeNegocio(f"O banco recusou os dados do contrato: {erro.orig}") from erro

    return await obter(sessao, contrato_id)


async def excluir(sessao: AsyncSession, contrato_id: int) -> None:
    """Inativa em vez de apagar.

    Um dossiê já emitido cita o número do contrato usado na medição. Apagar a linha
    deixaria a auditoria sem o teto contra o qual a nota foi comparada — exatamente a
    pergunta que uma auditoria faz.
    """
    contrato = await obter(sessao, contrato_id)
    contrato.ativo = False
    await sessao.commit()
