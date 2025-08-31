"""Database models package."""
from typing import AsyncGenerator, Optional
from sqlalchemy.ext.asyncio import AsyncSession

# Import Base and Session first to avoid circular imports
from .database_clean import Base, SessionLocal, engine, async_session_factory, metadata

# Import all models to ensure they are registered with SQLAlchemy
# The order matters to avoid circular imports
from .user_clean import User
from .ai_models import DBAIModel, UserAIModelSettings, AIProvider, AIModelStatus
from .task import Task, TaskStatus, TaskType
from .user_task import UserTask, TaskStatus as UserTaskStatus, TaskPriority
from .subscription import (
    Subscription, 
    Invoice, 
    SubscriptionTier, 
    SubscriptionStatus, 
    get_subscription_features
)
from .flashcard import Flashcard

# Re-export common types and models
__all__ = [
    'Base',
    'metadata',
    'User',
    'Task',
    'TaskStatus',
    'TaskType',
    'UserTask',
    'UserTaskStatus',
    'TaskPriority',
    'Subscription',
    'Invoice',
    'SubscriptionTier',
    'SubscriptionStatus',
    'DBAIModel',
    'UserAIModelSettings',
    'AIProvider',
    'AIModelStatus',
    'Flashcard',
    'get_subscription_features',
    'get_db',
    'SessionLocal',
    'async_session_factory',
    'engine'
]

# Dependency to get DB session
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency that provides a database session.
    
    Yields:
        AsyncSession: An async database session
        
    Example:
        ```python
        async with get_db() as db:
            # Use db session here
            result = await db.execute(select(User).where(User.id == user_id))
            user = result.scalar_one_or_none()
        ```
    """
    async with SessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise