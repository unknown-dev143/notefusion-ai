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

from ..config import settings
from ..schemas.user import TokenPayload

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class JWTBearer(HTTPBearer):
    """JWT Bearer token authentication."""
    
    def __init__(self, auto_error: bool = True):
        super().__init__(auto_error=auto_error)
        self.scheme_name = "Bearer"

    async def __call__(self, request: Request) -> str:
        credentials: HTTPAuthorizationCredentials = await super().__call__(request)
        if not credentials:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid authorization code."
            )
        if not credentials.scheme == "Bearer":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid authentication scheme.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return credentials.credentials

def create_access_token(
    subject: Union[str, Any], 
    expires_delta: Optional[timedelta] = None,
    token_type: str = "access"
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
        "type": token_type,
        "jti": secrets.token_urlsafe(32),  # Unique token identifier
        "iat": datetime.utcnow(),  # Issued at
        "iss": settings.PROJECT_NAME  # Issuer
    }
    
    return jwt.encode(
        to_encode, 
        settings.JWT_SECRET_KEY.get_secret_value(),
        algorithm=settings.JWT_ALGORITHM
    )

def create_refresh_token(
    subject: Union[str, Any], 
    expires_delta: Optional[timedelta] = None
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
        HTTPException: If token is invalid or expired
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY.get_secret_value(),
            algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except jwt.ExpiredSignatureError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e
    except (JWTError, ValidationError) as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Generate a password hash."""
    return pwd_context.hash(password)

def get_current_user(token: str = Depends(JWTBearer())) -> TokenPayload:
    """Get the current user from the JWT token."""
    try:
        payload = verify_token(token)
        token_data = TokenPayload(**payload)
    except (JWTError, ValidationError) as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        ) from e
    return token_data

def generate_verification_token(email: str) -> str:
    """Generate an email verification token.
    
    Args:
        email: The email to generate a verification token for
        
    Returns:
        str: JWT token for email verification
    """
    expires_delta = timedelta(minutes=settings.JWT_VERIFY_TOKEN_EXPIRE_MINUTES)
    return create_access_token(
        subject=email,
        expires_delta=expires_delta,
        token_type="verify"
    )

def verify_verification_token(token: str) -> Optional[str]:
    """Verify an email verification token.
    
    Args:
        token: The verification token to verify
        
    Returns:
        Optional[str]: The email address if the token is valid, None otherwise
    """
    try:
        payload = verify_token(token)
        if payload.get("type") != "verify":
            return None
        return payload.get("sub")
    except HTTPException:
        return None

def generate_password_reset_token(email: str) -> str:
    """Generate a password reset token.
    
    Args:
        email: The email to generate a password reset token for
        
    Returns:
        str: JWT token for password reset
    """
    expires_delta = timedelta(minutes=settings.JWT_PASSWORD_RESET_TOKEN_EXPIRE_MINUTES)
    return create_access_token(
        subject=email,
        expires_delta=expires_delta,
        token_type="reset"
    )

def verify_password_reset_token(token: str) -> Optional[str]:
    """Verify a password reset token.
    
    Args:
        token: The password reset token to verify
        
    Returns:
        Optional[str]: The email address if the token is valid, None otherwise
    """
    try:
        payload = verify_token(token)
        if payload.get("type") != "reset":
            return None
        return payload.get("sub")
    except HTTPException:
        return None

def get_client_ip(request: Request) -> str:
    """Get the client's IP address from the request.
    
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
