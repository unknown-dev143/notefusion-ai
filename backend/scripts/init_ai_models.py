"""
Initialize the database with default AI models.

This script should be run after database migrations have been applied.
"""
import asyncio
import sys
from pathlib import Path

# Add the project root to the Python path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

from app.models.database import engine, Base, get_db
from app.models.ai_models import DBAIModel, AIProvider, AIModelStatus
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession

# Default models to be added to the database
DEFAULT_MODELS = [
    {
        "name": "GPT-4o",
        "model_id": "gpt-4o",
        "provider": AIProvider.OPENAI,
        "is_available": True,
        "status": AIModelStatus.ACTIVE,
        "max_tokens": 128000,
        "description": "OpenAI's most advanced model, optimized for speed and intelligence."
    },
    {
        "name": "GPT-4-turbo",
        "model_id": "gpt-4-turbo",
        "provider": AIProvider.OPENAI,
        "is_available": True,
        "status": AIModelStatus.ACTIVE,
        "max_tokens": 128000,
        "description": "The latest GPT-4 model with improved instruction following, JSON mode, and parallel function calling."
    },
    {
        "name": "GPT-4",
        "model_id": "gpt-4",
        "provider": AIProvider.OPENAI,
        "is_available": True,
        "status": AIModelStatus.ACTIVE,
        "max_tokens": 8192,
        "description": "More capable than any GPT-3.5 model, able to do more complex tasks."
    },
    {
        "name": "GPT-3.5 Turbo",
        "model_id": "gpt-3.5-turbo",
        "provider": AIProvider.OPENAI,
        "is_available": True,
        "status": AIModelStatus.ACTIVE,
        "max_tokens": 16385,
        "description": "Most capable GPT-3.5 model and optimized for chat at 1/10th the cost of text-davinci-003."
    },
    {
        "name": "Claude 3 Opus",
        "model_id": "claude-3-opus-20240229",
        "provider": AIProvider.ANTHROPIC,
        "is_available": False,
        "status": AIModelStatus.ACTIVE,
        "max_tokens": 200000,
        "description": "Most capable model, delivering state-of-the-art performance on highly complex tasks."
    },
    {
        "name": "Claude 3 Sonnet",
        "model_id": "claude-3-sonnet-20240229",
        "provider": AIProvider.ANTHROPIC,
        "is_available": False,
        "status": AIModelStatus.ACTIVE,
        "max_tokens": 200000,
        "description": "Ideal balance of intelligence and speed for enterprise workloads."
    }
]

async def init_models():
    """Initialize the database with default AI models."""
    # Create tables if they don't exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Create a session
    async_session = sessionmaker(
        engine, expire_on_commit=False, class_=AsyncSession
    )
    
    async with async_session() as session:
        # Check if models already exist
        existing_models = await session.execute(
            "SELECT model_id FROM ai_models"
        )
        existing_model_ids = {row[0] for row in existing_models}
        
        # Add new models that don't exist yet
        added = 0
        for model_data in DEFAULT_MODELS:
            if model_data["model_id"] not in existing_model_ids:
                model = DBAIModel(**model_data)
                session.add(model)
                added += 1
        
        if added > 0:
            await session.commit()
            print(f"Added {added} new AI models to the database.")
        else:
            print("All default AI models already exist in the database.")

if __name__ == "__main__":
    print("Initializing AI models in the database...")
    asyncio.run(init_models())
