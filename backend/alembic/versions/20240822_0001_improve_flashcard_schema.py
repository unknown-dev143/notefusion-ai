"""Improve flashcard schema with better indexes and constraints

Revision ID: 20240822_0001
Revises: 
Create Date: 2024-08-22 00:01:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20240822_0001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Create indexes for better query performance
    op.create_index(op.f('ix_flashcards_user_id'), 'flashcards', ['user_id'], unique=False)
    op.create_index(op.f('ix_flashcards_note_id'), 'flashcards', ['note_id'], unique=False)
    op.create_index(op.f('ix_flashcards_due_date'), 'flashcards', ['due_date'], unique=False)
    
    # Add unique constraint to prevent duplicate flashcards
    op.create_unique_constraint(
        'uq_flashcards_user_front', 
        'flashcards', 
        ['user_id', 'front_text']
    )
    
    # Add check constraint for ease_factor
    op.create_check_constraint(
        'ck_flashcards_ease_factor_range',
        'flashcards',
        'ease_factor BETWEEN 130 AND 250'
    )
    
    # Add check constraint for review count
    op.create_check_constraint(
        'ck_flashcards_review_count',
        'flashcards',
        'review_count >= 0'
    )

def downgrade():
    # Drop all the constraints and indexes we added
    op.drop_constraint('ck_flashcards_review_count', 'flashcards', type_='check')
    op.drop_constraint('ck_flashcards_ease_factor_range', 'flashcards', type_='check')
    op.drop_constraint('uq_flashcards_user_front', 'flashcards', type_='unique')
    op.drop_index(op.f('ix_flashcards_due_date'), table_name='flashcards')
    op.drop_index(op.f('ix_flashcards_note_id'), table_name='flashcards')
    op.drop_index(op.f('ix_flashcards_user_id'), table_name='flashcards')
