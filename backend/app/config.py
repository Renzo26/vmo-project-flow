import os
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent

# No Docker, lê apenas variáveis de ambiente. Localmente, lê do .env
_env_file = None if os.environ.get("RUNNING_IN_DOCKER") else BASE_DIR / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_env_file,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # OpenAI (módulo de análise de documentos)
    openai_api_key: str
    openai_model: str = "gpt-4o-mini"
    template_path: str = "../Documentos_regras/Padrão de Entrada PF.xlsx"

    # Banco de dados — Supabase Postgres (Session Pooler IPv4)
    database_url: str

    # Autenticação JWT
    jwt_secret: str = "dev-secret-troque-em-producao-com-pelo-menos-256-bits"
    jwt_alg: str = "HS256"
    jwt_ttl_min: int = 60 * 8  # 8 horas

    # Supabase Storage (anexos / propostas)
    supabase_url: str = ""
    supabase_service_key: str = ""
    supabase_bucket: str = "anexos"

    # CORS
    cors_origins: str = "http://localhost:8080,http://localhost:5173,http://127.0.0.1:8080"

    @property
    def template_file(self) -> Path:
        path = Path(self.template_path)
        if not path.is_absolute():
            path = (BASE_DIR / path).resolve()
        return path

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
