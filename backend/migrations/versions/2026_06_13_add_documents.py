"""add documents table

Revision ID: c4d7e9a1b2f3
Revises: 7df38f4693ae
Create Date: 2026-06-13 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c4d7e9a1b2f3'
down_revision: Union[str, None] = '7df38f4693ae'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'document',
        sa.Column('uuid', sa.Uuid(), nullable=False),
        sa.Column('order_id', sa.Uuid(), nullable=False),
        sa.Column('url', sa.String(length=512), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.ForeignKeyConstraint(['order_id'], ['order.uuid'], name=op.f('fk_document_order_id_order')),
        sa.PrimaryKeyConstraint('uuid', name=op.f('pk_document')),
        sa.UniqueConstraint('uuid', name=op.f('uq_document_uuid')),
    )


def downgrade() -> None:
    op.drop_table('document')
