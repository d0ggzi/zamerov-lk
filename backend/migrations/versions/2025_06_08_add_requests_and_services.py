"""add requests and services

Revision ID: a2ce3c5010a9
Revises: a1e9a68d77a4
Create Date: 2025-06-08 13:05:13.878804

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "a2ce3c5010a9"
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
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("address", sa.String(length=255), nullable=True),
        sa.Column("data", sa.DateTime(timezone=True), nullable=True),
        sa.Column("status", sa.Enum("DRAFT", "READY", "IN_PROGRESS", "FINISHED", name="status"), nullable=False),
        sa.Column("employer_id", sa.Uuid(), nullable=True),
        sa.ForeignKeyConstraint(
            ["employer_id"],
            ["users.uuid"],
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.uuid"],
        ),
        sa.PrimaryKeyConstraint("uuid"),
        sa.UniqueConstraint("uuid"),
    )
    op.create_table(
        "request_service_relation",
        sa.Column("uuid", sa.Uuid(), nullable=False),
        sa.Column("request_id", sa.Uuid(), nullable=False),
        sa.Column("service_id", sa.Uuid(), nullable=False),
        sa.ForeignKeyConstraint(["request_id"], ["request.uuid"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["service_id"], ["service.uuid"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("uuid", "request_id", "service_id"),
        sa.UniqueConstraint("request_id", "service_id", name="uq_request_service"),
        sa.UniqueConstraint("uuid"),
    )
    op.create_unique_constraint("uq_role_uuid", "role", ["uuid"])


def downgrade() -> None:
    op.drop_constraint("uq_role_uuid", "role", type_="unique")
    op.drop_table("request_service_relation")
    op.drop_table("request")
    op.drop_table("service")
    op.execute("DROP TYPE IF EXISTS status")
