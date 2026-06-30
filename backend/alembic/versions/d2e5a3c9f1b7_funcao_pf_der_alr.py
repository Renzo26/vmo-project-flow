"""funcoes_pf: DER e ALR para complexidade APF detalhada

Revision ID: d2e5a3c9f1b7
Revises: c1d4f2a8b6e3
Create Date: 2026-06-29 09:30:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "d2e5a3c9f1b7"
down_revision: Union[str, None] = "c1d4f2a8b6e3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("funcoes_pf", sa.Column("der", sa.Integer(), nullable=True))
    op.add_column("funcoes_pf", sa.Column("alr", sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column("funcoes_pf", "alr")
    op.drop_column("funcoes_pf", "der")
