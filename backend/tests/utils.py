"""Test utilities and helpers."""
import asyncio
import json
import random
import string
from datetime import datetime, timedelta
from functools import wraps
from pathlib import Path
from typing import Any, AsyncGenerator, Callable, Dict, List, Optional, Type, TypeVar, Union

import aiofiles
import aiohttp
import pytest
from faker import Faker
from fastapi import status
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import get_password_hash
from app.models import User, BaseModel

# Type variables
T = TypeVar('T', bound=BaseModel)
F = TypeVar('F', bound=Callable)

# Initialize Faker
fake = Faker()

# Test data generators
def random_email() -> str:
    """Generate a random email address for testing."""
    return f"test_{random_string(8)}@example.com"

def random_string(length: int = 10) -> str:
    """Generate a random string of fixed length."""
    letters = string.ascii_letters + string.digits
    return ''.join(random.choice(letters) for _ in range(length))

def random_lower_string(length: int = 10) -> str:
    """Generate a random lowercase string of fixed length."""
    return ''.join(random.choice(string.ascii_lowercase) for _ in range(length))

def random_url() -> str:
    """Generate a random URL."""
    return f"https://example.com/{random_string()}"

def random_datetime(start: datetime = None, end: datetime = None) -> datetime:
    """Generate a random datetime between start and end (default: last 30 days)."""
    if start is None:
        start = datetime.utcnow() - timedelta(days=30)
    if end is None:
        end = datetime.utcnow()
    
    delta = end - start
    int_delta = (delta.days * 24 * 60 * 60) + delta.seconds
    random_second = random.randrange(int_delta)
    return start + timedelta(seconds=random_second)

# Fixture utilities
async def create_test_user(
    db: AsyncSession,
    email: str = None,
    password: str = None,
    is_active: bool = True,
    is_superuser: bool = False,
    **kwargs
) -> User:
    """Create a test user in the database."""
    if email is None:
        email = random_email()
    if password is None:
        password = random_string()
    
    user = User(
        email=email,
        hashed_password=get_password_hash(password),
        is_active=is_active,
        is_superuser=is_superuser,
        **kwargs
    )
    
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

# Authentication helpers
def get_user_authentication_headers(
    client: TestClient, email: str, password: str
) -> Dict[str, str]:
    """Get authentication headers for a test user."""
    data = {"username": email, "password": password}
    r = client.post(f"{settings.API_V1_STR}/auth/login", data=data)
    response = r.json()
    auth_token = response["access_token"]
    headers = {"Authorization": f"Bearer {auth_token}"}
    return headers

async def get_user_authentication_headers_async(
    client: AsyncClient, email: str, password: str
) -> Dict[str, str]:
    """Get authentication headers for a test user (async)."""
    data = {"username": email, "password": password}
    response = await client.post(
        f"{settings.API_V1_STR}/auth/login",
        data=data,
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    response_data = response.json()
    auth_token = response_data["access_token"]
    return {"Authorization": f"Bearer {auth_token}"}

# File handling
async def create_test_file(
    directory: Path, 
    filename: str = None, 
    content: str = None,
    size_kb: int = 1
) -> Path:
    """Create a test file with random content."""
    if filename is None:
        filename = f"test_{random_string(8)}.txt"
    
    file_path = directory / filename
    
    if content is None:
        # Generate random content of specified size
        content = random_string(size_kb * 1024)
    
    async with aiofiles.open(file_path, 'w') as f:
        await f.write(content)
    
    return file_path

# Assertion helpers
def assert_dict_contains(subset: dict, superset: dict) -> None:
    """Assert that all key-value pairs in subset exist in superset."""
    for key, value in subset.items():
        assert key in superset, f"Key '{key}' not found in dictionary"
        assert superset[key] == value, f"Value for key '{key}' does not match"

# Async test utilities
def async_test(func: F) -> F:
    """
    Decorator to run async tests with pytest.
    
    Example:
        @async_test
        async def test_something():
            result = await some_async_function()
            assert result == expected
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        return asyncio.run(func(*args, **kwargs))
    return wrapper

# Database utilities
async def create_model(
    db: AsyncSession, 
    model_class: Type[T], 
    **kwargs
) -> T:
    """Create a model instance and add it to the database."""
    instance = model_class(**kwargs)
    db.add(instance)
    await db.commit()
    await db.refresh(instance)
    return instance

# HTTP client utilities
class TestClientWithAuth(TestClient):
    """Test client with authentication support."""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._auth_token = None
    
    def set_auth_token(self, token: str) -> None:
        """Set the authentication token."""
        self._auth_token = token
    
    def request(self, method: str, url: str, **kwargs):
        """Override request to include auth token if set."""
        headers = kwargs.get('headers', {})
        if self._auth_token and 'Authorization' not in headers:
            headers['Authorization'] = f'Bearer {self._auth_token}'
            kwargs['headers'] = headers
        return super().request(method, url, **kwargs)

# Pytest marks
pytestmark = pytest.mark.asyncio

# Test data factories
class ModelFactory:
    """Base factory for creating test model instances."""
    
    @classmethod
    def build(cls, **kwargs) -> dict:
        """Build a dictionary of model attributes."""
        return {**cls.DEFAULT_ATTRIBUTES, **kwargs}
    
    @classmethod
    async def create(cls, db: AsyncSession, **kwargs) -> Any:
        """Create and persist a model instance."""
        return await create_model(db, cls.MODEL, **cls.build(**kwargs))


class UserFactory(ModelFactory):
    """Factory for creating User instances."""
    
    MODEL = User
    
    DEFAULT_ATTRIBUTES = {
        'email': random_email(),
        'hashed_password': get_password_hash("testpass123"),
        'is_active': True,
        'is_superuser': False,
    }
