import logging
from contextlib import asynccontextmanager

from dotenv import load_dotenv

load_dotenv()  # garante que o .env é carregado antes dos imports que usam settings

from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.schemas import AnaliseResponse, Methodology
from app.services.ai_agent import analyze_document
from app.services.document_parser import UnsupportedDocumentError, extract_text
from app.services.template_reader import get_expected_fields
from app.services.storage_service import StorageError, ensure_bucket
from app.api import auth, fornecedores, solicitacoes, pf, apf_config
from app.governanca.router import router as governanca_router
import app.governanca.models  # noqa: F401 — registra modelos no Base.metadata

logger = logging.getLogger("entrada_pf")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Garante que o bucket do Supabase Storage existe antes de aceitar uploads.
    if settings.supabase_url and settings.supabase_service_key:
        try:
            await ensure_bucket()
            logger.info("Supabase Storage: bucket '%s' pronto.", settings.supabase_bucket)
        except Exception as exc:  # noqa: BLE001
            logger.warning("Supabase Storage: falha ao verificar bucket — %s", exc)
    yield


app = FastAPI(title="VMO API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_origin_regex=r"https?://.*\.easypanel\.host",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(fornecedores.router, prefix="/api")
app.include_router(solicitacoes.router, prefix="/api")
app.include_router(pf.router, prefix="/api")
app.include_router(apf_config.router, prefix="/api")
app.include_router(governanca_router, prefix="/api/governanca")


@app.exception_handler(StorageError)
async def storage_error_handler(request: Request, exc: StorageError) -> JSONResponse:
    return JSONResponse(status_code=503, content={"detail": str(exc)})

MAX_FILE_BYTES = 15 * 1024 * 1024  # 15 MB


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/api/entrada-pf/analisar", response_model=AnaliseResponse)
async def analisar_entrada_pf(
    metodologia: Methodology = Form(...),
    arquivo: UploadFile = File(...),
) -> AnaliseResponse:
    data = await arquivo.read()
    if not data:
        raise HTTPException(status_code=400, detail="Arquivo vazio.")
    if len(data) > MAX_FILE_BYTES:
        raise HTTPException(status_code=413, detail="Arquivo excede o limite de 15 MB.")

    try:
        document_text = extract_text(arquivo.filename or "", data)
    except UnsupportedDocumentError as exc:
        raise HTTPException(status_code=415, detail=str(exc)) from exc

    try:
        expected_fields = get_expected_fields(metodologia)
    except (FileNotFoundError, ValueError) as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    try:
        return analyze_document(
            methodology=metodologia,
            filename=arquivo.filename or "documento",
            document_text=document_text,
            expected_fields=expected_fields,
        )
    except Exception as exc:  # noqa: BLE001
        logger.exception("Falha ao analisar documento com a IA")
        raise HTTPException(
            status_code=502,
            detail="Falha ao processar o documento com o agente de IA. Tente novamente.",
        ) from exc
