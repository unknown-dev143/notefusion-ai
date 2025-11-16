"""
Test client configuration for task management API tests.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import status

from app.main import app
from app.core.security import create_access_token
from app.models.user import User

@pytest.fixture
def client():
    """Create a test client for the FastAPI application."""
    with TestClient(app) as test_client:
        yield test_client

@pytest.fixture
def auth_headers(test_user):
    """Get authentication headers with a valid JWT token."""
    access_token = create_access_token(data={"sub": str(test_user.id)})
    return {"Authorization": f"Bearer {access_token}"}

@pytest.fixture
def unauthorized_headers():
    """Get invalid authentication headers."""
    return {"Authorization": "Bearer invalid_token"}
