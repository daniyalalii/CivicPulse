"""initial complaints schema

Revision ID: 0001
Revises: 
Create Date: 2026-09-26 20:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '0001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    category_enum = sa.Enum('water', 'electricity', 'sanitation', 'roads', 'streetlights', 'other', name='category_enum')
    priority_enum = sa.Enum('high', 'normal', 'low', name='priority_enum')
    status_enum = sa.Enum('open', 'in_progress', 'resolved', 'rejected', name='status_enum')

    op.create_table(
        'complaints',
        sa.Column('id', sa.Uuid(), primary_key=True, nullable=False),
        sa.Column('text', sa.Text(), nullable=False),
        sa.Column('location', sa.String(length=200), nullable=False),
        sa.Column('reporter_contact', sa.String(length=200), nullable=True),
        sa.Column('category', category_enum, nullable=False),
        sa.Column('priority', priority_enum, nullable=False),
        sa.Column('status', status_enum, nullable=False, server_default='open'),
        sa.Column('ai_summary', sa.String(length=140), nullable=True),
        sa.Column('triaged_by', sa.String(length=50), nullable=False),
        sa.Column('triage_latency_ms', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )

    op.create_index('ix_complaints_created_at', 'complaints', ['created_at'], unique=False)
    op.create_index('idx_complaints_status_priority', 'complaints', ['status', 'priority'], unique=False)


def downgrade() -> None:
    op.drop_index('idx_complaints_status_priority', table_name='complaints')
    op.drop_index('ix_complaints_created_at', table_name='complaints')
    op.drop_table('complaints')

    bind = op.get_bind()
    if bind.dialect.name == 'postgresql':
        sa.Enum(name='status_enum').drop(bind, checkfirst=True)
        sa.Enum(name='priority_enum').drop(bind, checkfirst=True)
        sa.Enum(name='category_enum').drop(bind, checkfirst=True)
