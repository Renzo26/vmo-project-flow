"""Seed Braesp: cria 3 usuários (solicitante, controle, fornecedor).

Uso:  python -m scripts.seed_braesp   (a partir da pasta backend, com o venv ativo)
Idempotente — não duplica registros já existentes.

Emails exatamente como solicitados pelo cliente (domínios propositalmente distintos):
  - solicitante@braesptech.com  -> role solicitante
  - controle@brasptech.com      -> role controle  (vê todas as solicitações)
  - fornecedor@braesptech.com   -> role fornecedor (vinculado ao Fornecedor Braesp)
"""
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy import select

from app.database import AsyncSessionLocal
from app.models import Usuario, UserRole, Fornecedor
from app.security import hash_password

SENHA_PADRAO = "braesp123"

SEED_USERS = [
    {"nome": "Solicitante Braesp", "email": "solicitante@braesptech.com", "role": UserRole.solicitante, "team": "Braesp"},
    {"nome": "Controle Braesp",    "email": "controle@brasptech.com",     "role": UserRole.controle,    "team": "Governança Braesp"},
]

SEED_FORNECEDOR = {
    "fornecedor": {
        "nome": "Braesp Tech",
        "cnpj": "33.333.333/0001-33",
        "email": "fornecedor@braesptech.com",
        "telefone": "(11) 93333-3333",
        "categorias": "Desenvolvimento de Software",
    },
    "usuario": {
        "nome": "Fornecedor Braesp",
        "email": "fornecedor@braesptech.com",
        "team": "Braesp Tech",
    },
}


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
            print(f"+ criado: {u['email']} (role={u['role'].value}, senha: {SENHA_PADRAO})")

        # --- Fornecedor + usuário vinculado ---
        f_data = SEED_FORNECEDOR["fornecedor"]
        u_data = SEED_FORNECEDOR["usuario"]

        existing_user = await db.scalar(select(Usuario).where(Usuario.email == u_data["email"]))
        if existing_user:
            print(f"= já existe: {u_data['email']}")
        else:
            fornecedor = await db.scalar(select(Fornecedor).where(Fornecedor.email == f_data["email"]))
            if not fornecedor:
                fornecedor = Fornecedor(**f_data)
                db.add(fornecedor)
                await db.flush()
                print(f"+ fornecedor criado: {fornecedor.nome}")
            else:
                print(f"= fornecedor já existe: {fornecedor.nome}")

            db.add(
                Usuario(
                    nome=u_data["nome"],
                    email=u_data["email"],
                    senha_hash=hash_password(SENHA_PADRAO),
                    role=UserRole.fornecedor,
                    team=u_data["team"],
                    fornecedor_id=fornecedor.id,
                    ativo=True,
                )
            )
            print(f"+ criado: {u_data['email']} (role=fornecedor, senha: {SENHA_PADRAO})")

        await db.commit()
    print("Seed Braesp concluído.")


if __name__ == "__main__":
    asyncio.run(main())
