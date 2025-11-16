#!/usr/bin/env python3
"""Run database migrations."""
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

if __name__ == "__main__":
    run_migrations()
