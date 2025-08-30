"""Initialize the database and apply migrations."""
import asyncio
import logging
from pathlib import Path
import sys

# Add the project root to the Python path
project_root = str(Path(__file__).parent.parent.absolute())
sys.path.insert(0, project_root)

from alembic.config import Config
from alembic import command
from app.core.config import settings
from app.database import Base, engine, get_db
from sqlalchemy_utils import create_database, database_exists

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

ALEMBIC_INI_PATH = Path(__file__).parent.parent / "alembic.ini"
ALEMBIC_SCRIPT_LOCATION = Path(__file__).parent.parent / "alembic"

def run_migrations():
    """Run database migrations using Alembic."""
    logger.info("Running database migrations...")
    
    # Configure Alembic
    alembic_cfg = Config(ALEMBIC_INI_PATH)
    alembic_cfg.set_main_option("script_location", str(ALEMBIC_SCRIPT_LOCATION))
    alembic_cfg.set_main_option("sqlalchemy.url", str(settings.DATABASE_URL))
    
    # Run migrations
    command.upgrade(alembic_cfg, "head")
    logger.info("Database migrations completed successfully")

async def init_models():
    """Initialize database models."""
    logger.info("Creating database tables...")
    
    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    logger.info("Database tables created successfully")

async def init():
    """Initialize the database."""
    logger.info("Initializing database...")
    
    # Create database if it doesn't exist (for SQLite, this happens automatically)
    if not database_exists(str(settings.DATABASE_URL)):
        logger.info("Creating database...")
        create_database(str(settings.DATABASE_URL))
    
    # Initialize models
    await init_models()
    
    # Run migrations
    run_migrations()
    
    logger.info("Database initialization complete")

if __name__ == "__main__":
    asyncio.run(init())
