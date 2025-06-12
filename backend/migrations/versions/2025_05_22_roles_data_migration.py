"""roles data migration

Revision ID: a1e9a68d77a4
Revises: 0ca2582b1271
Create Date: 2025-05-25 21:10:27.010358

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import orm, or_

from src.domain.models.users import Role


# revision identifiers, used by Alembic.
revision: str = "a1e9a68d77a4"
down_revision: Union[str, None] = "0ca2582b1271"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    session = orm.Session(bind=bind)
    session.execute(
        Role.__table__.insert().values(
            [
                {"name": "user"},
                {"name": "employer"},
                {"name": "manager"},
                {"name": "admin"},
            ]
        )
    )


def downgrade() -> None:
    bind = op.get_bind()
    session = orm.Session(bind=bind)
    session.execute(
        sa.delete(Role).where(
            or_(
                Role.name == "user",
                Role.name == "employer",
                Role.name == "manager",
                Role.name == "admin",
            )
        )
    )
