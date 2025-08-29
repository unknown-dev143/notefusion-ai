"""add audio_notes table

Revision ID: 1234abcd5678
Revises: 
Create Date: 2024-03-01 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '1234abcd5678'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Create audio_notes table
    op.create_table(
        'audio_notes',
        sa.Column('id', sa.Integer(), nullable=False, primary_key=True, index=True),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('file_path', sa.String(), nullable=False),
        sa.Column('file_size', sa.Integer(), nullable=True),
        sa.Column('duration', sa.Float(), nullable=True),
        sa.Column('transcription', sa.Text(), nullable=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('tags', postgresql.JSONB(astext_type=sa.Text()), server_default='[]', nullable=True),
        sa.Column('language', sa.String(), server_default='en', nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), onupdate=sa.text('now()'), nullable=False),
    )
    
    # Create index on user_id for faster lookups
    op.create_index(op.f('ix_audio_notes_user_id'), 'audio_notes', ['user_id'], unique=False)
    
    # Create index on created_at for sorting
    op.create_index(op.f('ix_audio_notes_created_at'), 'audio_notes', ['created_at'], unique=False)

def downgrade():
    # Drop indexes first
    op.drop_index(op.f('ix_audio_notes_created_at'), table_name='audio_notes')
    op.drop_index(op.f('ix_audio_notes_user_id'), table_name='audio_notes')
    
    # Drop the table
    op.drop_table('audio_notes')
