#!/usr/bin/env python3
"""Run database migrations."""
import asyncio
import os
import sys
from pathlib import Path

# Add the app directory to the Python path
sys.path.append(str(Path(__file__).parent.parent))

from alembic.config import Config
from alembic import command

# Initialize logging
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get the directory containing this script
BASE_DIR = Path(__file__).parent.parent
ALEMBIC_INI = BASE_DIR / "alembic.ini"
ALEMBIC_DIR = BASE_DIR / "alembic"

def run_migrations():
    """Run database migrations."""
    logger.info("Running database migrations...")
    
    # Configure Alembic
    alembic_cfg = Config(ALEMBIC_INI)
    alembic_cfg.set_main_option("script_location", str(ALEMBIC_DIR))
    
    # Run migrations
    command.upgrade(alembic_cfg, "head")
    logger.info("Database migrations completed successfully")

def create_migration(message: str):
    """Create a new migration.
    
    Args:
        message: Description of the migration
    """
    if not message:
        logger.error("Migration message is required")
        return
        
    logger.info(f"Creating new migration: {message}")
    
    # Configure Alembic
    alembic_cfg = Config(ALEMBIC_INI)
    alembic_cfg.set_main_option("script_location", str(ALEMBIC_DIR))
    
    # Create migration
    command.revision(alembic_cfg, autogenerate=True, message=message)
    logger.info("Migration created. Don't forget to review and edit the generated file.")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Database migration utility")
    subparsers = parser.add_subparsers(dest="command", help="Command to run")
    
    # Migrate command
    migrate_parser = subparsers.add_parser("migrate", help="Run database migrations")
    
    # Create migration command
    create_parser = subparsers.add_parser("create", help="Create a new migration")
    create_parser.add_argument("message", help="Description of the migration")
    
    args = parser.parse_args()
    
    if args.command == "migrate":
        run_migrations()
    elif args.command == "create":
        create_migration(args.message)
    else:
        parser.print_help()
