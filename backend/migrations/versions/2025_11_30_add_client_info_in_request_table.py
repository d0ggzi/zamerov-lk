"""add client info in request table

Revision ID: 7df38f4693ae
Revises: 6f8b9edbb1f7
Create Date: 2025-11-30 23:55:25.945415

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7df38f4693ae'
down_revision: Union[str, None] = '6f8b9edbb1f7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_unique_constraint(op.f('uq_order_photo_uuid'), 'order_photo', ['uuid'])
    op.add_column('request', sa.Column('client_name', sa.String(length=255), nullable=True))
    op.add_column('request', sa.Column('client_email', sa.String(length=50), nullable=True))
    op.add_column('request', sa.Column('client_phone', sa.String(length=50), nullable=True))


def downgrade() -> None:
    op.drop_column('request', 'client_phone')
    op.drop_column('request', 'client_email')
    op.drop_column('request', 'client_name')
    op.drop_constraint(op.f('uq_order_photo_uuid'), 'order_photo', type_='unique')
