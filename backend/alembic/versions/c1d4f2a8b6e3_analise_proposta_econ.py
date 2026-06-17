"""analise_proposta: valores economicos e parecer por faixa

Revision ID: c1d4f2a8b6e3
Revises: b9c3e1f72a04
Create Date: 2026-06-17 12:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "c1d4f2a8b6e3"
down_revision: Union[str, None] = "b9c3e1f72a04"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("analise_proposta", sa.Column("valor_estimado", sa.Float(), nullable=True))
    op.add_column("analise_proposta", sa.Column("valor_proposta", sa.Float(), nullable=True))
    op.add_column("analise_proposta", sa.Column("acao_recomendada", sa.String(length=30), nullable=True))
    op.add_column("analise_proposta", sa.Column("alcada_requerida", sa.String(length=120), nullable=True))


def downgrade() -> None:
    op.drop_column("analise_proposta", "alcada_requerida")
    op.drop_column("analise_proposta", "acao_recomendada")
    op.drop_column("analise_proposta", "valor_proposta")
    op.drop_column("analise_proposta", "valor_estimado")
