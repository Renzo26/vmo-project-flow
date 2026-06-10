"""Cria as tabelas contagens_pf e funcoes_pf no banco de dados.

Uso:
    cd backend
    .\.venv\Scripts\Activate.ps1
    python -m scripts.create_pf_tables
"""
import asyncio

from dotenv import load_dotenv

load_dotenv()

from app.database import Base, engine
from app.models.contagem_pf import ContagemPF, FuncaoPF  # noqa: F401 — registra nos metadados


async def main() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(
            lambda sync_conn: Base.metadata.create_all(
                sync_conn,
                tables=[
                    Base.metadata.tables["contagens_pf"],
                    Base.metadata.tables["funcoes_pf"],
                ],
                checkfirst=True,
            )
        )
    print("OK: tabelas contagens_pf e funcoes_pf criadas (ou ja existiam).")
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
