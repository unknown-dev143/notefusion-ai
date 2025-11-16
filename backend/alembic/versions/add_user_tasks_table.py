"""Add user_tasks table

Revision ID: 1234567890ab
Revises: head
Create Date: 2025-03-20 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '1234567890ab'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Create the user_tasks table
    op.create_table(
        'user_tasks',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, primary_key=True, index=True),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('status', sa.Enum('pending', 'in_progress', 'completed', 'cancelled', name='task_status'), 
                 nullable=False, server_default='pending'),
        sa.Column('priority', sa.Enum('low', 'medium', 'high', name='task_priority'), 
                 nullable=False, server_default='medium'),
        sa.Column('due_date', sa.DateTime, nullable=True),
        sa.Column('reminder_enabled', sa.Boolean, nullable=False, server_default='false'),
        sa.Column('reminder_time', sa.DateTime, nullable=True),
        sa.Column('category', sa.String(100), nullable=True),
        sa.Column('tags', postgresql.ARRAY(sa.String(100)), nullable=False, server_default='{}'),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime, nullable=False, server_default=sa.func.now(), 
                 onupdate=sa.func.now()),
        sa.Column('completed_at', sa.DateTime, nullable=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), 
                 sa.ForeignKey('users.id', ondelete='CASCADE'), 
                 nullable=False, index=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for common query patterns
    op.create_index('idx_user_tasks_user_id', 'user_tasks', ['user_id'])
    op.create_index('idx_user_tasks_status', 'user_tasks', ['status'])
    op.create_index('idx_user_tasks_due_date', 'user_tasks', ['due_date'])
    op.create_index('idx_user_tasks_priority', 'user_tasks', ['priority'])
    op.create_index('idx_user_tasks_category', 'user_tasks', ['category'])
    op.create_index('idx_user_tasks_created_at', 'user_tasks', ['created_at'])
    op.create_index('idx_user_tasks_completed_at', 'user_tasks', ['completed_at'])
    
    # Create a GIN index for array operations on tags
    op.execute('CREATE INDEX idx_user_tasks_tags ON user_tasks USING GIN (tags)')


def downgrade():
    # Drop the indexes first
    op.drop_index('idx_user_tasks_tags', table_name='user_tasks')
    op.drop_index('idx_user_tasks_completed_at', table_name='user_tasks')
    op.drop_index('idx_user_tasks_created_at', table_name='user_tasks')
    op.drop_index('idx_user_tasks_category', table_name='user_tasks')
    op.drop_index('idx_user_tasks_priority', table_name='user_tasks')
    op.drop_index('idx_user_tasks_due_date', table_name='user_tasks')
    op.drop_index('idx_user_tasks_status', table_name='user_tasks')
    op.drop_index('idx_user_tasks_user_id', table_name='user_tasks')
    
    # Drop the table
    op.drop_table('user_tasks')
    
    # Drop the enum types
    sa.Enum(name='task_status').drop(op.get_bind(), checkfirst=False)
    sa.Enum(name='task_priority').drop(op.get_bind(), checkfirst=False)
