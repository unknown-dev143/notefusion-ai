"""
Pytest configuration and fixtures for testing the NoteFusion AI backend.
"""
import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Set test environment variables before importing app
os.environ["ENV"] = "test"
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["SECRET_KEY"] = "test-secret-key"
os.environ["JWT_SECRET_KEY"] = "test-jwt-secret-key"

from app.main import app
from app.core.database import Base, get_db
from app.models.user import User
from app.core.security import get_password_hash, create_access_token

# Create test database engine
engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

# Create test session factory
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Test user data
TEST_USER_EMAIL = "test@example.com"
TEST_USER_PASSWORD = "testpassword"

@pytest.fixture(scope="session")
def db_engine():
    ""
    Create a test database engine and initialize the database schema.
    This runs once per test session.
    """
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    # Create a test user
    db = TestingSessionLocal()
    try:
        # Create test user if not exists
        user = db.query(User).filter(User.email == TEST_USER_EMAIL).first()
        if not user:
            user = User(
                email=TEST_USER_EMAIL,
                hashed_password=get_password_hash(TEST_USER_PASSWORD),
                is_active=True,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        yield engine
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db_session(db_engine):
    ""
    Create a new database session with a savepoint, and roll back changes after each test.
    """
    connection = db_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    # Begin a nested transaction
    nested = connection.begin_nested()
    
    # If the application code calls session.commit, it will end the nested
    # transaction. We need to start a new one when that happens.
    @event.listens_for(session, 'after_transaction_end')
    def end_savepoint(session, transaction):
        nonlocal nested
        if not nested.is_active:
            nested = connection.begin_nested()
    
    yield session
    
    # Clean up
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture
def client(db_session):
    ""
    Create a test client that uses the test database session.
    """
    # Override the get_db dependency to use our test session
    def override_get_db():
        try:
            yield db_session
        finally:
            pass  # Don't close the session here, it's managed by the db_session fixture
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    # Clean up overrides
    app.dependency_overrides.clear()

@pytest.fixture
def auth_headers(client, db_session):
    ""
    Get authentication headers for test requests.
    """
    # Get or create test user
    user = db_session.query(User).filter(User.email == TEST_USER_EMAIL).first()
    if not user:
        user = User(
            email=TEST_USER_EMAIL,
            hashed_password=get_password_hash(TEST_USER_PASSWORD),
            is_active=True,
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
    
    # Create access token
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"Authorization": f"Bearer {access_token}"}

# Import event here to avoid circular import
from sqlalchemy import event
