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

SEED_FORNECEDORES = [
    {
        "fornecedor": {
            "nome": "TechSoft Soluções",
            "cnpj": "00.000.000/0001-00",
            "email": "fornecedor@vmo.com",
            "telefone": "(11) 90000-0000",
            "categorias": "Desenvolvimento de Software",
        },
        "usuario": {
            "nome": "Contato TechSoft",
            "email": "fornecedor@vmo.com",
            "team": "TechSoft Soluções",
        },
    },
    {
        "fornecedor": {
            "nome": "InfoSystems Ltda",
            "cnpj": "11.111.111/0001-11",
            "email": "fornecedor2@vmo.com",
            "telefone": "(21) 91111-1111",
            "categorias": "QA e Testes, Desenvolvimento de Software",
        },
        "usuario": {
            "nome": "Contato InfoSystems",
            "email": "fornecedor2@vmo.com",
            "team": "InfoSystems Ltda",
        },
    },
    {
        "fornecedor": {
            "nome": "DataBridge Corp",
            "cnpj": "22.222.222/0001-22",
            "email": "fornecedor3@vmo.com",
            "telefone": "(31) 92222-2222",
            "categorias": "Dados e Analytics, Infraestrutura e Cloud",
        },
        "usuario": {
            "nome": "Contato DataBridge",
            "email": "fornecedor3@vmo.com",
            "team": "DataBridge Corp",
        },
    },
]

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

        # --- Fornecedores + usuários vinculados ---
        for seed in SEED_FORNECEDORES:
            f_data = seed["fornecedor"]
            u_data = seed["usuario"]

            existing_user = await db.scalar(select(Usuario).where(Usuario.email == u_data["email"]))
            if existing_user:
                print(f"= já existe: {u_data['email']}")
                continue

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
            print(f"+ criado: {u_data['email']} (senha: {SENHA_PADRAO})")

        await db.commit()
    print("Seed concluído.")


if __name__ == "__main__":
    asyncio.run(main())
