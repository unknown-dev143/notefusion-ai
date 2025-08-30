#!/usr/bin/env python3
"""Initialize the database and run migrations."""
import asyncio
import os
import sys
from pathlib import Path

# Add the app directory to the Python path
sys.path.append(str(Path(__file__).parent.parent))

from alembic.config import Config
from alembic import command
from app.models.database import Base, engine, SessionLocal
from app.models.user import User
from app.models.ai_models import DBAIModel, UserAIModelSettings, AIProvider, AIModelStatus

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

async def create_initial_data():
    """Create initial data in the database."""
    logger.info("Creating initial data...")
    
    async with SessionLocal() as session:
        # Create default AI models if they don't exist
        models = [
            {
                "name": "GPT-4",
                "model_id": "gpt-4",
                "provider": AIProvider.OPENAI,
                "is_available": True,
                "status": AIModelStatus.ACTIVE,
                "max_tokens": 8192,
                "description": "Most capable GPT-4 model, optimized for complex tasks"
            },
            {
                "name": "GPT-4 Turbo",
                "model_id": "gpt-4-turbo-preview",
                "provider": AIProvider.OPENAI,
                "is_available": True,
                "status": AIModelStatus.ACTIVE,
                "max_tokens": 128000,
                "description": "Latest GPT-4 model with improved capabilities and 128k context"
            },
            {
                "name": "GPT-3.5 Turbo",
                "model_id": "gpt-3.5-turbo",
                "provider": AIProvider.OPENAI,
                "is_available": True,
                "status": AIModelStatus.ACTIVE,
                "max_tokens": 16385,
                "description": "Fast and capable model, good for most tasks"
            },
            {
                "name": "GPT-5",
                "model_id": "gpt-5",
                "provider": AIProvider.OPENAI,
                "is_available": False,
                "status": AIModelStatus.BETA,
                "max_tokens": 128000,
                "description": "Next generation model with advanced capabilities"
            }
        ]
        
        # Add models to the database
        for model_data in models:
            existing = await session.execute(
                sa.select(DBAIModel).where(DBAIModel.model_id == model_data["model_id"])
            )
            if not existing.scalar_one_or_none():
                model = DBAIModel(**model_data)
                session.add(model)
                logger.info(f"Added model: {model.name}")
        
        await session.commit()
    
    logger.info("Initial data creation completed")

async def init_db():
    """Initialize the database."""
    try:
        # Create tables
        logger.info("Creating database tables...")
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        
        # Run migrations
        run_migrations()
        
        # Create initial data
        await create_initial_data()
        
        logger.info("Database initialization completed successfully")
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        raise

if __name__ == "__main__":
    import asyncio
    asyncio.run(init_db())
