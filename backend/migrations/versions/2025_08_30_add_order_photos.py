"""add order photos

Revision ID: 6f8b9edbb1f7
Revises: 53a0c2c374ac
Create Date: 2025-08-30 22:03:41.169928

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6f8b9edbb1f7'
down_revision: Union[str, None] = '53a0c2c374ac'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('order_photo',
    sa.Column('uuid', sa.Uuid(), nullable=False),
    sa.Column('order_id', sa.Uuid(), nullable=False),
    sa.Column('url', sa.String(length=255), nullable=False),
    sa.ForeignKeyConstraint(['order_id'], ['order.uuid'], name=op.f('fk_order_photo_order_id_order')),
    sa.PrimaryKeyConstraint('uuid', name=op.f('pk_order_photo')),
    sa.UniqueConstraint('order_id', 'url', name='uq_photo_order_url'),
    sa.UniqueConstraint('uuid', name=op.f('uq_order_photo_uuid'))
    )


def downgrade() -> None:
    op.drop_table('order_photo')
