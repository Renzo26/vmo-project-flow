import logging

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import AnaliseResponse, Methodology
from app.services.ai_agent import analyze_document
from app.services.document_parser import UnsupportedDocumentError, extract_text
from app.services.template_reader import get_expected_fields

logger = logging.getLogger("entrada_pf")

app = FastAPI(title="VMO — Agente de Entrada PF", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://127.0.0.1:8080"],
    allow_methods=["*"],
    allow_headers=["*"],
)

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
