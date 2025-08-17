import asyncio
import sys
from pathlib import Path

# Add the project root to the Python path
project_root = str(Path(__file__).parent.absolute())
sys.path.insert(0, project_root)

from sqlalchemy import text
from app.core.config import settings
from app.models.database import engine, Base, init_db
from app.models.user import User
from app.models.task import Task
from app.models.subscription_models import Subscription, Invoice
from app.models.ai_models import DBAIModel, UserAIModelSettings, AIProvider, AIModelStatus
from app.core.security import get_password_hash

# Initial AI Models to create
DEFAULT_AI_MODELS = [
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
        "name": "Claude 3 Opus",
        "model_id": "claude-3-opus-20240229",
        "provider": AIProvider.ANTHROPIC,
        "is_available": True,
        "status": AIModelStatus.ACTIVE,
        "max_tokens": 200000,
        "description": "Most powerful model from Anthropic, great for complex reasoning"
    },
    {
        "name": "GPT-3.5 Turbo",
        "model_id": "gpt-3.5-turbo",
        "provider": AIProvider.OPENAI,
        "is_available": True,
        "status": AIModelStatus.ACTIVE,
        "max_tokens": 4096,
        "description": "Fast and capable model at a lower cost than GPT-4"
    },
]

async def create_initial_data():
    """Create initial data for the application"""
    from sqlalchemy.ext.asyncio import AsyncSession
    from app.models.database import async_session_factory
    
    async with async_session_factory() as session:
        # Create default admin user if not exists
        admin = await session.get(User, 1)
        if not admin and settings.FIRST_SUPERUSER_EMAIL and settings.FIRST_SUPERUSER_PASSWORD:
            admin = User(
                email=settings.FIRST_SUPERUSER_EMAIL,
                hashed_password=get_password_hash(settings.FIRST_SUPERUSER_PASSWORD),
                is_superuser=True,
                is_active=True,
                full_name="Admin User",
                email_verified=True
            )
            session.add(admin)
            print("✅ Created default admin user")
        
        # Create default AI models if they don't exist
        for model_data in DEFAULT_AI_MODELS:
            model = await session.execute(
                text("SELECT * FROM ai_models WHERE model_id = :model_id"),
                {"model_id": model_data["model_id"]}
            )
            if not model.first():
                model = DBAIModel(**model_data)
                session.add(model)
                print(f"✅ Created AI model: {model_data['name']}")
        
        await session.commit()

async def check_database():
    """Check database connection and list tables"""
    try:
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"))
            tables = [row[0] for row in result]
            print("\n✅ Database connection successful!")
            print("\nTables in the database:", tables)
            
            for table in tables:
                if table != 'alembic_version':
                    print(f"\nTable: {table}")
                    result = await conn.execute(text(f"PRAGMA table_info({table});"))
                    for row in result:
                        print(f"- {row[1]} ({row[2]})")
    except Exception as e:
        print(f"❌ Error connecting to database: {e}")
        raise

async def main():
    """Main function to initialize the database"""
    print("🚀 Initializing database...")
    
    # Create all tables
    await init_db()
    
    # Create initial data
    await create_initial_data()
    
    # Check database and list tables
    await check_database()
    
    print("\n✅ Database initialization complete!")

if __name__ == "__main__":
    asyncio.run(main())
