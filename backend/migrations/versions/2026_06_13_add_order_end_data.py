"""add order end_data

Revision ID: e7f1a2b3c4d5
Revises: c4d7e9a1b2f3
Create Date: 2026-06-13 13:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e7f1a2b3c4d5'
down_revision: Union[str, None] = 'c4d7e9a1b2f3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('order', sa.Column('end_data', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column('order', 'end_data')
