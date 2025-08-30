"""
Test configuration for the flashcard tests.
"""
import os
from typing import AsyncGenerator, Generator

import pytest
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, AsyncEngine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.main import app
from app.db.base_class import Base
from app.api.deps import get_db

# Use an in-memory SQLite database for testing
TEST_SQLALCHEMY_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

# Create async engine
engine = create_async_engine(
    TEST_SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# Create session factory
TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    class_=AsyncSession
)

@pytest.fixture(autouse=True)
async def setup_db():
    """Set up test database."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.fixture
def override_get_db():
    """Override the get_db dependency for testing."""
    async def _override_get_db() -> AsyncGenerator[AsyncSession, None]:
        async with TestingSessionLocal() as session:
            yield session
    return _override_get_db

@pytest.fixture
def client(override_get_db):
    """Create a test client that uses the override_get_db fixture."""
    # Override the get_db dependency for testing
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    # Clean up after test
    app.dependency_overrides = {}

@pytest.fixture
async def db(override_get_db) -> AsyncGenerator[AsyncSession, None]:
    """Get a test database session."""
    async for session in override_get_db():
        yield session
