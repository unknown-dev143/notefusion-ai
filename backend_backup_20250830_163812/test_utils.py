"""
Utility functions for testing the task management API.
"""
import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from datetime import datetime, timedelta
import uuid

from app.main import app
from app.core.database import Base, get_db
from app.models.user import User
from app.core.security import get_password_hash, create_access_token

# Test database URL (in-memory SQLite for testing)
TEST_DATABASE_URL = "sqlite:///:memory:"

# Create test database engine
engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

# Create test session factory
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create test client with dependency override
def get_test_db():
    """Get a test database session."""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

# Override the get_db dependency
app.dependency_overrides[get_db] = get_test_db

# Test client
client = TestClient(app)

# Test user data
TEST_USER_EMAIL = "test@example.com"
TEST_USER_PASSWORD = "testpassword"

def create_test_user(db):
    """Create a test user and return the user object and auth token."""
    # Check if user already exists
    user = db.query(User).filter(User.email == TEST_USER_EMAIL).first()
    if user:
        return user, create_auth_token(user.id)
    
    # Create new user
    user = User(
        email=TEST_USER_EMAIL,
        hashed_password=get_password_hash(TEST_USER_PASSWORD),
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return user, create_auth_token(user.id)

def create_auth_token(user_id: int):
    """Create an access token for the test user."""
    return f"Bearer {create_access_token(data={'sub': str(user_id)})}"

# Fixture to set up the test database
@pytest.fixture(scope="module")
def test_db():
    ""
    Create a fresh database for testing and drop it when tests are done.
    """
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    # Create a test database session
    db = TestingSessionLocal()
    
    # Create test user
    _, auth_token = create_test_user(db)
    
    # Set up test data
    try:
        yield db, auth_token
    finally:
        # Clean up
        db.close()
        # Drop all tables
        Base.metadata.drop_all(bind=engine)
