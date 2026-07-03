from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.api.schemas import ConfiguracaoAPFCreate, ConfiguracaoAPFOut
from app.database import get_db
from app.models.configuracao_apf import ConfiguracaoAPF
from app.models.usuario import Usuario

router = APIRouter(tags=["APF Config"])


@router.get("/apf-config/atual", response_model=ConfiguracaoAPFOut)
async def get_config_atual(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ConfiguracaoAPF)
        .where(ConfiguracaoAPF.ativa == True)  # noqa: E712
        .order_by(ConfiguracaoAPF.created_at.desc())
        .limit(1)
    )
    config = result.scalar_one_or_none()
    if not config:
        raise HTTPException(status_code=404, detail="Nenhuma configuração APF ativa encontrada.")
    return config


@router.post("/apf-config", response_model=ConfiguracaoAPFOut)
async def criar_config(
    data: ConfiguracaoAPFCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    if current_user.role.value != "controle":
        raise HTTPException(status_code=403, detail="Apenas a Governança pode salvar configurações APF.")

    # Desativa todas as configurações anteriores
    await db.execute(update(ConfiguracaoAPF).values(ativa=False))

    payload = data.model_dump()
    config = ConfiguracaoAPF(**payload, criado_por=current_user.id, ativa=True)
    db.add(config)
    await db.commit()
    await db.refresh(config)
    return config


@router.get("/apf-config", response_model=list[ConfiguracaoAPFOut])
async def listar_configs(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    if current_user.role.value != "controle":
        raise HTTPException(status_code=403, detail="Acesso restrito.")
    result = await db.execute(
        select(ConfiguracaoAPF).order_by(ConfiguracaoAPF.created_at.desc())
    )
    return result.scalars().all()
