"""Security utilities for the application."""
import os
import secrets
from datetime import datetime, timedelta
from typing import Any, Optional, Union, Dict

from fastapi import HTTPException, status, Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import ValidationError

from app.config.settings import get_settings_instance
from app.schemas.user import TokenPayload

settings = get_settings_instance()

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

class JWTBearer(HTTPBearer):
    """JWT Bearer token authentication."""

    def __init__(self, auto_error: bool = True):
        super(JWTBearer, self).__init__(auto_error=auto_error)

    async def __call__(self, request: Request) -> Optional[str]:
        credentials: HTTPAuthorizationCredentials = await super(JWTBearer, self).__call__(request)
        if credentials:
            if not credentials.scheme.lower() == "bearer":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Invalid authentication scheme.",
                )
            if not self.verify_jwt(credentials.credentials):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Invalid token or expired token.",
                )
            return credentials.credentials
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid authorization code.",
            )

    @staticmethod
    def verify_jwt(jwtoken: str) -> bool:
        """Verify JWT token."""
        isTokenValid: bool = False
        try:
            payload = jwt.decode(jwtoken, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        except (JWTError, ValidationError):
            isTokenValid = False
        else:
            isTokenValid = True
        return isTokenValid

def create_access_token(
    subject: Union[str, Any], expires_delta: timedelta = None
) -> str:
    """Create a JWT token with the given subject and expiration.
    
    Args:
        subject: The subject of the token (usually user ID or email)
        expires_delta: Optional timedelta for token expiration
        token_type: Type of token (access, refresh, etc.)
    
    Returns:
        str: Encoded JWT token
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    to_encode = {
        "exp": expire, 
        "sub": str(subject),
        "type": "access",
        "jti": secrets.token_urlsafe(32),  # Unique token identifier
        "iat": datetime.utcnow(),  # Issued at
        "iss": settings.PROJECT_NAME  # Issuer
    }
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt

def create_refresh_token(
    subject: Union[str, Any], expires_delta: timedelta = None
) -> str:
    """Create a refresh token with extended expiration."""
    if expires_delta is None:
        expires_delta = timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
    
    return create_access_token(
        subject=subject,
        expires_delta=expires_delta,
        token_type="refresh"
    )

def verify_token(token: str) -> Dict[str, Any]:
    """Verify a JWT token and return its payload.
    
    Args:
        token: The JWT token to verify
        
    Returns:
        Dict containing the token payload
        
    Raises:
        HTTPException: If token is invalid
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except (JWTError, ValidationError) as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash."""
    # Truncate password to 72 characters max for bcrypt
    if len(plain_password) > 72:
        plain_password = plain_password[:72]
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Generate a password hash."""
    # Truncate password to 72 characters max for bcrypt
    if len(password) > 72:
        password = password[:72]
    return pwd_context.hash(password)

def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    """Authenticate a user by email and password.
    
    Args:
        email: User's email
        password: User's password
        
    Returns:
        Optional[Dict[str, Any]]: User data if authentication successful, None otherwise
    """
    # This function should be used with a database session
    # It's kept here for backward compatibility but should be moved to auth service
    from app.models.user_clean import User
    from sqlalchemy.orm import Session
    
    # This is a placeholder - actual implementation should use database session
    # The actual authentication is handled in the auth endpoints
    return None

def get_current_user(token: str = Depends(JWTBearer())) -> TokenPayload:
    """Get the current user from the JWT token."""
    try:
        payload = verify_token(token)
        token_data = TokenPayload(**payload)
    except (JWTError, ValidationError) as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e
    
    return token_data

def get_current_active_user(
    current_user: TokenPayload = Depends(get_current_user)
) -> TokenPayload:
    """Get the current active user."""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user

def generate_verification_token(email: str) -> str:
    """Generate an email verification token.
    
    Args:
        email: The email to generate a verification token for
        
    Returns:
        str: JWT token for email verification
    """
    expires_delta = timedelta(minutes=settings.JWT_VERIFY_TOKEN_EXPIRE_MINUTES)
    expire = datetime.utcnow() + expires_delta
    
    to_encode = {"exp": expire, "sub": email, "type": "verification"}
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt

def verify_verification_token(token: str) -> Optional[str]:
    """Verify an email verification token.
    
    Args:
        token: The JWT token to verify
        
    Returns:
        Optional[str]: The email from the token if valid, None otherwise
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        return payload.get("sub")
    except (jwt.JWTError, ValidationError):
        return None

def generate_password_reset_token(email: str) -> str:
    """Generate a password reset token.
    
    Args:
        email: The email to generate a password reset token for
        
    Returns:
        str: JWT token for password reset
    """
    expires_delta = timedelta(minutes=settings.JWT_RESET_TOKEN_EXPIRE_MINUTES)
    expire = datetime.utcnow() + expires_delta
    
    to_encode = {"exp": expire, "sub": email, "type": "password_reset"}
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt

def verify_password_reset_token(token: str) -> Optional[str]:
    """Verify a password reset token.
    
    Args:
        token: The JWT token to verify
        
    Returns:
        Optional[str]: The email from the token if valid, None otherwise
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        return payload.get("sub")
    except (jwt.JWTError, ValidationError):
        return None

def get_client_ip(request: Request) -> str:
    """Get the client IP address from the request.
    
    Args:
        request: The FastAPI request object
        
    Returns:
        str: The client's IP address or 'unknown' if not available
    """
    if not request.client or not request.client.host:
        return "unknown"
    
    # Check for X-Forwarded-For header (common with proxies)
    if "x-forwarded-for" in request.headers:
        return request.headers["x-forwarded-for"].split(",")[0].strip()
    
    # Fall back to the direct client host
    return request.client.host
