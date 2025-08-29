#!/usr/bin/env python
"""
Run database migrations for NoteFusion AI.
This script initializes the database and applies all pending migrations.
"""
import os
import sys
import asyncio
from pathlib import Path

# Add the project root to the Python path
project_root = str(Path(__file__).parent.absolute())
sys.path.insert(0, project_root)

from alembic.config import Config
from alembic import command
from app.core.config import settings
from app.core.database import engine, Base, init_db, close_db

async def run_migrations():
    """Run database migrations using Alembic."""
    print("🚀 Starting database migrations...")
    
    # Initialize database connection
    await init_db()
    
    try:
        # Configure Alembic
        alembic_cfg = Config(os.path.join(project_root, "backend", "alembic.ini"))
        
        # Set the database URL from settings
        alembic_cfg.set_main_option("sqlalchemy.url", str(settings.DATABASE_URL))
        
        # Run migrations
        print("🔄 Running migrations...")
        command.upgrade(alembic_cfg, "head")
        
        print("✅ Database migrations completed successfully!")
        
    except Exception as e:
        print(f"❌ Error running migrations: {str(e)}")
        sys.exit(1)
        
    finally:
        # Close database connection
        await close_db()

if __name__ == "__main__":
    asyncio.run(run_migrations())
