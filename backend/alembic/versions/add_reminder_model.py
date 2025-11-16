"""Add Reminder model

Revision ID: add_reminder_model
Revises: 
Create Date: 2025-08-28 09:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_reminder_model'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Create reminder_types enum type
    reminder_type_enum = sa.Enum(
        'NOTE', 'TASK', 'DEADLINE', 'MEETING', 'CUSTOM',
        name='remindertype'
    )
    reminder_type_enum.create(op.get_bind(), checkfirst=True)
    
    # Create reminder_status enum type
    status_enum = sa.Enum(
        'PENDING', 'COMPLETED', 'DISMISSED', 'EXPIRED',
        name='reminderstatus'
    )
    status_enum.create(op.get_bind(), checkfirst=True)
    
    # Create recurrence_rule enum type
    recurrence_enum = sa.Enum(
        'NONE', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM',
        name='recurrencerule'
    )
    recurrence_enum.create(op.get_bind(), checkfirst=True)
    
    # Create reminders table
    op.create_table(
        'reminders',
        sa.Column('id', sa.Integer(), nullable=False, primary_key=True, autoincrement=True),
        sa.Column('user_id', sa.String(), nullable=False, index=True),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('reminder_type', sa.Enum('NOTE', 'TASK', 'DEADLINE', 'MEETING', 'CUSTOM', name='remindertype'), nullable=False),
        sa.Column('due_date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_recurring', sa.Boolean(), default=False, nullable=False),
        sa.Column('recurrence_rule', sa.Enum('NONE', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM', name='recurrencerule'), nullable=True),
        sa.Column('custom_recurrence', sa.String(length=255), nullable=True),
        sa.Column('status', sa.Enum('PENDING', 'COMPLETED', 'DISMISSED', 'EXPIRED', name='reminderstatus'), default='PENDING', nullable=False),
        sa.Column('send_email', sa.Boolean(), default=False, nullable=False),
        sa.Column('send_push', sa.Boolean(), default=True, nullable=False),
        sa.Column('note_id', sa.Integer(), nullable=True),
        sa.Column('task_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), onupdate=sa.text('now()'), nullable=False),
        
        # Foreign key constraints
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['note_id'], ['notes.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['task_id'], ['tasks.id'], ondelete='CASCADE'),
        
        # Indexes
        sa.Index('ix_reminders_user_id', 'user_id'),
        sa.Index('ix_reminders_due_date', 'due_date'),
        sa.Index('ix_reminders_status', 'status'),
    )

def downgrade():
    op.drop_table('reminders')
    op.execute("DROP TYPE IF EXISTS remindertype CASCADE")
    op.execute("DROP TYPE IF EXISTS reminderstatus CASCADE")
    op.execute("DROP TYPE IF EXISTS recurrencerule CASCADE")
