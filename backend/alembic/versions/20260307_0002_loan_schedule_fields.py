"""add loan schedule fields

Revision ID: 20260307_0002
Revises: 20260306_0001
Create Date: 2026-03-07 12:30:00
"""

from alembic import op
import sqlalchemy as sa


revision = "20260307_0002"
down_revision = "20260306_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("loans", sa.Column("monthly_interest_rate", sa.Numeric(8, 4), nullable=False, server_default=sa.text("0")))
    op.add_column("loans", sa.Column("service_charge_rate", sa.Numeric(8, 4), nullable=False, server_default=sa.text("0")))
    op.add_column("loans", sa.Column("stamp_duty_rate", sa.Numeric(8, 4), nullable=False, server_default=sa.text("0")))


def downgrade() -> None:
    op.drop_column("loans", "stamp_duty_rate")
    op.drop_column("loans", "service_charge_rate")
    op.drop_column("loans", "monthly_interest_rate")
