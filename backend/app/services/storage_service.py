"""Cliente do Supabase Storage (REST) para anexos e propostas.

Requer SUPABASE_URL e SUPABASE_SERVICE_KEY no .env. O bucket é privado;
o acesso aos arquivos é feito por URL assinada temporária.
"""
import re
import unicodedata

import httpx

from app.config import settings


def safe_filename(filename: str) -> str:
    """Converte um nome de arquivo para uma chave segura para o Supabase Storage.

    Remove acentos, substitui espaços e caracteres especiais por underscore,
    preservando a extensão original.
    """
    # Normaliza unicode (NFD) e descarta os diacríticos (combinando marks)
    normalized = unicodedata.normalize("NFD", filename)
    ascii_str = normalized.encode("ascii", "ignore").decode("ascii")
    # Mantém apenas letras, dígitos, pontos, hifens e underscores
    safe = re.sub(r"[^a-zA-Z0-9._-]", "_", ascii_str)
    # Colapsa múltiplos underscores em um
    safe = re.sub(r"_+", "_", safe).strip("_")
    return safe or "arquivo"


class StorageError(Exception):
    pass


def _headers() -> dict:
    if not settings.supabase_url or not settings.supabase_service_key:
        raise StorageError(
            "Supabase Storage não configurado. Defina SUPABASE_URL e "
            "SUPABASE_SERVICE_KEY no backend/.env."
        )
    return {
        "Authorization": f"Bearer {settings.supabase_service_key}",
        "apikey": settings.supabase_service_key,
    }


def _base() -> str:
    return settings.supabase_url.rstrip("/") + "/storage/v1"


async def ensure_bucket() -> None:
    """Cria o bucket privado se ainda não existir (idempotente)."""
    headers = _headers()
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(f"{_base()}/bucket/{settings.supabase_bucket}", headers=headers)
        if resp.status_code == 200:
            return
        create = await client.post(
            f"{_base()}/bucket",
            headers=headers,
            json={"id": settings.supabase_bucket, "name": settings.supabase_bucket, "public": False},
        )
        if create.status_code not in (200, 201):
            raise StorageError(f"Falha ao criar bucket: {create.status_code} {create.text}")


async def upload(path: str, data: bytes, content_type: str | None = None) -> str:
    """Sobe o arquivo e retorna o path interno (bucket/path)."""
    headers = _headers()
    headers["x-upsert"] = "true"
    if content_type:
        headers["Content-Type"] = content_type
    url = f"{_base()}/object/{settings.supabase_bucket}/{path}"
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(url, headers=headers, content=data)
        if resp.status_code not in (200, 201):
            raise StorageError(f"Falha no upload: {resp.status_code} {resp.text}")
    return path


async def create_signed_url(path: str, expires_in: int = 3600) -> str | None:
    """Gera uma URL assinada temporária para download. None se não houver path."""
    if not path:
        return None
    headers = _headers()
    url = f"{_base()}/object/sign/{settings.supabase_bucket}/{path}"
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(url, headers=headers, json={"expiresIn": expires_in})
        if resp.status_code != 200:
            raise StorageError(f"Falha ao assinar URL: {resp.status_code} {resp.text}")
        signed = resp.json().get("signedURL") or resp.json().get("signedUrl")
    if not signed:
        return None
    return settings.supabase_url.rstrip("/") + "/storage/v1" + signed
