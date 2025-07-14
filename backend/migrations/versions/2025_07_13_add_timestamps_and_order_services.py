"""add timestamps and order services

Revision ID: 53a0c2c374ac
Revises: 272db4171a7a
Create Date: 2025-07-13 14:43:16.643040

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "53a0c2c374ac"
down_revision: Union[str, None] = "272db4171a7a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "order_service_relation",
        sa.Column("uuid", sa.Uuid(), nullable=False),
        sa.Column("order_id", sa.Uuid(), nullable=False),
        sa.Column("service_id", sa.Uuid(), nullable=False),
        sa.ForeignKeyConstraint(
            ["order_id"], ["order.uuid"], name=op.f("fk_order_service_relation_order_id_order"), ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(
            ["service_id"],
            ["service.uuid"],
            name=op.f("fk_order_service_relation_service_id_service"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("uuid", "order_id", "service_id", name=op.f("pk_order_service_relation")),
        sa.UniqueConstraint("order_id", "service_id", name="uq_order_service"),
        sa.UniqueConstraint("uuid", name=op.f("uq_order_service_relation_uuid")),
    )
    op.add_column("order", sa.Column("description", sa.Text(), nullable=True))
    op.add_column(
        "order", sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False)
    )
    op.add_column("order", sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("order", sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column(
        "request", sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False)
    )
    op.add_column("request", sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("request", sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column(
        "role", sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False)
    )
    op.add_column("role", sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("role", sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column(
        "service", sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False)
    )
    op.add_column("service", sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("service", sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column(
        "users", sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False)
    )
    op.add_column("users", sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("users", sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "deleted_at")
    op.drop_column("users", "updated_at")
    op.drop_column("users", "created_at")
    op.drop_column("service", "deleted_at")
    op.drop_column("service", "updated_at")
    op.drop_column("service", "created_at")
    op.drop_column("role", "deleted_at")
    op.drop_column("role", "updated_at")
    op.drop_column("role", "created_at")
    op.drop_column("request", "deleted_at")
    op.drop_column("request", "updated_at")
    op.drop_column("request", "created_at")
    op.drop_column("order", "deleted_at")
    op.drop_column("order", "updated_at")
    op.drop_column("order", "created_at")
    op.drop_column("order", "description")
    op.drop_table("order_service_relation")
