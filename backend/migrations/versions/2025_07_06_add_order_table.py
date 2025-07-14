"""add order table

Revision ID: 272db4171a7a
Revises: a2ce3c5010a9
Create Date: 2025-07-06 19:07:09.870792

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "272db4171a7a"
down_revision: Union[str, None] = "a2ce3c5010a9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "order",
        sa.Column("uuid", sa.Uuid(), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("address", sa.String(length=255), nullable=True),
        sa.Column("data", sa.DateTime(timezone=True), nullable=True),
        sa.Column("request_id", sa.Uuid(), nullable=False),
        sa.Column("employee_id", sa.Uuid(), nullable=True),
        sa.ForeignKeyConstraint(["employee_id"], ["users.uuid"], name=op.f("fk_order_employee_id_users")),
        sa.ForeignKeyConstraint(["request_id"], ["request.uuid"], name=op.f("fk_order_request_id_request")),
        sa.PrimaryKeyConstraint("uuid", name=op.f("pk_order")),
        sa.UniqueConstraint("uuid", name=op.f("uq_order_uuid")),
    )
    op.create_unique_constraint(op.f("uq_request_uuid"), "request", ["uuid"])
    op.drop_column("request", "employee_id")
    op.create_unique_constraint(op.f("uq_service_uuid"), "service", ["uuid"])
    op.create_unique_constraint(op.f("uq_order_uuid"), "order", ["uuid"])


def downgrade() -> None:
    op.drop_constraint(op.f("uq_service_uuid"), "service", type_="unique")
    op.add_column("request", sa.Column("employee_id", sa.UUID(), autoincrement=False, nullable=True))
    op.drop_constraint(op.f("uq_request_uuid"), "request", type_="unique")
    op.drop_constraint(op.f("uq_order_uuid"), "order", type_="unique")
    op.drop_table("order")
