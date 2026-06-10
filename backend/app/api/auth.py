from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser
from app.api.schemas import LoginRequest, LoginResponse, UsuarioOut
from app.database import get_db
from app.models import Usuario
from app.security import create_access_token, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
async def login(
    body: LoginRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> LoginResponse:
    user = await db.scalar(select(Usuario).where(Usuario.email == body.email.lower()))
    if user is None or not verify_password(body.senha, user.senha_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais inválidas.")
    if not user.ativo:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Usuário inativo.")
    token = create_access_token(subject=str(user.id), role=user.role.value)
    return LoginResponse(access_token=token, user=UsuarioOut.model_validate(user))


@router.get("/me", response_model=UsuarioOut)
async def me(user: CurrentUser) -> UsuarioOut:
    return UsuarioOut.model_validate(user)
