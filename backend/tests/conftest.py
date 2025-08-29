"""Test configuration and fixtures."""
import pytest
from datetime import datetime, timedelta
<<<<<<< HEAD
from typing import AsyncGenerator, Generator
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.engine import Engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, AsyncEngine
from fastapi.testclient import TestClient

from app.main import app
from app.db.base_class import Base
from app.api.deps import get_db as get_db_dep

from tests.models import User, Subscription, Invoice, SubscriptionTier, SubscriptionStatus

# Async database setup
TEST_SQLALCHEMY_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

@pytest.fixture(scope="session")
async def async_db_engine() -> AsyncEngine:
    """Create an async database engine for testing."""
    engine = create_async_engine(
        TEST_SQLALCHEMY_DATABASE_URL,
        echo=False,
        future=True,
        connect_args={"check_same_thread": False}
    )
    
    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield engine
    
    # Clean up
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()

# Sync database setup for existing tests
@pytest.fixture(scope="session")
def db_engine() -> Engine:
    """Create a sync database engine for testing."""
=======
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.engine import Engine

from tests.models import Base, User, Subscription, Invoice, SubscriptionTier, SubscriptionStatus

@pytest.fixture(scope="session")
def db_engine() -> Engine:
    """Create a database engine for testing."""
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
    engine = create_engine(
        "sqlite:///:memory:",
        echo=False,
        future=True,
        connect_args={"check_same_thread": False}
    )
    
    # Enable foreign key support for SQLite
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()
    
    # Create all tables
    Base.metadata.create_all(engine)
    
    return engine

<<<<<<< HEAD
# Async session fixture
@pytest.fixture
def override_get_db(async_db_engine: AsyncEngine):
    """Override the get_db dependency for testing."""
    async def _override_get_db() -> AsyncGenerator[AsyncSession, None]:
        TestingSessionLocal = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=async_db_engine,
            class_=AsyncSession,
            future=True
        )
        async with TestingSessionLocal() as session:
            yield session
    return _override_get_db

# Test client fixture
@pytest.fixture
def client(override_get_db):
    """Create a test client that uses the override_get_db fixture."""
    # Override the get_db dependency for testing
    app.dependency_overrides[get_db_dep] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    # Clean up after test
    app.dependency_overrides = {}

# Async database session fixture
@pytest.fixture
async def db(async_db_engine: AsyncEngine) -> AsyncGenerator[AsyncSession, None]:
    """Get an async database session for testing."""
    TestingSessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=async_db_engine,
        class_=AsyncSession,
        future=True
    )
    
    async with TestingSessionLocal() as session:
        yield session

# Sync session fixture (for existing tests)
@pytest.fixture
def db_session(db_engine: Engine) -> Generator[Session, None, None]:
=======
@pytest.fixture
def db_session(db_engine: Engine) -> Session:
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
    """Create a database session for testing."""
    connection = db_engine.connect()
    transaction = connection.begin()
    
    # Create a session with the connection
    TestingSessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=connection,
        future=True
    )
    
    session = TestingSessionLocal()
    
    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()

@pytest.fixture
def test_user(db_session):
    """Create a test user."""
    user = User(
        email="test@example.com",
        hashed_password="hashed_password",
        full_name="Test User",
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def free_subscription(db_session, test_user):
    """Create a free subscription for testing."""
    subscription = Subscription(
        user_id=test_user.id,
        tier=SubscriptionTier.FREE,
        status=SubscriptionStatus.ACTIVE
    )
    db_session.add(subscription)
    db_session.commit()
    db_session.refresh(subscription)
    return subscription

@pytest.fixture
def pro_subscription(db_session, test_user):
    """Create a pro subscription for testing."""
    subscription = Subscription(
        user_id=test_user.id,
        tier=SubscriptionTier.PRO,
        status=SubscriptionStatus.ACTIVE
    )
    db_session.add(subscription)
    db_session.commit()
    db_session.refresh(subscription)
    return subscription

@pytest.fixture
def business_subscription(db_session, test_user):
    """Create a business subscription for testing."""
    subscription = Subscription(
        user_id=test_user.id,
        tier=SubscriptionTier.BUSINESS,
        status=SubscriptionStatus.ACTIVE
    )
    db_session.add(subscription)
    db_session.commit()
    db_session.refresh(subscription)
    return subscription

@pytest.fixture
def admin_subscription(db_session, test_user):
    """Create an admin subscription for testing."""
    subscription = Subscription(
        user_id=test_user.id,
        tier=SubscriptionTier.ADMIN,
        status=SubscriptionStatus.ACTIVE
    )
    db_session.add(subscription)
    db_session.commit()
    db_session.refresh(subscription)
    return subscription
