"""Seed inicial: cria usuários Solicitante, Controle Econômico e Fornecedor.

Uso:  python -m scripts.seed   (a partir da pasta backend, com o venv ativo)
Idempotente — não duplica registros já existentes.
"""
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy import select

from app.database import AsyncSessionLocal
from app.models import Usuario, UserRole, Fornecedor
from app.security import hash_password

SEED_USERS = [
    {"nome": "Carlos Mendes",  "email": "solicitante@vmo.com", "role": UserRole.solicitante, "team": "Equipe Digital"},
    {"nome": "Juliana Costa",  "email": "controle@vmo.com",    "role": UserRole.controle,    "team": "Controle Econômico"},
]

SEED_FORNECEDOR = {
    "nome": "TechSoft Soluções",
    "cnpj": "00.000.000/0001-00",
    "email": "fornecedor@vmo.com",
    "telefone": "(11) 90000-0000",
    "categorias": "Desenvolvimento de Software",
}

SEED_FORNECEDOR_USER = {
    "nome": "Contato TechSoft",
    "email": "fornecedor@vmo.com",
    "role": UserRole.fornecedor,
    "team": "TechSoft Soluções",
}

SENHA_PADRAO = "123456"


async def main() -> None:
    async with AsyncSessionLocal() as db:
        # --- Usuários simples (solicitante / controle) ---
        for u in SEED_USERS:
            existing = await db.scalar(select(Usuario).where(Usuario.email == u["email"]))
            if existing:
                print(f"= já existe: {u['email']}")
                continue
            db.add(
                Usuario(
                    nome=u["nome"],
                    email=u["email"],
                    senha_hash=hash_password(SENHA_PADRAO),
                    role=u["role"],
                    team=u["team"],
                    ativo=True,
                )
            )
            print(f"+ criado: {u['email']} (senha: {SENHA_PADRAO})")

        # --- Fornecedor + usuário vinculado ---
        existing_user = await db.scalar(
            select(Usuario).where(Usuario.email == SEED_FORNECEDOR_USER["email"])
        )
        if existing_user:
            print(f"= já existe: {SEED_FORNECEDOR_USER['email']}")
        else:
            # Cria ou reutiliza o registro de fornecedor
            fornecedor = await db.scalar(
                select(Fornecedor).where(Fornecedor.email == SEED_FORNECEDOR["email"])
            )
            if not fornecedor:
                fornecedor = Fornecedor(**SEED_FORNECEDOR)
                db.add(fornecedor)
                await db.flush()  # garante que fornecedor.id está disponível
                print(f"+ fornecedor criado: {fornecedor.nome}")
            else:
                print(f"= fornecedor já existe: {fornecedor.nome}")

            db.add(
                Usuario(
                    nome=SEED_FORNECEDOR_USER["nome"],
                    email=SEED_FORNECEDOR_USER["email"],
                    senha_hash=hash_password(SENHA_PADRAO),
                    role=SEED_FORNECEDOR_USER["role"],
                    team=SEED_FORNECEDOR_USER["team"],
                    fornecedor_id=fornecedor.id,
                    ativo=True,
                )
            )
            print(f"+ criado: {SEED_FORNECEDOR_USER['email']} (senha: {SENHA_PADRAO})")

        await db.commit()
    print("Seed concluído.")


if __name__ == "__main__":
    asyncio.run(main())
