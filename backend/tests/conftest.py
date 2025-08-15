"""Test configuration and fixtures."""
import pytest
from datetime import datetime, timedelta
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.engine import Engine

from tests.models import Base, User, Subscription, Invoice, SubscriptionTier, SubscriptionStatus

@pytest.fixture(scope="session")
def db_engine() -> Engine:
    """Create a database engine for testing."""
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

@pytest.fixture
def db_session(db_engine: Engine) -> Session:
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
