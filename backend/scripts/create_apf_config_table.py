"""Cria a tabela configuracoes_apf no banco de dados.

Uso:
    cd backend
    .\.venv\Scripts\Activate.ps1
    python -m scripts.create_apf_config_table
"""
import asyncio

from dotenv import load_dotenv

load_dotenv()

from app.database import Base, engine
from app.models.configuracao_apf import ConfiguracaoAPF  # noqa: F401 — registra nos metadados


async def main() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(
            lambda sync_conn: Base.metadata.create_all(
                sync_conn,
                tables=[Base.metadata.tables["configuracoes_apf"]],
                checkfirst=True,
            )
        )
    print("OK: tabela configuracoes_apf criada (ou ja existia).")
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
