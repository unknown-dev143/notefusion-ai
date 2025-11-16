"""Tests for API key functionality."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import uuid

from app.core.config import settings
from app.models.user import User as UserModel
from app.models.api_key import APIKeyInDB, APIKeyCreate, APIKeyUpdate
from app.crud.crud_api_key import crud_api_key
from app.core.security import get_password_hash

# Test data
TEST_USER_EMAIL = "test@example.com"
TEST_USER_PASSWORD = "testpassword"
TEST_API_KEY_NAME = "Test API Key"

@pytest.fixture
def test_user(db: Session) -> UserModel:
    """Create a test user."""
    from app.models.user import User
    
    # Delete existing test user if exists
    db_user = db.query(User).filter(User.email == TEST_USER_EMAIL).first()
    if db_user:
        db.delete(db_user)
        db.commit()
    
    # Create new test user
    hashed_password = get_password_hash(TEST_USER_PASSWORD)
    db_user = User(
        email=TEST_USER_EMAIL,
        hashed_password=hashed_password,
        full_name="Test User",
        is_active=True,
        is_superuser=False,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@pytest.fixture
def test_api_key(db: Session, test_user: UserModel) -> APIKeyInDB:
    """Create a test API key."""
    # Delete existing test API keys
    db.query(APIKeyInDB).filter(APIKeyInDB.user_id == test_user.id).delete()
    db.commit()
    
    # Create a new test API key
    api_key_in = APIKeyCreate(
        name=TEST_API_KEY_NAME,
        scopes=["notes:read", "notes:write"],
        rate_limit=100,
        expires_in_days=30
    )
    
    return crud_api_key.create_with_owner(
        db=db, 
        obj_in=api_key_in, 
        owner_id=test_user.id
    )

def test_create_api_key(client: TestClient, test_user: UserModel, db: Session) -> None:
    """Test creating a new API key."""
    # Login to get access token
    login_data = {
        "username": TEST_USER_EMAIL,
        "password": TEST_USER_PASSWORD,
    }
    r = client.post(
        f"{settings.API_V1_STR}/auth/login/access-token", 
        data=login_data
    )
    tokens = r.json()
    access_token = tokens["access_token"]
    
    # Create API key
    api_key_data = {
        "name": "Test API Key",
        "scopes": ["notes:read"],
        "rate_limit": 100,
        "expires_in_days": 30
    }
    
    r = client.post(
        f"{settings.API_V1_STR}/api-keys/",
        headers={"Authorization": f"Bearer {access_token}"},
        json=api_key_data
    )
    
    assert r.status_code == 201
    data = r.json()
    assert data["success"] is True
    assert "data" in data
    assert "key" in data["data"]
    assert "key_id" in data["data"]
    assert data["data"]["name"] == api_key_data["name"]
    assert data["data"]["scopes"] == api_key_data["scopes"]
    assert data["data"]["rate_limit"] == api_key_data["rate_limit"]
    assert data["data"]["is_active"] is True

def test_use_api_key(client: TestClient, test_api_key: APIKeyInDB) -> None:
    """Test using an API key to access a protected endpoint."""
    # Use the API key to access a protected endpoint
    r = client.get(
        f"{settings.API_V1_STR}/test-auth",
        headers={"Authorization": f"Bearer {test_api_key.key_id}.{test_api_key.key_secret}"}
    )
    
    assert r.status_code == 200
    data = r.json()
    assert "message" in data
    assert data["message"] == "You are authenticated!"

def test_rate_limiting(client: TestClient, test_api_key: APIKeyInDB) -> None:
    """Test that rate limiting works as expected."""
    # Make requests up to the rate limit
    for i in range(test_api_key.rate_limit):
        r = client.get(
            f"{settings.API_V1_STR}/test-auth",
            headers={"Authorization": f"Bearer {test_api_key.key_id}.{test_api_key.key_secret}"}
        )
        assert r.status_code == 200
    
    # Next request should be rate limited
    r = client.get(
        f"{settings.API_V1_STR}/test-auth",
        headers={"Authorization": f"Bearer {test_api_key.key_id}.{test_api_key.key_secret}"}
    )
    
    assert r.status_code == 429
    assert "Rate limit exceeded" in r.json()["detail"]

def test_invalid_api_key(client: TestClient) -> None:
    """Test that invalid API keys are rejected."""
    # Test with no API key
    r = client.get(f"{settings.API_V1_STR}/test-auth")
    assert r.status_code == 401
    
    # Test with invalid format
    r = client.get(
        f"{settings.API_V1_STR}/test-auth",
        headers={"Authorization": "Bearer invalid_key_format"}
    )
    assert r.status_code == 401
    
    # Test with non-existent key
    r = client.get(
        f"{settings.API_V1_STR}/test-auth",
        headers={"Authorization": "Bearer 00000000-0000-0000-0000-000000000000.invalid_secret"}
    )
    assert r.status_code == 401

def test_list_api_keys(client: TestClient, test_user: UserModel, test_api_key: APIKeyInDB) -> None:
    """Test listing API keys for a user."""
    # Login to get access token
    login_data = {
        "username": TEST_USER_EMAIL,
        "password": TEST_USER_PASSWORD,
    }
    r = client.post(
        f"{settings.API_V1_STR}/auth/login/access-token", 
        data=login_data
    )
    tokens = r.json()
    access_token = tokens["access_token"]
    
    # List API keys
    r = client.get(
        f"{settings.API_V1_STR}/api-keys/",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    
    assert r.status_code == 200
    data = r.json()
    assert data["success"] is True
    assert len(data["data"]) > 0
    assert any(key["id"] == str(test_api_key.id) for key in data["data"])

def test_delete_api_key(client: TestClient, test_user: UserModel, test_api_key: APIKeyInDB) -> None:
    """Test deleting an API key."""
    # Login to get access token
    login_data = {
        "username": TEST_USER_EMAIL,
        "password": TEST_USER_PASSWORD,
    }
    r = client.post(
        f"{settings.API_V1_STR}/auth/login/access-token", 
        data=login_data
    )
    tokens = r.json()
    access_token = tokens["access_token"]
    
    # Delete the API key
    r = client.delete(
        f"{settings.API_V1_STR}/api-keys/{test_api_key.id}",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    
    assert r.status_code == 200
    data = r.json()
    assert data["success"] is True
    
    # Verify the key is deleted
    r = client.get(
        f"{settings.API_V1_STR}/api-keys/",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    
    assert r.status_code == 200
    data = r.json()
    assert not any(key["id"] == str(test_api_key.id) for key in data["data"])

def test_api_key_scopes(client: TestClient, test_api_key: APIKeyInDB, db: Session) -> None:
    """Test that API key scopes are enforced."""
    # Create an API key with limited scopes
    limited_key = crud_api_key.create_with_owner(
        db=db,
        obj_in=APIKeyCreate(
            name="Limited Scope Key",
            scopes=["notes:read"],
            rate_limit=10
        ),
        owner_id=test_api_key.user_id
    )
    
    # Try to access an endpoint that requires a different scope
    r = client.post(
        f"{settings.API_V1_STR}/notes/",
        headers={"Authorization": f"Bearer {limited_key.key_id}.{limited_key.key_secret}"},
        json={"title": "Test Note", "content": "Test Content"}
    )
    
    # Should be forbidden due to missing scope
    assert r.status_code == 403
    assert "missing required scope" in r.json()["detail"].lower()
    
    # Clean up
    db.delete(limited_key)
    db.commit()
