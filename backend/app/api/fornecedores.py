from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser, require_role
from app.api.schemas import FornecedorCreate, FornecedorOut, FornecedorResumo
from app.database import get_db
from app.models import Fornecedor, Usuario, UserRole
from app.security import hash_password

router = APIRouter(prefix="/fornecedores", tags=["fornecedores"])

ControleUser = Annotated[Usuario, Depends(require_role(UserRole.controle))]


@router.get("/lista", response_model=list[FornecedorResumo])
async def listar_resumo(
    _: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[Fornecedor]:
    """Retorna id+nome de todos os fornecedores. Acessível a qualquer usuário autenticado."""
    rows = await db.scalars(select(Fornecedor).order_by(Fornecedor.nome))
    return list(rows)


@router.get("", response_model=list[FornecedorOut])
async def listar(
    _: ControleUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[Fornecedor]:
    rows = await db.scalars(select(Fornecedor).order_by(Fornecedor.created_at.desc()))
    return list(rows)


@router.post("", response_model=FornecedorOut, status_code=status.HTTP_201_CREATED)
async def criar(
    body: FornecedorCreate,
    _: ControleUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Fornecedor:
    email = body.email.lower()
    existing = await db.scalar(select(Usuario).where(Usuario.email == email))
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Já existe um usuário com este e-mail.")

    fornecedor = Fornecedor(
        nome=body.nome,
        cnpj=body.cnpj,
        email=email,
        telefone=body.telefone,
        categorias=body.categorias,
    )
    db.add(fornecedor)
    await db.flush()  # garante o id

    login = Usuario(
        nome=body.nome,
        email=email,
        senha_hash=hash_password(body.senha),
        role=UserRole.fornecedor,
        team=body.nome,
        fornecedor_id=fornecedor.id,
        ativo=True,
    )
    db.add(login)
    await db.flush()
    await db.refresh(fornecedor)
    return fornecedor
