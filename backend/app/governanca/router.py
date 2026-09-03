from fastapi import APIRouter

from app.governanca.api.cadastros import roteador as roteador_cadastros
from app.governanca.api.contratos import roteador as roteador_contratos
from app.governanca.api.faturas import roteador as roteador_faturas
from app.governanca.api.indicadores import roteador as roteador_indicadores
from app.governanca.api.ingestao import roteador as roteador_ingestao
from app.governanca.api.pendencias import roteador as roteador_pendencias

router = APIRouter(tags=["governanca"])
router.include_router(roteador_contratos)
router.include_router(roteador_indicadores)
router.include_router(roteador_faturas)
router.include_router(roteador_pendencias)
router.include_router(roteador_cadastros)
router.include_router(roteador_ingestao)
