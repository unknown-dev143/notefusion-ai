"""
Run database migrations programmatically.
This script initializes the database and applies all pending migrations.
"""
import os
import sys
from alembic.config import Config
from alembic import command

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def run_migrations():
    """Run database migrations."""
    # Get the directory containing this script
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Path to the alembic.ini file
    alembic_ini_path = os.path.join(current_dir, 'alembic.ini')
    
    # Path to the migrations directory
    migrations_dir = os.path.join(current_dir, 'alembic')
    
    # Create Alembic config
    alembic_cfg = Config(alembic_ini_path)
    
    # Set the script location
    alembic_cfg.set_main_option('script_location', migrations_dir)
    
    # Run the migrations
    print("Running database migrations...")
    command.upgrade(alembic_cfg, 'head')
    print("Migrations completed successfully!")

if __name__ == '__main__':
    run_migrations()
