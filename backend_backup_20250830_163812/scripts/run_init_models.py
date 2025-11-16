"""
Script to initialize the database with default AI models.

This script should be run after the database has been created and migrations have been applied.
"""
import asyncio
import os
import sys
from pathlib import Path
from datetime import datetime

# Add the project root to the Python path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

# Set up environment variables
os.environ["ENVIRONMENT"] = "development"
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./test.db"

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, ForeignKey
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.sql import text

# Define the Base class for models
Base = declarative_base()

# Define the AI model
class DBAIModel(Base):
    """Database model for AI models."""
    __tablename__ = "ai_models"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    model_id = Column(String, unique=True, nullable=False, index=True)
    provider = Column(String, nullable=False)  # 'openai', 'anthropic', etc.
    is_available = Column(Boolean, default=True)
    status = Column(String, default='active')  # 'active', 'beta', 'deprecated', etc.
    max_tokens = Column(Integer, nullable=True)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Create the database engine
db_url = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./test.db")
engine = create_async_engine(
    db_url,
    echo=True,
    future=True,
    pool_pre_ping=True,
    pool_recycle=3600,
)

# Default models to be added to the database
DEFAULT_MODELS = [
    {
        "name": "GPT-4o",
        "model_id": "gpt-4o",
        "provider": "openai",
        "is_available": True,
        "status": "active",
        "max_tokens": 128000,
        "description": "OpenAI's most advanced model, optimized for speed and intelligence."
    },
    {
        "name": "GPT-4-turbo",
        "model_id": "gpt-4-turbo",
        "provider": "openai",
        "is_available": True,
        "status": "active",
        "max_tokens": 128000,
        "description": "The latest GPT-4 model with improved instruction following, JSON mode, and parallel function calling."
    },
    {
        "name": "GPT-4",
        "model_id": "gpt-4",
        "provider": "openai",
        "is_available": True,
        "status": "active",
        "max_tokens": 8192,
        "description": "More capable than any GPT-3.5 model, able to do more complex tasks."
    },
    {
        "name": "GPT-3.5 Turbo",
        "model_id": "gpt-3.5-turbo",
        "provider": "openai",
        "is_available": True,
        "status": "active",
        "max_tokens": 16385,
        "description": "Most capable GPT-3.5 model and optimized for chat at 1/10th the cost of text-davinci-003."
    },
    {
        "name": "Claude 3 Opus",
        "model_id": "claude-3-opus-20240229",
        "provider": "anthropic",
        "is_available": False,
        "status": "active",
        "max_tokens": 200000,
        "description": "Most capable model, delivering state-of-the-art performance on highly complex tasks."
    },
    {
        "name": "Claude 3 Sonnet",
        "model_id": "claude-3-sonnet-20240229",
        "provider": "anthropic",
        "is_available": False,
        "status": "active",
        "max_tokens": 200000,
        "description": "Ideal balance of intelligence and speed for enterprise workloads."
    }
]

async def init_models():
    """Initialize the database with default AI models."""
    # Create a new async engine
    db_url = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./test.db")
    engine = create_async_engine(db_url, echo=True)
    
    # Create tables if they don't exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Create a session
    async_session = sessionmaker(
        engine, expire_on_commit=False, class_=AsyncSession
    )
    
    async with async_session() as session:
        # Check if models already exist
        result = await session.execute(text("SELECT model_id FROM ai_models"))
        existing_models = result.scalars().all()
        existing_model_ids = set(existing_models)
        
        # Add new models that don't exist yet
        added = 0
        for model_data in DEFAULT_MODELS:
            if model_data["model_id"] not in existing_model_ids:
                model = DBAIModel(**model_data)
                session.add(model)
                added += 1
        
        if added > 0:
            await session.commit()
            print(f"✅ Added {added} new AI models to the database.")
        else:
            print("ℹ️  All default AI models already exist in the database.")

if __name__ == "__main__":
    print("🚀 Initializing AI models in the database...")
    asyncio.run(init_models())
