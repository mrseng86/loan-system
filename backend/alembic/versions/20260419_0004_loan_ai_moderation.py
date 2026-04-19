"""add ai moderation fields to loans

Revision ID: 20260419_0004
Revises: 20260408_0003
Create Date: 2026-04-19 00:00:00
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '20260419_0004'
down_revision: Union[str, Sequence[str], None] = '20260408_0003'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('loans', sa.Column('ai_risk_score', sa.Numeric(5, 2), nullable=True))
    op.add_column('loans', sa.Column('ai_risk_level', sa.String(length=20), nullable=True))
    op.add_column('loans', sa.Column('ai_recommendation', sa.String(length=20), nullable=True))
    op.add_column('loans', sa.Column('ai_reasoning', sa.Text(), nullable=True))
    op.add_column('loans', sa.Column('ai_red_flags', sa.JSON(), nullable=True))
    op.add_column('loans', sa.Column('ai_positive_signals', sa.JSON(), nullable=True))
    op.add_column('loans', sa.Column('ai_provider', sa.String(length=50), nullable=True))
    op.add_column('loans', sa.Column('ai_model', sa.String(length=100), nullable=True))
    op.add_column('loans', sa.Column('ai_reviewed_at', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column('loans', 'ai_reviewed_at')
    op.drop_column('loans', 'ai_model')
    op.drop_column('loans', 'ai_provider')
    op.drop_column('loans', 'ai_positive_signals')
    op.drop_column('loans', 'ai_red_flags')
    op.drop_column('loans', 'ai_reasoning')
    op.drop_column('loans', 'ai_recommendation')
    op.drop_column('loans', 'ai_risk_level')
    op.drop_column('loans', 'ai_risk_score')
