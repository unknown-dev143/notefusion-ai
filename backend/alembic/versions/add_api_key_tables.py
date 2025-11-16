"""add_api_key_tables

Revision ID: 1234567890ab
Revises: 
Create Date: 2025-08-28 15:05:00.000000

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
    # Create api_keys table
    op.create_table(
        'api_keys',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('key_prefix', sa.String(16), nullable=False, unique=True, index=True),
        sa.Column('hashed_key', sa.String(256), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False, index=True),
        sa.Column('scopes', postgresql.ARRAY(sa.String(50)), nullable=False, server_default='{}'),
        sa.Column('rate_limit', sa.Integer, nullable=True),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text('now()')),
        sa.Column('last_used_at', sa.DateTime, nullable=True),
        sa.Column('expires_at', sa.DateTime, nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create api_key_usages table
    op.create_table(
        'api_key_usages',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('api_key_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('timestamp', sa.DateTime, nullable=False, server_default=sa.text('now()'), index=True),
        sa.Column('path', sa.String(255), nullable=False),
        sa.Column('method', sa.String(10), nullable=False),
        sa.Column('status_code', sa.Integer, nullable=False),
        sa.Column('client_ip', sa.String(45), nullable=False),
        sa.Column('user_agent', sa.Text, nullable=True),
        sa.Column('response_time', sa.Float, nullable=True),
        sa.Column('error', sa.Text, nullable=True),
        sa.ForeignKeyConstraint(['api_key_id'], ['api_keys.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create rate_limit_windows table with partitioning
    op.execute("""
        CREATE TABLE rate_limit_windows (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            api_key_id UUID NOT NULL,
            window_start TIMESTAMP WITHOUT TIME ZONE NOT NULL,
            request_count INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE CASCADE
        ) PARTITION BY RANGE (window_start);
        
        -- Create initial partitions for current month and next month
        CREATE TABLE rate_limit_windows_y2025m08 PARTITION OF rate_limit_windows
            FOR VALUES FROM ('2025-08-01') TO ('2025-09-01');
            
        CREATE TABLE rate_limit_windows_y2025m09 PARTITION OF rate_limit_windows
            FOR VALUES FROM ('2025-09-01') TO ('2025-10-01');
            
        -- Create indexes
        CREATE INDEX idx_rate_limit_windows_api_key_id ON rate_limit_windows(api_key_id);
        CREATE INDEX idx_rate_limit_windows_window_start ON rate_limit_windows(window_start);
    """)
    
    # Create a function to automatically create new partitions
    op.execute("""
        CREATE OR REPLACE FUNCTION create_monthly_rate_limit_partitions()
        RETURNS TRIGGER AS $$
        DECLARE
            next_month text;
            next_month_start timestamp;
            next_month_end timestamp;
            partition_name text;
        BEGIN
            -- Create partition for next month if it doesn't exist
            next_month := to_char(CURRENT_DATE + INTERVAL '1 month', 'YYYY-MM' || '-01');
            next_month_start := next_month::timestamp;
            next_month_end := (next_month_start + INTERVAL '1 month')::timestamp;
            partition_name := 'rate_limit_windows_' || to_char(next_month_start, 'y"m"m');
            
            IF NOT EXISTS (
                SELECT 1 
                FROM pg_tables 
                WHERE schemaname = 'public' 
                AND tablename = partition_name
            ) THEN
                EXECUTE format(
                    'CREATE TABLE %I PARTITION OF rate_limit_windows ' ||
                    'FOR VALUES FROM (%L) TO (%L)',
                    partition_name, next_month_start, next_month_end
                );
            END IF;
            
            -- Create partition for current month if it doesn't exist
            next_month := to_char(CURRENT_DATE, 'YYYY-MM' || '-01');
            next_month_start := next_month::timestamp;
            next_month_end := (next_month_start + INTERVAL '1 month')::timestamp;
            partition_name := 'rate_limit_windows_' || to_char(next_month_start, 'y"m"m');
            
            IF NOT EXISTS (
                SELECT 1 
                FROM pg_tables 
                WHERE schemaname = 'public' 
                AND tablename = partition_name
            ) THEN
                EXECUTE format(
                    'CREATE TABLE %I PARTITION OF rate_limit_windows ' ||
                    'FOR VALUES FROM (%L) TO (%L)',
                    partition_name, next_month_start, next_month_end
                );
            END IF;
            
            RETURN NULL;
        END;
        $$ LANGUAGE plpgsql;
        
        -- Create a trigger to create new partitions
        CREATE TRIGGER trg_create_monthly_rate_limit_partitions
        AFTER INSERT ON rate_limit_windows
        EXECUTE FUNCTION create_monthly_rate_limit_partitions();
    """)

def downgrade():
    # Drop the trigger and function first
    op.execute("DROP TRIGGER IF EXISTS trg_create_monthly_rate_limit_partitions ON rate_limit_windows;")
    op.execute("DROP FUNCTION IF EXISTS create_monthly_rate_limit_partitions();")
    
    # Drop the tables in reverse order
    op.drop_table('rate_limit_windows')
    op.drop_table('api_key_usages')
    op.drop_table('api_keys')
