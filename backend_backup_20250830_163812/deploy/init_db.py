"""
Database initialization script for NoteFusion AI.

This script handles:
- Database schema creation
- Initial data population
- Database migrations
- Performance optimizations
- Security configurations
"""
import asyncio
import logging
import os
import sys
from pathlib import Path
from typing import Optional

# Add project root to path
project_root = str(Path(__file__).parent.parent)
if project_root not in sys.path:
    sys.path.append(project_root)

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.core.database import Base, get_db_url, get_async_engine
from app.models import *  # Import all models to ensure they're registered with SQLAlchemy

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Constants
DEFAULT_ADMIN_EMAIL = os.getenv("DEFAULT_ADMIN_EMAIL", "admin@notefusion.ai")
DEFAULT_ADMIN_PASSWORD = os.getenv("DEFAULT_ADMIN_PASSWORD", "ChangeMe123!")

async def check_database_connection(engine) -> bool:
    """Check if we can connect to the database."""
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
            return True
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return False

async def create_initial_admin(db: AsyncSession):
    """Create initial admin user if none exists."""
    from app.models.user import User
    from app.core.security import get_password_hash
    
    # Check if admin exists
    result = await db.execute(text("SELECT id FROM users WHERE is_superuser = TRUE LIMIT 1"))
    if result.scalar_one_or_none() is None:
        logger.info("Creating initial admin user...")
        admin = User(
            email=DEFAULT_ADMIN_EMAIL,
            hashed_password=get_password_hash(DEFAULT_ADMIN_PASSWORD),
            is_superuser=True,
            is_active=True,
            is_verified=True,
            full_name="System Administrator"
        )
        db.add(admin)
        await db.commit()
        logger.info(f"Created admin user: {DEFAULT_ADMIN_EMAIL}")
    else:
        logger.info("Admin user already exists")

async def apply_database_optimizations(engine):
    """Apply performance optimizations to the database."""
    optimizations = [
        "SET statement_timeout = 0",
        "SET lock_timeout = 30000",  # 30 seconds
        "SET idle_in_transaction_session_timeout = 300000",  # 5 minutes
        "SET client_encoding = 'UTF8'",
        "SET standard_conforming_strings = on",
        "SET check_function_bodies = false",
        "SET xmloption = content",
        "SET client_min_messages = warning",
        "SET row_security = off",
    ]
    
    async with engine.begin() as conn:
        for stmt in optimizations:
            try:
                await conn.execute(text(stmt))
            except Exception as e:
                logger.warning(f"Could not apply optimization '{stmt}': {e}")

async def init_db():
    """Initialize the database with tables and initial data."""
    # Get database URL and create engine
    database_url = get_db_url()
    engine = get_async_engine(database_url)
    
    # Verify database connection
    if not await check_database_connection(engine):
        logger.error("Failed to connect to the database. Please check your database configuration.")
        sys.exit(1)
    
    logger.info("Creating database tables...")
    try:
        async with engine.begin() as conn:
            # Create all tables
            await conn.run_sync(Base.metadata.create_all)
            logger.info("Database tables created successfully")
            
            # Apply optimizations
            await apply_database_optimizations(engine)
            
    except Exception as e:
        logger.error(f"Failed to create database tables: {e}")
        raise
    
    # Initialize database session
    async_session = sessionmaker(
        engine, expire_on_commit=False, class_=AsyncSession
    )
    
    # Create initial admin user
    async with async_session() as db:
        await create_initial_admin(db)
    
    logger.info("Database initialization complete!")

if __name__ == "__main__":
    # Ensure we're in the correct directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv(os.path.join(Path(__file__).parent.parent, ".env"))
    
    # Run the async function
    try:
        asyncio.run(init_db())
        logger.info("Database initialization completed successfully!")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        sys.exit(1)
