"""Update AI models and relationships

Revision ID: 2025_08_17_1056_update_ai_models
Revises: 1a2b3c4d5e6f
Create Date: 2025-08-17 10:56:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '2025_08_17_1056_update_ai_models'
down_revision = '1a2b3c4d5e6f'
branch_labels = None
depends_on = None

def upgrade():
    # Add new columns to ai_models table
    op.add_column('ai_models', sa.Column('is_default', sa.Boolean(), server_default='false', nullable=True))
    op.add_column('ai_models', sa.Column('context_window', sa.Integer(), nullable=True))
    op.add_column('ai_models', sa.Column('supports_functions', sa.Boolean(), server_default='false', nullable=True))
    
    # Add new columns to user_ai_model_settings table
    op.add_column('user_ai_model_settings', sa.Column('is_preferred', sa.Boolean(), server_default='false', nullable=True))
    op.add_column('user_ai_model_settings', sa.Column('last_used_at', sa.DateTime(), nullable=True))
    
    # Update existing data
    op.execute("""
        UPDATE ai_models 
        SET is_default = true, 
            context_window = CASE 
                WHEN model_id = 'gpt-4' THEN 8192
                WHEN model_id = 'gpt-3.5-turbo' THEN 4096
                WHEN model_id = 'claude-3-opus-20240229' THEN 200000
                ELSE 4096
            END,
            supports_functions = CASE 
                WHEN provider = 'openai' THEN true
                ELSE false
            END
    """)
    
    # Add indexes for better performance
    op.create_index('ix_ai_models_is_available', 'ai_models', ['is_available'])
    op.create_index('ix_ai_models_provider', 'ai_models', ['provider'])
    op.create_index('ix_user_ai_model_settings_user_id', 'user_ai_model_settings', ['user_id'])
    op.create_index('ix_user_ai_model_settings_model_id', 'user_ai_model_settings', ['model_id'])

def downgrade():
    # Drop indexes
    op.drop_index('ix_user_ai_model_settings_model_id', table_name='user_ai_model_settings')
    op.drop_index('ix_user_ai_model_settings_user_id', table_name='user_ai_model_settings')
    op.drop_index('ix_ai_models_provider', table_name='ai_models')
    op.drop_index('ix_ai_models_is_available', table_name='ai_models')
    
    # Drop columns from user_ai_model_settings
    op.drop_column('user_ai_model_settings', 'last_used_at')
    op.drop_column('user_ai_model_settings', 'is_preferred')
    
    # Drop columns from ai_models
    op.drop_column('ai_models', 'supports_functions')
    op.drop_column('ai_models', 'context_window')
    op.drop_column('ai_models', 'is_default')
