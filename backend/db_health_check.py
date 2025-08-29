"""Database health check script for NoteFusion AI backend."""
import asyncio
import logging
import os
from pathlib import Path

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add the project root to the Python path
import sys
sys.path.append(str(Path(__file__).parent))

# Import database components
from app.core.database import database, Base
from app.models.user import User
from app.models.note import Note
from app.models.task import Task

async def check_database_connection():
    """Check if the database connection is working."""
    try:
        logger.info("Testing database connection...")
        await database.connect()
        logger.info("✅ Database connection successful!")
        return True
    except Exception as e:
        logger.error(f"❌ Database connection failed: {e}")
        return False
    finally:
        await database.disconnect()

async def check_database_tables():
    """Check if all required database tables exist."""
    try:
        logger.info("Checking database tables...")
        async with database.engine.begin() as conn:
            # Check if tables exist
            result = await conn.execute(
                "SELECT name FROM sqlite_master WHERE type='table'"
            )
            tables = [row[0] for row in result]
            
            required_tables = ["users", "notes", "tasks"]
            missing_tables = [t for t in required_tables if t not in tables]
            
            if missing_tables:
                logger.warning(f"⚠️  Missing tables: {', '.join(missing_tables)}")
                return False
            
            logger.info("✅ All required tables exist")
            return True
    except Exception as e:
        logger.error(f"❌ Error checking database tables: {e}")
        return False

async def check_environment_variables():
    """Check if all required environment variables are set."""
    required_vars = [
        "DATABASE_URL",
        "SECRET_KEY",
        "JWT_SECRET_KEY",
        "OPENAI_API_KEY"
    ]
    
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        logger.warning(f"⚠️  Missing required environment variables: {', '.join(missing_vars)}")
        return False
    
    logger.info("✅ All required environment variables are set")
    return True

async def main():
    """Run all health checks."""
    logger.info("=== NoteFusion AI Database Health Check ===\n")
    
    # Check environment variables first
    env_ok = await check_environment_variables()
    if not env_ok:
        logger.warning("Please set the missing environment variables in your .env file")
    
    # Check database connection
    conn_ok = await check_database_connection()
    
    # Check database tables
    if conn_ok:
        await check_database_tables()
    
    logger.info("\n=== Health Check Complete ===")

if __name__ == "__main__":
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    # Run the health check
    asyncio.run(main())
