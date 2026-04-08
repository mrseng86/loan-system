"""add short term loans

Revision ID: 20260408_0003
Revises: 20260307_0002
Create Date: 2026-04-08 10:20:00
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = '20260408_0003'
down_revision: Union[str, Sequence[str], None] = '20260307_0002'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


short_term_loan_status = postgresql.ENUM('active', 'overdue', 'settled', name='shorttermloanstatus', create_type=False)
short_term_repayment_type = postgresql.ENUM('interest', 'principal', name='shorttermrepaymenttype', create_type=False)


def upgrade() -> None:
    bind = op.get_bind()
    short_term_loan_status.create(bind, checkfirst=True)
    short_term_repayment_type.create(bind, checkfirst=True)

    op.create_table(
        'short_term_loans',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('customer_id', sa.Integer(), nullable=False),
        sa.Column('created_by', sa.Integer(), nullable=False),
        sa.Column('principal_amount', sa.Numeric(12, 2), nullable=False),
        sa.Column('interest_rate', sa.Numeric(8, 4), nullable=False),
        sa.Column('interest_due', sa.Numeric(12, 2), nullable=False),
        sa.Column('total_due', sa.Numeric(12, 2), nullable=False),
        sa.Column('principal_paid', sa.Numeric(12, 2), nullable=False, server_default='0'),
        sa.Column('interest_paid', sa.Numeric(12, 2), nullable=False, server_default='0'),
        sa.Column('current_balance', sa.Numeric(12, 2), nullable=False),
        sa.Column('disbursed_at', sa.Date(), nullable=False),
        sa.Column('due_date', sa.Date(), nullable=False),
        sa.Column('status', short_term_loan_status, nullable=False, server_default='active'),
        sa.Column('note', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['created_by'], ['users.id']),
        sa.ForeignKeyConstraint(['customer_id'], ['customers.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_short_term_loans_id'), 'short_term_loans', ['id'], unique=False)
    op.create_index(op.f('ix_short_term_loans_customer_id'), 'short_term_loans', ['customer_id'], unique=False)

    op.create_table(
        'short_term_repayments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('short_term_loan_id', sa.Integer(), nullable=False),
        sa.Column('recorded_by', sa.Integer(), nullable=False),
        sa.Column('amount', sa.Numeric(12, 2), nullable=False),
        sa.Column('repayment_type', short_term_repayment_type, nullable=False),
        sa.Column('method', sa.String(length=50), nullable=False, server_default='cash'),
        sa.Column('note', sa.Text(), nullable=True),
        sa.Column('paid_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['recorded_by'], ['users.id']),
        sa.ForeignKeyConstraint(['short_term_loan_id'], ['short_term_loans.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_short_term_repayments_id'), 'short_term_repayments', ['id'], unique=False)
    op.create_index(op.f('ix_short_term_repayments_short_term_loan_id'), 'short_term_repayments', ['short_term_loan_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_short_term_repayments_short_term_loan_id'), table_name='short_term_repayments')
    op.drop_index(op.f('ix_short_term_repayments_id'), table_name='short_term_repayments')
    op.drop_table('short_term_repayments')

    op.drop_index(op.f('ix_short_term_loans_customer_id'), table_name='short_term_loans')
    op.drop_index(op.f('ix_short_term_loans_id'), table_name='short_term_loans')
    op.drop_table('short_term_loans')

    bind = op.get_bind()
    short_term_repayment_type.drop(bind, checkfirst=True)
    short_term_loan_status.drop(bind, checkfirst=True)
