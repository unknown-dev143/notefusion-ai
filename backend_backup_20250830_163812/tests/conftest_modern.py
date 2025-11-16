"""Modern test configuration with async support and fixtures."""
import asyncio
import os
import tempfile
from pathlib import Path
from typing import AsyncGenerator, Generator, Optional, Callable

import pytest
import pytest_asyncio
from asgi_lifespan import LifespanManager
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import (
    AsyncSession, 
    create_async_engine,
    async_sessionmaker
)
from sqlalchemy.pool import NullPool

from app.core.config import settings
from app.core.database import Base, get_db
from app.main import create_app

# Override test database URL
TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    "sqlite+aiosqlite:///./test.db"
)

# Create async engine for tests
async_engine = create_async_engine(
    TEST_DATABASE_URL,
    echo=settings.DEBUG,
    poolclass=NullPool,  # Use NullPool for testing
    future=True
)

# Create async session factory
TestingAsyncSessionLocal = async_sessionmaker(
    async_engine, 
    expire_on_commit=False,
    class_=AsyncSession
)

# Create test app with overridden dependencies
@pytest_asyncio.fixture
async def app() -> AsyncGenerator[FastAPI, None]:
    """Create a test FastAPI application."""
    # Create test database
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Create test app with overridden dependencies
    app = create_app()
    
    # Override database dependency
    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        async with TestingAsyncSessionLocal() as session:
            try:
                yield session
            finally:
                await session.close()
    
    app.dependency_overrides[get_db] = override_get_db
    
    # Run lifespan events
    async with LifespanManager(app):
        yield app
    
    # Cleanup
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

# Create test client
@pytest_asyncio.fixture
async def client(app: FastAPI) -> AsyncGenerator[AsyncClient, None]:
    """Create a test client for the FastAPI application."""
    async with AsyncClient(
        app=app, 
        base_url="http://testserver",
        headers={"Content-Type": "application/json"}
    ) as client:
        yield client

# Database session fixture
@pytest_asyncio.fixture
def db_session(app: FastAPI) -> AsyncGenerator[AsyncSession, None]:
    """Create a database session for testing."""
    return TestingAsyncSessionLocal()

# Authentication fixtures
@pytest_asyncio.fixture
async def test_user() -> dict:
    """Create a test user."""
    return {
        "username": "testuser",
        "email": "test@example.com",
        "password": "TestPass123!"
    }

@pytest_asyncio.fixture
async def auth_headers(
    client: AsyncClient, 
    test_user: dict
) -> dict[str, str]:
    """Get authentication headers for test user."""
    # Register user
    await client.post(
        "/api/v1/auth/register",
        json={
            "username": test_user["username"],
            "email": test_user["email"],
            "password": test_user["password"]
        }
    )
    
    # Login
    login_response = await client.post(
        "/api/v1/auth/login",
        data={
            "username": test_user["email"],
            "password": test_user["password"]
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    
    token = login_response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

# Temporary directory for file upload tests
@pytest.fixture
def temp_dir() -> Generator[Path, None, None]:
    """Create a temporary directory for file upload tests."""
    with tempfile.TemporaryDirectory() as temp_dir:
        yield Path(temp_dir)

# Event loop fixture for async tests
@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

# Factory boy integration
from factory.alchemy import SESSION_PERSISTENCE_COMMIT, SESSION_PERSISTENCE_FLUSH
from factory import Faker as FactoryFaker
from factory.alchemy import SQLAlchemyModelFactory
from app.models.user import User as UserModel

class BaseFactory(SQLAlchemyModelFactory):
    """Base factory for all model factories."""
    
    class Meta:
        abstract = True
        sqlalchemy_session = TestingAsyncSessionLocal()
        sqlalchemy_session_persistence = SESSION_PERSISTENCE_FLUSH

class UserFactory(BaseFactory):
    """User model factory."""
    
    class Meta:
        model = UserModel
    
    email = FactoryFaker("email")
    username = FactoryFaker("user_name")
    hashed_password = "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW"  # "testpass"
    is_active = True
    is_superuser = False

# Add markers
def pytest_configure(config):
    """Configure pytest with custom markers."""
    config.addinivalue_line(
        "markers",
        "integration: mark test as integration test (slower, requires external services)",
    )
    config.addinivalue_line(
        "markers",
        "performance: mark test as performance test (run separately)",
    )

# Custom command line options
def pytest_addoption(parser):
    """Add custom command line options."""
    parser.addoption(
        "--run-slow",
        action="store_true",
        default=False,
        help="Run slow tests"
    )

# Skip slow tests by default
def pytest_collection_modifyitems(config, items):
    """Skip slow tests by default."""
    if not config.getoption("--run-slow"):
        skip_slow = pytest.mark.skip(reason="Need --run-slow option to run")
        for item in items:
            if "slow" in item.keywords:
                item.add_marker(skip_slow)
