from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base, sessionmaker, scoped_session
from sqlalchemy.pool import NullPool
from typing import AsyncGenerator, Optional, Type, TypeVar
import os
import uuid
from datetime import datetime
from contextlib import asynccontextmanager

from ..config import settings

# Create database engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    future=True,
    pool_pre_ping=True,
    pool_recycle=3600,
)

# Create session factory
async_session_factory = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

from sqlalchemy import MetaData
from sqlalchemy.ext.declarative import declarative_base

# Define naming convention for constraints
convention = {
    "ix": 'ix_%(column_0_label)s',
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s"
}

# Create metadata with naming convention
metadata = MetaData(naming_convention=convention)

# Create declarative base with the configured metadata
Base = declarative_base(metadata=metadata)

# Import all models to ensure they are registered with SQLAlchemy
# This must be after Base is defined but before any model is used
from .task import Task  # noqa: F401

# Re-export models for convenience
__all__ = ['Base', 'Task']

# Dependency to get DB session
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Get database session.
    
    Yields:
        AsyncSession: Database session
    """
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception as e:
            await session.rollback()
            raise
        finally:
            await session.close()

# For use in FastAPI dependencies
SessionLocal = async_session_factory

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

# Initialize database
async def init_db():
    """Initialize database tables."""
    from .task import Task  # Import here to avoid circular imports
    
    async with engine.begin() as conn:
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
        await conn.run_sync(Base.metadata.create_all)

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