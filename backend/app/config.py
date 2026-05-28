from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    openai_api_key: str
    openai_model: str = "gpt-4o-mini"
    template_path: str = "../Documentos_regras/Padrão de Entrada PF.xlsx"

    @property
    def template_file(self) -> Path:
        path = Path(self.template_path)
        if not path.is_absolute():
            path = (BASE_DIR / path).resolve()
        return path


settings = Settings()
