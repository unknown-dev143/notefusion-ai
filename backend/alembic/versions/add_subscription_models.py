"""Add subscription models

Revision ID: add_subscription_models
Rev: 
Create Date: 2025-08-11 09:17:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_subscription_models'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Create enum types
    subscription_tier = postgresql.ENUM(
        'free', 'pro', 'business', 'admin',
        name='subscriptiontier'
    )
    subscription_status = postgresql.ENUM(
        'active', 'canceled', 'past_due', 'unpaid', 'trialing', 'incomplete', 'incomplete_expired', 'paused',
        name='subscriptionstatus'
    )
    
    # Create the enums
    subscription_tier.create(op.get_bind())
    subscription_status.create(op.get_bind())
    
    # Create subscriptions table
    op.create_table(
        'subscriptions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('tier', sa.Enum('free', 'pro', 'business', 'admin', name='subscriptiontier'), nullable=False, server_default='free'),
        sa.Column('status', sa.Enum('active', 'canceled', 'past_due', 'unpaid', 'trialing', 'incomplete', 'incomplete_expired', 'paused', name='subscriptionstatus'), nullable=False, server_default='free'),
        sa.Column('current_period_start', sa.DateTime(), nullable=True),
        sa.Column('current_period_end', sa.DateTime(), nullable=True),
        sa.Column('cancel_at_period_end', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('payment_method_id', sa.String(), nullable=True),
        sa.Column('subscription_id', sa.String(), nullable=True, unique=True),
        sa.Column('metadata', sa.JSON(), server_default='{}', nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), onupdate=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', name='_user_subscription_uc')
    )
    
    # Create invoices table
    op.create_table(
        'invoices',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('subscription_id', sa.Integer(), nullable=False),
        sa.Column('amount', sa.Integer(), nullable=False),
        sa.Column('currency', sa.String(), server_default='usd', nullable=False),
        sa.Column('invoice_id', sa.String(), nullable=True, unique=True),
        sa.Column('payment_intent_id', sa.String(), nullable=True),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('paid', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('receipt_url', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('paid_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['subscription_id'], ['subscriptions.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create index for faster lookups
    op.create_index(op.f('ix_subscriptions_user_id'), 'subscriptions', ['user_id'], unique=True)
    op.create_index(op.f('ix_invoices_subscription_id'), 'invoices', ['subscription_id'], unique=False)


def downgrade():
    # Drop indexes first
    op.drop_index(op.f('ix_invoices_subscription_id'), table_name='invoices')
    op.drop_index(op.f('ix_subscriptions_user_id'), table_name='subscriptions')
    
    # Drop tables
    op.drop_table('invoices')
    op.drop_table('subscriptions')
    
    # Drop enums
    op.execute("DROP TYPE IF EXISTS subscriptionstatus")
    op.execute("DROP TYPE IF EXISTS subscriptiontier")
