"""add AI models tables

Revision ID: 1a2b3c4d5e6f
Revises: 
Create Date: 2025-08-08 16:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '1a2b3c4d5e6f'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Create enum types first
    ai_provider = postgresql.ENUM(
        'openai', 'anthropic', 'cohere', 'huggingface',
        name='aiprovider',
        create_type=True
    )
    ai_provider.create(op.get_bind())
    
    ai_model_status = postgresql.ENUM(
        'active', 'deprecated', 'beta', 'alpha',
        name='aimodelstatus',
        create_type=True
    )
    ai_model_status.create(op.get_bind())
    
    # Create tables
    op.create_table(
        'ai_models',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('model_id', sa.String(), unique=True, nullable=False),
        sa.Column('provider', sa.Enum('openai', 'anthropic', 'cohere', 'huggingface', 
                                     name='aiprovider'), 
                  nullable=False),
        sa.Column('is_available', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('status', sa.Enum('active', 'deprecated', 'beta', 'alpha', 
                                   name='aimodelstatus'), 
                  server_default='active', nullable=False),
        sa.Column('max_tokens', sa.Integer(), nullable=True),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), 
                  onupdate=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    
    op.create_table(
        'user_ai_model_settings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('model_id', sa.Integer(), sa.ForeignKey('ai_models.id'), nullable=False),
        sa.Column('is_auto_upgrade', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('last_checked_at', sa.DateTime(), nullable=True),
        sa.Column('last_upgraded_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), 
                  onupdate=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'model_id', name='_user_model_uc')
    )
    
    # Create indexes
    op.create_index(op.f('ix_ai_models_model_id'), 'ai_models', ['model_id'], unique=True)
    op.create_index(op.f('ix_ai_models_provider'), 'ai_models', ['provider'])
    op.create_index(op.f('ix_user_ai_model_settings_user_id'), 'user_ai_model_settings', ['user_id'])
    
    # Insert initial models
    op.bulk_insert(
        sa.table(
            'ai_models',
            sa.column('name', sa.String()),
            sa.column('model_id', sa.String()),
            sa.column('provider', sa.String()),
            sa.column('is_available', sa.Boolean()),
            sa.column('status', sa.String()),
            sa.column('max_tokens', sa.Integer()),
            sa.column('description', sa.String())
        ),
        [
            {
                'name': 'GPT-4',
                'model_id': 'gpt-4',
                'provider': 'openai',
                'is_available': True,
                'status': 'active',
                'max_tokens': 8192,
                'description': 'Most capable GPT-4 model, optimized for complex tasks'
            },
            {
                'name': 'GPT-4 Turbo',
                'model_id': 'gpt-4-turbo-preview',
                'provider': 'openai',
                'is_available': True,
                'status': 'active',
                'max_tokens': 128000,
                'description': 'Latest GPT-4 model with improved capabilities and 128k context'
            },
            {
                'name': 'GPT-3.5 Turbo',
                'model_id': 'gpt-3.5-turbo',
                'provider': 'openai',
                'is_available': True,
                'status': 'active',
                'max_tokens': 16385,
                'description': 'Fast and capable model, good for most tasks'
            },
            {
                'name': 'GPT-5',
                'model_id': 'gpt-5',
                'provider': 'openai',
                'is_available': False,
                'status': 'beta',
                'max_tokens': 128000,
                'description': 'Next generation model with advanced capabilities'
            }
        ]
    )

def downgrade() -> None:
    op.drop_table('user_ai_model_settings')
    op.drop_table('ai_models')
    
    # Drop enum types
    op.execute("DROP TYPE IF EXISTS aiprovider")
    op.execute("DROP TYPE IF EXISTS aimodelstatus")
