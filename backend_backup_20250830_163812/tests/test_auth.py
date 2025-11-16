"""Tests for authentication endpoints."""
import pytest
from fastapi import status
from httpx import AsyncClient

from app.core.config import settings
from app.models import User
from tests.utils import (
    random_email,
    random_string,
    get_user_authentication_headers_async,
)

pytestmark = pytest.mark.asyncio

class TestAuth:
    """Test authentication endpoints."""
    
    async def test_login_successful(
        self, 
        client: AsyncClient, 
        test_user: dict,
        db_session
    ):
        """Test successful user login."""
        # Create test user
        from app.core.security import get_password_hash
        user = User(
            email=test_user["email"],
            hashed_password=get_password_hash(test_user["password"]),
            is_active=True
        )
        db_session.add(user)
        await db_session.commit()
        
        # Test login
        login_data = {
            "username": test_user["email"],
            "password": test_user["password"]
        }
        response = await client.post(
            f"{settings.API_V1_STR}/auth/login",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
    
    async def test_login_incorrect_password(self, client: AsyncClient, test_user: dict):
        """Test login with incorrect password."""
        login_data = {
            "username": test_user["email"],
            "password": "wrongpassword"
        }
        response = await client.post(
            f"{settings.API_V1_STR}/auth/login",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Incorrect email or password" in response.json()["detail"]
    
    async def test_register_successful(self, client: AsyncClient, db_session):
        """Test successful user registration."""
        user_data = {
            "email": random_email(),
            "password": "TestPass123!",
            "full_name": "Test User"
        }
        
        response = await client.post(
            f"{settings.API_V1_STR}/auth/register",
            json=user_data
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert "id" in data
        assert data["email"] == user_data["email"]
        assert "hashed_password" not in data
        
        # Verify user was created in the database
        user = await db_session.get(User, data["id"])
        assert user is not None
        assert user.email == user_data["email"]
        assert user.is_active is True
    
    async def test_register_duplicate_email(
        self, 
        client: AsyncClient, 
        test_user: dict
    ):
        """Test registration with duplicate email."""
        user_data = {
            "email": test_user["email"],
            "password": "TestPass123!",
            "full_name": "Test User"
        }
        
        response = await client.post(
            f"{settings.API_V1_STR}/auth/register",
            json=user_data
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Email already registered" in response.json()["detail"]
    
    async def test_read_users_me(
        self, 
        client: AsyncClient, 
        test_user: dict,
        db_session
    ):
        """Test retrieving current user with valid token."""
        # Create test user and get auth token
        from app.core.security import get_password_hash
        user = User(
            email=test_user["email"],
            hashed_password=get_password_hash(test_user["password"]),
            is_active=True
        )
        db_session.add(user)
        await db_session.commit()
        
        headers = await get_user_authentication_headers_async(
            client, 
            email=test_user["email"],
            password=test_user["password"]
        )
        
        response = await client.get(
            f"{settings.API_V1_STR}/users/me",
            headers=headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["email"] == test_user["email"]
        assert "hashed_password" not in data
    
    async def test_read_users_me_unauthorized(self, client: AsyncClient):
        """Test retrieving current user without authentication."""
        response = await client.get(f"{settings.API_V1_STR}/users/me")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    async def test_refresh_token(
        self,
        client: AsyncClient,
        test_user: dict,
        db_session
    ):
        """Test refreshing an access token."""
        # Create test user and get initial tokens
        from app.core.security import get_password_hash
        user = User(
            email=test_user["email"],
            hashed_password=get_password_hash(test_user["password"]),
            is_active=True
        )
        db_session.add(user)
        await db_session.commit()
        
        # Get refresh token
        login_data = {
            "username": test_user["email"],
            "password": test_user["password"]
        }
        login_response = await client.post(
            f"{settings.API_V1_STR}/auth/login",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        refresh_token = login_response.json()["refresh_token"]
        
        # Test refresh token
        refresh_response = await client.post(
            f"{settings.API_V1_STR}/auth/refresh-token",
            json={"refresh_token": refresh_token}
        )
        
        assert refresh_response.status_code == status.HTTP_200_OK
        data = refresh_response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
        assert data["access_token"] != login_response.json()["access_token"]
    
    @pytest.mark.parametrize("email,password,expected_status,detail", [
        ("not-an-email", "testpass", 422, "value is not a valid email address"),
        (None, "testpass", 422, "field required"),
        ("test@example.com", None, 422, "field required"),
        ("test@example.com", "short", 422, "ensure this value has at least 8 characters"),
    ])
    async def test_register_invalid_input(
        self, 
        client: AsyncClient, 
        email: str, 
        password: str, 
        expected_status: int, 
        detail: str
    ):
        """Test user registration with invalid input."""
        user_data = {
            "email": email,
            "password": password,
            "full_name": "Test User"
        }
        
        # Remove None values to test missing fields
        user_data = {k: v for k, v in user_data.items() if v is not None}
        
        response = await client.post(
            f"{settings.API_V1_STR}/auth/register",
            json=user_data
        )
        
        assert response.status_code == expected_status
        if detail:
            response_json = response.json()
            if "detail" in response_json:
                if isinstance(response_json["detail"], str):
                    assert detail in response_json["detail"]
                else:  # Handle list of errors from Pydantic
                    assert any(detail in error["msg"] for error in response_json["detail"])

class TestPasswordReset:
    """Test password reset functionality."""
    
    async def test_request_password_reset(
        self, 
        client: AsyncClient, 
        test_user: dict,
        db_session,
        mocker
    ):
        """Test requesting a password reset."""
        # Mock the email sending
        mock_send_email = mocker.patch("app.utils.email.send_reset_password_email")
        
        # Create test user
        from app.core.security import get_password_hash
        user = User(
            email=test_user["email"],
            hashed_password=get_password_hash(test_user["password"]),
            is_active=True
        )
        db_session.add(user)
        await db_session.commit()
        
        # Request password reset
        response = await client.post(
            f"{settings.API_V1_STR}/auth/forgot-password",
            json={"email": test_user["email"]}
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert response.json() == {"message": "Password recovery email sent"}
        
        # Verify email was sent
        mock_send_email.assert_called_once()
        assert mock_send_email.call_args[0][0] == test_user["email"]
        token = mock_send_email.call_args[0][1]
        assert token is not None
    
    async def test_reset_password(
        self, 
        client: AsyncClient, 
        test_user: dict,
        db_session
    ):
        """Test resetting a password with a valid token."""
        # Create test user and generate reset token
        from app.core.security import get_password_hash, create_access_token
        from datetime import timedelta
        
        user = User(
            email=test_user["email"],
            hashed_password=get_password_hash(test_user["password"]),
            is_active=True
        )
        db_session.add(user)
        await db_session.commit()
        
        # Generate reset token
        token_data = {"sub": str(user.id), "type": "reset_password"}
        token = create_access_token(
            data=token_data,
            expires_delta=timedelta(minutes=settings.EMAIL_RESET_TOKEN_EXPIRE_MINUTES)
        )
        
        # Reset password
        new_password = "NewSecurePass123!"
        response = await client.post(
            f"{settings.API_V1_STR}/auth/reset-password",
            json={
                "token": token,
                "new_password": new_password
            }
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert response.json() == {"message": "Password updated successfully"}
        
        # Verify password was updated
        await db_session.refresh(user)
        from app.core.security import verify_password
        assert verify_password(new_password, user.hashed_password) is True
    
    async def test_reset_password_invalid_token(self, client: AsyncClient):
        """Test resetting a password with an invalid token."""
        response = await client.post(
            f"{settings.API_V1_STR}/auth/reset-password",
            json={
                "token": "invalid-token",
                "new_password": "NewSecurePass123!"
            }
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Invalid token" in response.json()["detail"]
