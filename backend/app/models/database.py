<<<<<<< HEAD
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker, AsyncAttrs, AsyncEngine
from sqlalchemy.orm import DeclarativeBase, declared_attr, Mapped, mapped_column, sessionmaker
from sqlalchemy.pool import NullPool, AsyncAdaptedQueuePool
from sqlalchemy import MetaData, Column, Integer, String, DateTime, JSON, Text, ForeignKey, Boolean, select
from sqlalchemy.ext.asyncio import AsyncSession as _AsyncSession
from typing import AsyncGenerator, Optional, Type, TypeVar, Any, Dict, List, cast
=======
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker, AsyncAttrs
from sqlalchemy.orm import DeclarativeBase, declared_attr, Mapped, mapped_column
from sqlalchemy.pool import NullPool
from sqlalchemy import MetaData, Column, Integer, String, DateTime, JSON, Text, ForeignKey, Boolean
from typing import AsyncGenerator, Optional, Type, TypeVar, Any, Dict, List
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
import os
import uuid
import json
from datetime import datetime
<<<<<<< HEAD
from contextlib import asynccontextmanager, asynccontextmanager
=======
from contextlib import asynccontextmanager
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
from pydantic import BaseModel

from ..config import settings

# Define naming convention for database constraints
convention = {
    "ix": 'ix_%(column_0_label)s',
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s"
}

# Create metadata with naming convention
metadata = MetaData(naming_convention=convention)

<<<<<<< HEAD
class Base(DeclarativeBase):
=======
class Base(AsyncAttrs, DeclarativeBase):
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
    """Base class for all models."""
    __abstract__ = True
    metadata = metadata
    
    @declared_attr.directive
    def __tablename__(cls) -> str:
        return cls.__name__.lower()
    
    def as_dict(self) -> Dict[str, Any]:
        """Convert model to dictionary."""
        result = {}
        for column in self.__table__.columns:
            value = getattr(self, column.name)
            if isinstance(value, datetime):
                value = value.isoformat()
            result[column.name] = value
        return result
    
    def update(self, **kwargs) -> None:
        """Update model attributes."""
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)

<<<<<<< HEAD
# Create database engine with connection pooling
engine: AsyncEngine = create_async_engine(
    settings.DATABASE_URL,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_timeout=settings.DB_POOL_TIMEOUT,
    pool_recycle=settings.DB_POOL_RECYCLE,
    pool_pre_ping=settings.DB_POOL_PRE_PING,
    poolclass=AsyncAdaptedQueuePool,
    echo=settings.SQL_ECHO,
    future=True
)

# Create async session factory
=======
# Create database engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    future=True,
    pool_pre_ping=True,
    pool_recycle=3600,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

# Create session factory
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
async_session_factory = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
<<<<<<< HEAD
    autoflush=False,
    future=True
)

# For backward compatibility
SessionLocal = async_session_factory

=======
    autocommit=False,
    autoflush=False,
)

>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
# Import all models to ensure they are registered with SQLAlchemy
# This must be after Base is defined but before any model is used
from .user import User
from .task import Task
from .subscription_models import Subscription, Invoice
from .ai_models import DBAIModel, UserAIModelSettings

# Re-export models for convenience
__all__ = [
    'Base', 
    'User',
    'Task',
    'Subscription',
    'Invoice',
    'DBAIModel',
    'UserAIModelSettings'
]

# Dependency to get DB session
<<<<<<< HEAD
@asynccontextmanager
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Get database session with proper transaction management.
    
    Yields:
        AsyncSession: Database session
        
    Example:
        async with get_db() as db:
            result = await db.execute(select(User))
            users = result.scalars().all()
=======
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Get database session.
    
    Yields:
        AsyncSession: Database session
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
    """
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception as e:
            await session.rollback()
<<<<<<< HEAD
            raise e
=======
            raise
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
        finally:
            await session.close()

# For use in FastAPI dependencies
SessionLocal = async_session_factory

<<<<<<< HEAD
# Helper function to get a database session (alias for get_db for backward compatibility)
get_db_session = get_db
=======
# Helper function to get a database session
@asynccontextmanager
async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Get a database session with automatic cleanup.
    
    Yields:
        AsyncSession: Database session
    """
    async with SessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e

async def init_db() -> None:
    """Initialize database tables."""
    async with engine.begin() as conn:
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
    
    # Create default admin user if not exists
    async with async_session_factory() as session:
        from .user import User
        from ..core.security import get_password_hash
        
        admin = await session.get(User, 1)  # Check if admin exists
        if not admin and settings.FIRST_SUPERUSER_EMAIL and settings.FIRST_SUPERUSER_PASSWORD:
            admin_user = User(
                email=settings.FIRST_SUPERUSER_EMAIL,
                hashed_password=get_password_hash(settings.FIRST_SUPERUSER_PASSWORD),
                is_superuser=True,
                is_active=True,
                full_name="Admin User"
            )
            session.add(admin_user)
            await session.commit()
            print("Created default admin user")

