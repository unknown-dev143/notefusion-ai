"""Create user AI settings table

Revision ID: 2025_08_17_1118
Revises: 1a2b3c4d5e6f
Create Date: 2025-08-17 11:18:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '2025_08_17_1118'
down_revision = '1a2b3c4d5e6f'
branch_labels = None
depends_on = None

def upgrade():
    # Create the user_ai_settings table
    op.create_table(
        'user_ai_settings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('default_model_id', sa.Integer(), sa.ForeignKey('ai_models.id', ondelete='SET NULL'), nullable=True),
        sa.Column('auto_upgrade_models', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), 
                 onupdate=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', name='_user_ai_settings_uc')
    )
    
    # Create indexes
    op.create_index('ix_user_ai_settings_user_id', 'user_ai_settings', ['user_id'], unique=True)
    op.create_index('ix_user_ai_settings_default_model_id', 'user_ai_settings', ['default_model_id'])
    
    # Create a default settings record for existing users
    op.execute("""
        INSERT INTO user_ai_settings (user_id, default_model_id, auto_upgrade_models)
        SELECT id, 
               (SELECT id FROM ai_models WHERE model_id = 'gpt-4' LIMIT 1),
               true
        FROM users
        WHERE NOT EXISTS (
            SELECT 1 FROM user_ai_settings WHERE user_ai_settings.user_id = users.id
        )
    """)

def downgrade():
    # Drop the table and its indexes
    op.drop_index('ix_user_ai_settings_default_model_id', table_name='user_ai_settings')
    op.drop_index('ix_user_ai_settings_user_id', table_name='user_ai_settings')
    op.drop_table('user_ai_settings')
