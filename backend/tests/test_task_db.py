"""
Test database configuration for task management API tests.
"""
import pytest
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base
from app.models.user import User
from app.models.user_task import UserTask
from app.core.security import get_password_hash

# Test database URL (in-memory SQLite for testing)
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

# Create test database engine
engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

# Create test session factory
TestingSessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Test user data
TEST_USER_EMAIL = "test@example.com"
TEST_USER_PASSWORD = "testpassword"

@pytest.fixture(scope="session")
async def db_engine():
    """Create a test database engine and initialize the database schema."""
    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield engine
    
    # Clean up
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    
    await engine.dispose()

@pytest.fixture
def event_loop():
    """Create an instance of the default event loop for each test case."""
    import asyncio
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture
async def db_session(db_engine):
    """Create a new database session for testing."""
    connection = await db_engine.connect()
    transaction = await connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    # Create a test user
    async with session.begin():
        # Check if user already exists
        user = await session.get(User, 1)
        if not user:
            user = User(
                email=TEST_USER_EMAIL,
                hashed_password=get_password_hash(TEST_USER_PASSWORD),
                is_active=True,
            )
            session.add(user)
            await session.commit()
    
    try:
        yield session
    finally:
        await session.close()
        await transaction.rollback()
        await connection.close()

@pytest.fixture
async def test_user(db_session):
    """Get the test user."""
    user = await db_session.get(User, 1)
    if not user:
        user = User(
            email=TEST_USER_EMAIL,
            hashed_password=get_password_hash(TEST_USER_PASSWORD),
            is_active=True,
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)
    return user

@pytest.fixture
async def test_task(db_session, test_user):
    """Create a test task."""
    from datetime import datetime, timedelta
    
    task = UserTask(
        title="Test Task",
        description="This is a test task",
        status="pending",
        priority="medium",
        due_date=datetime.utcnow() + timedelta(days=7),
        reminder_enabled=True,
        reminder_time=datetime.utcnow() + timedelta(days=6, hours=12),
        category="work",
        tags=["test", "important"],
        user_id=test_user.id
    )
    
    db_session.add(task)
    await db_session.commit()
    await db_session.refresh(task)
    
    return task
