"""Initial database schema

Revision ID: 0001_initial_schema
Revises: 
Create Date: 2025-03-18 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from datetime import datetime

# revision identifiers, used by Alembic.
revision = '0001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False, unique=True, index=True),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('full_name', sa.String(), nullable=True),
        sa.Column('is_active', sa.Boolean(), default=True, nullable=False),
        sa.Column('is_superuser', sa.Boolean(), default=False, nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, default=datetime.utcnow),
        sa.Column('updated_at', sa.DateTime(), nullable=True, onupdate=datetime.utcnow),
        sa.PrimaryKeyConstraint('id')
    )

    # Create sessions table
    op.create_table(
        'sessions',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, default=datetime.utcnow),
        sa.Column('updated_at', sa.DateTime(), nullable=True, onupdate=datetime.utcnow),
        sa.PrimaryKeyConstraint('id')
    )

    # Create notes table
    op.create_table(
        'notes',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('session_id', sa.String(), sa.ForeignKey('sessions.id'), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('content', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, default=datetime.utcnow),
        sa.Column('updated_at', sa.DateTime(), nullable=True, onupdate=datetime.utcnow),
        sa.PrimaryKeyConstraint('id')
    )

    # Create flashcards table
    op.create_table(
        'flashcards',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('note_id', sa.String(), sa.ForeignKey('notes.id'), nullable=False),
        sa.Column('front', sa.Text(), nullable=False),
        sa.Column('back', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, default=datetime.utcnow),
        sa.Column('updated_at', sa.DateTime(), nullable=True, onupdate=datetime.utcnow),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade():
    op.drop_table('flashcards')
    op.drop_table('notes')
    op.drop_table('sessions')
    op.drop_table('users')
