import io

import pdfplumber
from docx import Document
from openpyxl import load_workbook

MAX_CHARS = 60_000


class UnsupportedDocumentError(Exception):
    pass


def _from_xlsx(data: bytes) -> str:
    workbook = load_workbook(filename=io.BytesIO(data), read_only=True, data_only=True)
    parts: list[str] = []
    for sheet in workbook.worksheets:
        parts.append(f"## Planilha: {sheet.title}")
        for row in sheet.iter_rows(values_only=True):
            cells = [str(c).strip() for c in row if c is not None and str(c).strip()]
            if cells:
                parts.append(" | ".join(cells))
    workbook.close()
    return "\n".join(parts)


def _from_csv(data: bytes) -> str:
    for encoding in ("utf-8-sig", "utf-8", "latin-1"):
        try:
            return data.decode(encoding)
        except UnicodeDecodeError:
            continue
    return data.decode("utf-8", errors="replace")


def _from_pdf(data: bytes) -> str:
    parts: list[str] = []
    with pdfplumber.open(io.BytesIO(data)) as pdf:
        for page in pdf.pages:
            text = page.extract_text() or ""
            if text.strip():
                parts.append(text)
            for table in page.extract_tables():
                for row in table:
                    cells = [str(c).strip() for c in row if c]
                    if cells:
                        parts.append(" | ".join(cells))
    return "\n".join(parts)


def _from_docx(data: bytes) -> str:
    document = Document(io.BytesIO(data))
    parts: list[str] = [p.text for p in document.paragraphs if p.text.strip()]
    for table in document.tables:
        for row in table.rows:
            cells = [cell.text.strip() for cell in row.cells if cell.text.strip()]
            if cells:
                parts.append(" | ".join(cells))
    return "\n".join(parts)


def extract_text(filename: str, data: bytes) -> str:
    name = (filename or "").lower()
    if name.endswith((".xlsx", ".xlsm")):
        text = _from_xlsx(data)
    elif name.endswith(".csv"):
        text = _from_csv(data)
    elif name.endswith(".pdf"):
        text = _from_pdf(data)
    elif name.endswith(".docx"):
        text = _from_docx(data)
    else:
        raise UnsupportedDocumentError(
            "Formato não suportado. Envie .xlsx, .csv, .pdf ou .docx."
        )

    text = text.strip()
    if not text:
        raise UnsupportedDocumentError(
            "Não foi possível extrair texto do documento enviado."
        )
    return text[:MAX_CHARS]
