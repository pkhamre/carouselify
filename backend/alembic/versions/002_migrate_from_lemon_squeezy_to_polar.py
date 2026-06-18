"""migrate from lemon-squeezy to polar.sh

Revision ID: 002
Revises: 001
Create Date: 2026-06-18

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("user", sa.Column("polar_customer_id", sa.String(), nullable=True))
    op.create_index(op.f("ix_user_polar_customer_id"), "user", ["polar_customer_id"])
    op.add_column("user", sa.Column("polar_subscription_id", sa.String(), nullable=True))
    op.add_column("user", sa.Column("polar_subscription_status", sa.String(), nullable=True))
    op.add_column("user", sa.Column("polar_subscription_period_end", sa.DateTime(timezone=True), nullable=True))
    op.add_column("user", sa.Column("polar_cancel_at_period_end", sa.Boolean(), nullable=False, server_default=sa.text("0")))
    op.drop_index("ix_user_lemon_squeezy_customer_id")
    op.drop_column("user", "lemon_squeezy_customer_id")
    op.drop_column("user", "lemon_squeezy_subscription_id")


def downgrade() -> None:
    op.add_column("user", sa.Column("lemon_squeezy_subscription_id", sa.String(), nullable=True))
    op.add_column("user", sa.Column("lemon_squeezy_customer_id", sa.String(), nullable=True))
    op.create_index(op.f("ix_user_lemon_squeezy_customer_id"), "user", ["lemon_squeezy_customer_id"])
    op.drop_column("user", "polar_cancel_at_period_end")
    op.drop_column("user", "polar_subscription_period_end")
    op.drop_column("user", "polar_subscription_status")
    op.drop_column("user", "polar_subscription_id")
    op.drop_index(op.f("ix_user_polar_customer_id"), "user")
    op.drop_column("user", "polar_customer_id")
