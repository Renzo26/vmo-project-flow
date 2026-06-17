"""add analise_proposta

Revision ID: b9c3e1f72a04
Revises: 34eb176e2f7b
Create Date: 2026-06-17 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "b9c3e1f72a04"
down_revision: Union[str, None] = "34eb176e2f7b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "analise_proposta",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("solicitacao_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("proposta_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("pf_contagem", sa.Float(), nullable=True),
        sa.Column("pf_proposta", sa.Float(), nullable=True),
        sa.Column("variacao_pct", sa.Float(), nullable=True),
        sa.Column("status", sa.String(length=30), nullable=False),
        sa.Column("resumo", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["solicitacao_id"], ["solicitacoes.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["proposta_id"], ["propostas.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_analise_proposta_solicitacao_id", "analise_proposta", ["solicitacao_id"])


def downgrade() -> None:
    op.drop_index("ix_analise_proposta_solicitacao_id", table_name="analise_proposta")
    op.drop_table("analise_proposta")
