"""Initialize the database and run migrations."""
import asyncio
import os
import sys
from pathlib import Path

# Add the project root to the Python path
sys.path.append(str(Path(__file__).parent))

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Import database and models
from app.core.database import database, Base
from app.models.user import User
from app.models.note import Note
from app.models.task import Task

async def init_models():
    """Initialize database models."""
    print("Initializing database models...")
    try:
        # Connect to the database
        await database.connect()
        
        # Create tables
        print("Creating database tables...")
        async with database.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            
        print("✅ Database tables created successfully")
        return True
        
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        return False
    finally:
        await database.disconnect()

async def run_migrations():
    """Run database migrations using Alembic."""
    print("\nRunning database migrations...")
    try:
        from alembic.config import Config
        from alembic import command
        
        # Get the directory containing this script
        script_dir = Path(__file__).parent
        
        # Set up Alembic configuration
        config = Config("alembic.ini")
        config.set_main_option('script_location', str(script_dir / 'alembic'))
        
        # Run migrations
        command.upgrade(config, 'head')
        print("✅ Database migrations completed successfully")
        return True
        
    except Exception as e:
        print(f"❌ Error running migrations: {e}")
        return False

async def check_database():
    """Verify the database is accessible."""
    print("\nVerifying database connection...")
    try:
        await database.connect()
        print("✅ Database connection successful")
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False
    finally:
        await database.disconnect()

async def main():
    """Main function to initialize the database."""
    print("=== NoteFusion AI Database Initialization ===\n")
    
    # Check database connection first
    if not await check_database():
        print("\n❌ Please check your database configuration in .env")
        return
    
    # Run migrations
    if not await run_migrations():
        print("\n❌ Failed to run migrations")
        return
    
    # Initialize models
    if not await init_models():
        print("\n❌ Failed to initialize database models")
        return
    
    print("\n✅ Database initialization completed successfully!")

if __name__ == "__main__":
    asyncio.run(main())
    input("\nPress Enter to exit...")
