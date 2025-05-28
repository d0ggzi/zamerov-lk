"""add requests and services

Revision ID: 12b3c2b00836
Revises: a1e9a68d77a4
Create Date: 2025-05-29 00:43:52.482206

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "12b3c2b00836"
down_revision: Union[str, None] = "a1e9a68d77a4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "service",
        sa.Column("uuid", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.PrimaryKeyConstraint("uuid"),
        sa.UniqueConstraint("name"),
        sa.UniqueConstraint("uuid"),
    )
    op.create_table(
        "request",
        sa.Column("uuid", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("address", sa.String(length=255), nullable=True),
        sa.Column("data", sa.DateTime(timezone=True), nullable=True),
        sa.Column("status", sa.Enum("DRAFT", "READY", "IN_PROGRESS", "FINISHED", name="status"), nullable=False),
        sa.Column("employer_id", sa.Uuid(), nullable=False),
        sa.ForeignKeyConstraint(
            ["employer_id"],
            ["users.uuid"],
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.uuid"],
        ),
        sa.PrimaryKeyConstraint("uuid", "user_id", "employer_id"),
        sa.UniqueConstraint("uuid"),
    )
    op.create_table(
        "request_service_relations",
        sa.Column("uuid", sa.Uuid(), nullable=False),
        sa.Column("request_id", sa.Uuid(), nullable=False),
        sa.Column("service_id", sa.Uuid(), nullable=False),
        sa.ForeignKeyConstraint(
            ["request_id"],
            ["request.uuid"],
        ),
        sa.ForeignKeyConstraint(
            ["service_id"],
            ["service.uuid"],
        ),
        sa.PrimaryKeyConstraint("uuid", "request_id", "service_id"),
        sa.UniqueConstraint("request_id", "service_id", name="uq_request_service"),
        sa.UniqueConstraint("uuid"),
    )
    op.create_unique_constraint("uq_role_uuid", "role", ["uuid"])


def downgrade() -> None:
    op.drop_constraint("uq_role_uuid", "role", type_="unique")
    op.drop_table("request_service_relations")
    op.drop_table("request")
    op.drop_table("service")
    op.execute("DROP TYPE IF EXISTS status")
