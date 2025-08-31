"""Database configuration and base models."""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker, AsyncAttrs
from sqlalchemy import MetaData, Column, Integer, String, DateTime, JSON, Text, ForeignKey, Boolean, select
from sqlalchemy.orm import DeclarativeBase, declared_attr
import os

# Define metadata object
class Base(AsyncAttrs, DeclarativeBase):
    """Base class for all models."""
    pass

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./notefusion.db")

# Create async engine
engine = create_async_engine(
    DATABASE_URL,
    echo=True,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

# Create async session factory
async_session_factory = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

# For backward compatibility
SessionLocal = async_session_factory

# Add as_dict and update methods to Base
Base.as_dict = lambda self: {c.name: getattr(self, c.name) for c in self.__table__.columns}
Base.update = lambda self, **kwargs: [setattr(self, k, v) for k, v in kwargs.items() if hasattr(self, k)]

async def get_db() -> AsyncSession:
    """Dependency for getting async DB session."""
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

# Import all models to ensure they are registered with SQLAlchemy
# This must be after Base is defined but before any model is used
from .user_clean import User
from .task import Task
from .subscription import Subscription, Invoice
from .ai_models import DBAIModel, UserAIModelSettings

# Re-export models for convenience
__all__ = [
    'Base',
    'SessionLocal',
    'User',
    'Task',
    'Subscription',
    'Invoice',
    'DBAIModel',
    'UserAIModelSettings'
]