# Drop all tables (for testing)
async def drop_db():
    """Drop all database tables (use with caution)."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

class Session:
    def __init__(self, session_id: str, module_code: str, chapters: str, 
                 detail_level: str = "standard"):
        self.session_id = session_id
        self.module_code = module_code
        self.chapters = chapters
        self.detail_level = detail_level
        self.lecture_content = ""
        self.textbook_content = ""
        self.fused_notes = {}
        self.created_at = datetime.now()
        self.updated_at = datetime.now()
    
    async def save(self):
        """Save session to database"""
        db = await get_db()
        await db.execute("""
            INSERT OR REPLACE INTO sessions 
            (session_id, module_code, chapters, detail_level, lecture_content, 
             textbook_content, fused_notes, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            self.session_id, self.module_code, self.chapters, self.detail_level,
            self.lecture_content, self.textbook_content, json.dumps(self.fused_notes),
            self.created_at, self.updated_at
        ))
        await db.commit()
        await db.close()
    
    @classmethod
    async def get_by_id(cls, session_id: str):
        """Get session by ID"""
        db = await get_db()
        cursor = await db.execute("""
            SELECT * FROM sessions WHERE session_id = ?
        """, (session_id,))
        row = await cursor.fetchone()
        
        if row:
            session = cls(row[0], row[1], row[2], row[3])
            session.lecture_content = row[4] or ""
            session.textbook_content = row[5] or ""
            session.fused_notes = json.loads(row[6]) if row[6] else {}
            session.created_at = datetime.fromisoformat(row[7])
            session.updated_at = datetime.fromisoformat(row[8])
            await db.close()
            return session
        await db.close()
        return None

class Transcript:
    def __init__(self, transcript_id: str, session_id: str, file_path: str):
        self.transcript_id = transcript_id
        self.session_id = session_id
        self.file_path = file_path
        self.transcript_text = ""
        self.timestamps = []
        self.speaker_labels = []
        self.created_at = datetime.now()
    
    async def save(self):
        """Save transcript to database"""
        db = await get_db()
        await db.execute("""
            INSERT OR REPLACE INTO transcripts 
            (transcript_id, session_id, file_path, transcript_text, timestamps, 
             speaker_labels, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            self.transcript_id, self.session_id, self.file_path,
            self.transcript_text, json.dumps(self.timestamps),
            json.dumps(self.speaker_labels), self.created_at
        ))
        await db.commit()
        await db.close()

class Diagram:
    def __init__(self, diagram_id: str, session_id: str, diagram_data: str, diagram_type: str):
        self.diagram_id = diagram_id
        self.session_id = session_id
        self.diagram_data = diagram_data
        self.diagram_type = diagram_type
        self.created_at = datetime.now()
    
    async def save(self):
        """Save diagram to database"""
        db = await get_db()
        await db.execute("""
            INSERT OR REPLACE INTO diagrams 
            (diagram_id, session_id, diagram_data, diagram_type, created_at)
            VALUES (?, ?, ?, ?, ?)
        """, (
            self.diagram_id, self.session_id, self.diagram_data,
            self.diagram_type, self.created_at
        ))
        await db.commit()
        await db.close()

class NotesVersion:
    def __init__(self, version_id: str, session_id: str, notes_content: str, version_number: int):
        self.version_id = version_id
        self.session_id = session_id
        self.notes_content = notes_content
        self.version_number = version_number
        self.created_at = datetime.now()
    
    async def save(self):
        """Save notes version to database"""
        db = await get_db()
        await db.execute("""
            INSERT OR REPLACE INTO notes_versions 
            (version_id, session_id, notes_content, version_number, created_at)
            VALUES (?, ?, ?, ?, ?)
        """, (
            self.version_id, self.session_id, self.notes_content,
            self.version_number, self.created_at
        ))
        await db.commit()
        await db.close()

class PracticeQuestion:
    def __init__(self, question_id: str, session_id: str, section_name: str, 
                 question_text: str, answer_text: str, question_type: str = "multiple_choice"):
        self.question_id = question_id
        self.session_id = session_id
        self.section_name = section_name
        self.question_text = question_text
        self.answer_text = answer_text
        self.question_type = question_type
        self.created_at = datetime.now()
    
    async def save(self):
        """Save practice question to database"""
        db = await get_db()
        await db.execute("""
            INSERT OR REPLACE INTO practice_questions 
            (question_id, session_id, section_name, question_text, answer_text, 
             question_type, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            self.question_id, self.session_id, self.section_name,
            self.question_text, self.answer_text, self.question_type, self.created_at
        ))
        await db.commit()
        await db.close()