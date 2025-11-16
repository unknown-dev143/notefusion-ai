""
Database configuration and session management for the application.

This module provides database connection setup, session management, and
utilities for working with SQLAlchemy in an async context.
"""
import os
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    create_async_engine,
    async_sessionmaker,
    AsyncAttrs,
)
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from sqlalchemy.pool import NullPool

from app.core.config import settings

# Create database engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    future=True,
    pool_pre_ping=True,
    pool_recycle=3600,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {},
    poolclass=NullPool if settings.TESTING else None,
)

# Create async session factory
async_session_factory = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)

# Base class for all models
class Base(AsyncAttrs, DeclarativeBase):
    """Base class for all SQLAlchemy models."""
    pass

# Dependency to get DB session
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    ""
    Dependency function that yields database sessions.
    
    Yields:
        AsyncSession: A database session
        
    Example:
        async with get_db() as db:
            result = await db.execute(select(User))
            users = result.scalars().all()
    """
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

# For use in FastAPI dependencies
SessionLocal = async_session_factory

# Import models to ensure they are registered with Base
from app.models.user import User  # noqa
from app.models.task import Task  # noqa
from app.models.subscription_models import Subscription, Invoice  # noqa
from app.models.ai_models import DBAIModel, UserAIModelSettings  # noqa

__all__ = [
    "Base",
    "engine",
    "get_db",
    "async_session_factory",
    "SessionLocal",
]
