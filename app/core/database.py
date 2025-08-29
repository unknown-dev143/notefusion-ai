import os
import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator, Optional

from sqlalchemy.ext.asyncio import (
    create_async_engine,
    AsyncSession,
    async_sessionmaker,
    AsyncEngine
)
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import NullPool, QueuePool
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import settings
from app.core.logging import logger

# Configure SQLAlchemy logging
logging.getLogger('sqlalchemy.engine').setLevel(
    logging.INFO if settings.DEBUG else logging.WARNING
)

def create_db_engine() -> AsyncEngine:
    """Create and configure the async SQLAlchemy engine."""
    # Use test database for testing
    if os.getenv("TESTING", "").lower() == "true":
        return create_async_engine(
            "sqlite+aiosqlite:///:memory:",
            echo=settings.DEBUG,
            poolclass=NullPool  # Use NullPool for SQLite in-memory
        )
    
    # Configure connection pool for production/development
    pool_size = settings.DATABASE_POOL_SIZE
    max_overflow = max(10, pool_size * 2)
    
    return create_async_engine(
        settings.DATABASE_URL,
        echo=settings.DEBUG,
        pool_size=pool_size,
        max_overflow=max_overflow,
        pool_pre_ping=settings.DATABASE_POOL_PRE_PING,
        pool_recycle=settings.DATABASE_POOL_RECYCLE,
        pool_timeout=settings.DATABASE_POOL_TIMEOUT,
        connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
    )

# Create engine and session factory
engine = create_db_engine()

# Configure session factory with appropriate settings
SessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
    future=True
)

# Base class for declarative models
Base = declarative_base()

# Import models to ensure they are registered with SQLAlchemy
# This must be done after Base is defined and before creating tables
from app.models.user import User, UserSession  # noqa: F401
from app.models.note import Note  # noqa: F401

# Re-export for easier imports
Base = Base

@asynccontextmanager
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for getting async DB session.
    
    Yields:
        AsyncSession: An async database session.
        
    Example:
        async with get_db() as session:
            result = await session.execute(select(User))
            users = result.scalars().all()
    """
    session = SessionLocal()
    try:
        yield session
        await session.commit()
    except SQLAlchemyError as e:
        await session.rollback()
        logger.error(f"Database error: {str(e)}")
        raise
    finally:
        await session.close()

async def init_db() -> None:
    ""
    Initialize the database by creating all tables.
    
    This should be called during application startup.
    """
    async with engine.begin() as conn:
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
    
    logger.info("Database initialized")

async def close_db() -> None:
    ""Close the database connections."""
    if engine is not None:
        await engine.dispose()
    logger.info("Database connections closed")
