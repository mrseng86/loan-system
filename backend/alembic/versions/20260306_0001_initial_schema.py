"""initial schema

Revision ID: 20260306_0001
Revises:
Create Date: 2026-03-06 12:00:00
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql


revision = "20260306_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    user_role = sa.Enum("admin", "staff", "collector", name="userrole")
    loan_status = sa.Enum("active", "overdue", "closed", "bad_debt", name="loanstatus")
    collection_type = sa.Enum("call", "whatsapp", "visit", "legal_notice", name="collectionactiontype")

    bind = op.get_bind()
    user_role.create(bind, checkfirst=True)
    loan_status.create(bind, checkfirst=True)
    collection_type.create(bind, checkfirst=True)

    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column(
            "role",
            postgresql.ENUM("admin", "staff", "collector", name="userrole", create_type=False),
            nullable=False,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)
    op.create_index(op.f("ix_users_id"), "users", ["id"], unique=False)

    op.create_table(
        "customers",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("phone", sa.String(length=50), nullable=False),
        sa.Column("address", sa.String(length=500), nullable=True),
        sa.Column("national_id", sa.String(length=100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_customers_id"), "customers", ["id"], unique=False)

    op.create_table(
        "loans",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("customer_id", sa.Integer(), nullable=False),
        sa.Column("created_by", sa.Integer(), nullable=False),
        sa.Column("loan_amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("interest_rate", sa.Numeric(5, 2), nullable=False),
        sa.Column("monthly_interest_rate", sa.Numeric(8, 4), nullable=False, server_default=sa.text("0")),
        sa.Column("service_charge_rate", sa.Numeric(8, 4), nullable=False, server_default=sa.text("0")),
        sa.Column("stamp_duty_rate", sa.Numeric(8, 4), nullable=False, server_default=sa.text("0")),
        sa.Column("tenure_months", sa.Integer(), nullable=False),
        sa.Column("installment_amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("total_payable", sa.Numeric(12, 2), nullable=False),
        sa.Column("total_paid", sa.Numeric(12, 2), nullable=False),
        sa.Column("current_balance", sa.Numeric(12, 2), nullable=False),
        sa.Column("disbursed_at", sa.Date(), nullable=False),
        sa.Column("next_due_date", sa.Date(), nullable=False),
        sa.Column(
            "status",
            postgresql.ENUM("active", "overdue", "closed", "bad_debt", name="loanstatus", create_type=False),
            nullable=False,
        ),
        sa.Column("days_overdue", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["created_by"], ["users.id"]),
        sa.ForeignKeyConstraint(["customer_id"], ["customers.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_loans_customer_id"), "loans", ["customer_id"], unique=False)
    op.create_index(op.f("ix_loans_id"), "loans", ["id"], unique=False)

    op.create_table(
        "repayments",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("loan_id", sa.Integer(), nullable=False),
        sa.Column("recorded_by", sa.Integer(), nullable=False),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("method", sa.String(length=50), nullable=False),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("paid_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["loan_id"], ["loans.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["recorded_by"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_repayments_id"), "repayments", ["id"], unique=False)
    op.create_index(op.f("ix_repayments_loan_id"), "repayments", ["loan_id"], unique=False)

    op.create_table(
        "collection_actions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("loan_id", sa.Integer(), nullable=False),
        sa.Column("staff_id", sa.Integer(), nullable=False),
        sa.Column(
            "action_type",
            postgresql.ENUM("call", "whatsapp", "visit", "legal_notice", name="collectionactiontype", create_type=False),
            nullable=False,
        ),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("action_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["loan_id"], ["loans.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["staff_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_collection_actions_id"), "collection_actions", ["id"], unique=False)
    op.create_index(op.f("ix_collection_actions_loan_id"), "collection_actions", ["loan_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_collection_actions_loan_id"), table_name="collection_actions")
    op.drop_index(op.f("ix_collection_actions_id"), table_name="collection_actions")
    op.drop_table("collection_actions")

    op.drop_index(op.f("ix_repayments_loan_id"), table_name="repayments")
    op.drop_index(op.f("ix_repayments_id"), table_name="repayments")
    op.drop_table("repayments")

    op.drop_index(op.f("ix_loans_id"), table_name="loans")
    op.drop_index(op.f("ix_loans_customer_id"), table_name="loans")
    op.drop_table("loans")

    op.drop_index(op.f("ix_customers_id"), table_name="customers")
    op.drop_table("customers")

    op.drop_index(op.f("ix_users_id"), table_name="users")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")

    op.execute("DROP TYPE IF EXISTS collectionactiontype")
    op.execute("DROP TYPE IF EXISTS loanstatus")
    op.execute("DROP TYPE IF EXISTS userrole")
