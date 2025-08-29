"""Add Flashcard model

Revision ID: 2025_08_21_1918
Revises: 2025_08_17_1118_create_user_ai_settings
Create Date: 2025-08-21 19:18:00

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '2025_08_21_1918'
down_revision = '2025_08_17_1118_create_user_ai_settings'
branch_labels = None
depends_on = None

def upgrade():
    # Create flashcards table
    op.create_table('flashcards',
        sa.Column('id', sa.String(36), nullable=False, primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('note_id', sa.String(36), sa.ForeignKey('notes.id'), nullable=True),
        sa.Column('front_text', sa.Text(), nullable=False),
        sa.Column('back_text', sa.Text(), nullable=False),
        sa.Column('ease_factor', sa.Integer(), nullable=False, server_default='250'),
        sa.Column('interval', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('due_date', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('last_reviewed', sa.DateTime(), nullable=True),
        sa.Column('review_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('tags', sa.JSON(), nullable=True, server_default='[]'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'), nullable=False),
        mysql_charset='utf8mb4',
        mysql_collate='utf8mb4_unicode_ci'
    )
    
    # Create indexes
    op.create_index(op.f('ix_flashcards_user_id'), 'flashcards', ['user_id'], unique=False)
    op.create_index(op.f('ix_flashcards_note_id'), 'flashcards', ['note_id'], unique=False)
    op.create_index(op.f('ix_flashcards_due_date'), 'flashcards', ['due_date'], unique=False)

def downgrade():
    # Drop indexes
    op.drop_index(op.f('ix_flashcards_due_date'), table_name='flashcards')
    op.drop_index(op.f('ix_flashcards_note_id'), table_name='flashcards')
    op.drop_index(op.f('ix_flashcards_user_id'), table_name='flashcards')
    
    # Drop table
    op.drop_table('flashcards')
