import os
import time
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Union

from jose import JWTError, jwt
from jose.exceptions import ExpiredSignatureError, JWTClaimsError
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, SecurityScopes
from fastapi.security.utils import get_authorization_scheme_param
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.schemas.user import UserInDB, UserRole
from app.core.logging import logger
from app.core.config import settings

# Security configurations
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
REFRESH_TOKEN_EXPIRE_DAYS = settings.REFRESH_TOKEN_EXPIRE_DAYS
TOKEN_TYPE = "bearer"

# Password hashing configuration
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12,  # Increased work factor for better security
)

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/token",
    scopes={
        "me": "Read information about the current user.",
        "notes:read": "Read notes.",
        "notes:write": "Create and update notes.",
        "admin": "Admin operations.",
    },
)

# Rate limiting store (in production, use Redis or similar)
_rate_limit_store = {}

def get_rate_limit_key(client_ip: str, endpoint: str) -> str:
    """Generate a key for rate limiting"""
    return f"rate_limit:{client_ip}:{endpoint}"

def check_rate_limit(request: Request, limit: int = 60, window: int = 60) -> bool:
    """Check if the request is within rate limits"""
    client_ip = request.client.host
    endpoint = request.url.path
    key = get_rate_limit_key(client_ip, endpoint)
    
    current_time = time.time()
    window_start = current_time - window
    
    # Clean up old entries
    _rate_limit_store[key] = [t for t in _rate_limit_store.get(key, []) if t > window_start]
    
    # Check rate limit
    if len(_rate_limit_store.get(key, [])) >= limit:
        return False
    
    # Add current request
    if key not in _rate_limit_store:
        _rate_limit_store[key] = []
    _rate_limit_store[key].append(current_time)
    return True

# Password hashing and validation
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        logger.error(f"Password verification error: {str(e)}")
        return False  # Fail securely

def get_password_hash(password: str) -> str:
    """Generate a password hash"""
    return pwd_context.hash(password)

def validate_password_strength(password: str) -> Dict[str, Union[bool, str]]:
    """Validate password strength"""
    if len(password) < 8:
        return {"valid": False, "message": "Password must be at least 8 characters long"}
    if not any(char.isdigit() for char in password):
        return {"valid": False, "message": "Password must contain at least one number"}
    if not any(char.isupper() for char in password):
        return {"valid": False, "message": "Password must contain at least one uppercase letter"}
    if not any(char.islower() for char in password):
        return {"valid": False, "message": "Password must contain at least one lowercase letter"}
    if not any(not char.isalnum() for char in password):
        return {"valid": False, "message": "Password must contain at least one special character"}
    return {"valid": True, "message": "Password is strong"}

# JWT token functions
def create_access_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None,
    token_type: str = "access"
) -> str:
    """
    Create a JWT token with the given data and expiration time
    
    Args:
        data: The data to include in the token
        expires_delta: Time until the token expires
        token_type: Type of token (access or refresh)
        
    Returns:
        str: Encoded JWT token
    """
    to_encode = data.copy()
    now = datetime.utcnow()
    
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Standard claims
    to_encode.update({
        "exp": expire,
        "iat": now,
        "nbf": now,  # Not before
        "type": token_type,
        "iss": settings.PROJECT_NAME,
        "aud": settings.PROJECT_NAME,
    })
    
    try:
        encoded_jwt = jwt.encode(
            to_encode,
            SECRET_KEY,
            algorithm=ALGORITHM,
            headers={"kid": "1"}  # Key ID for key rotation
        )
        return encoded_jwt
    except Exception as e:
        logger.error(f"Error creating JWT token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not create access token"
        )

def create_refresh_token(user_id: str) -> str:
    """Create a refresh token"""
    expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    return create_access_token(
        {"sub": user_id, "type": "refresh"},
        expires_delta=expires
    )

def verify_token(token: str) -> Dict[str, Any]:
    """Verify and decode a JWT token"""
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
            options={
                "verify_aud": True,
                "verify_iss": True,
                "verify_signature": True,
                "require_exp": True,
                "require_iat": True,
                "require_nbf": True,
            },
            issuer=settings.PROJECT_NAME,
            audience=settings.PROJECT_NAME,
        )
        return payload
    except ExpiredSignatureError:
        logger.warning("Token has expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTError as e:
        logger.warning(f"Invalid token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Authentication
def authenticate_user(
    db: Session,
    username: str,
    password: str,
    request: Optional[Request] = None
) -> Optional[User]:
    """
    Authenticate a user with username/email and password
    
    Args:
        db: Database session
        username: Username or email
        password: Plain text password
        request: Optional request object for logging
        
    Returns:
        User object if authentication succeeds, None otherwise
    """
    if not username or not password:
        return None
        
    try:
        # Try to find user by username or email
        user = db.query(User).filter(
            (User.username == username) | (User.email == username)
        ).first()
        
        if not user:
            # Log failed login attempt
            if request:
                logger.warning(
                    "Failed login attempt - user not found",
                    extra={
                        "username": username,
                        "ip": request.client.host if request.client else None,
                        "user_agent": request.headers.get("user-agent")
                    }
                )
            return None
            
        # Check if account is locked
        if user.failed_login_attempts >= settings.MAX_LOGIN_ATTEMPTS:
            lockout_time = user.last_failed_login + timedelta(minutes=settings.LOGIN_LOCKOUT_MINUTES)
            if datetime.utcnow() < lockout_time:
                logger.warning(
                    f"Account locked for user {user.username} until {lockout_time}"
                )
                return None
            else:
                # Reset failed attempts after lockout period
                user.failed_login_attempts = 0
                db.commit()
        
        # Verify password
        if not verify_password(password, user.hashed_password):
            # Update failed login attempts
            user.failed_login_attempts += 1
            user.last_failed_login = datetime.utcnow()
            db.commit()
            
            if request:
                logger.warning(
                    "Failed login attempt - invalid password",
                    extra={
                        "user_id": str(user.id),
                        "username": user.username,
                        "ip": request.client.host if request.client else None,
                        "attempts": user.failed_login_attempts,
                        "max_attempts": settings.MAX_LOGIN_ATTEMPTS
                    }
                )
            return None
            
        # Reset failed login attempts on successful login
        if user.failed_login_attempts > 0:
            user.failed_login_attempts = 0
            db.commit()
            
        logger.info(f"User {user.username} authenticated successfully")
        return user
        
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}", exc_info=True)
        return None

# Token and user dependency injection
async def get_current_user(
    security_scopes: SecurityScopes,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Dependency to get the current user from the JWT token
    
    Args:
        security_scopes: Security scopes required for the endpoint
        token: JWT token from the Authorization header
        db: Database session
        
    Returns:
        User: The authenticated user
        
    Raises:
        HTTPException: If authentication fails or user doesn't have required scopes
    """
    if security_scopes.scopes:
        authenticate_value = f'Bearer scope="{security_scopes.scope_str}"'
    else:
        authenticate_value = "Bearer"
        
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": authenticate_value},
    )
    
    try:
        # Verify and decode token
        payload = verify_token(token)
        
        # Check token type
        if payload.get("type") != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
                headers={"WWW-Authenticate": authenticate_value},
            )
            
        # Get user ID from token
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
            
        # Get user from database
        user = db.query(User).filter(User.id == user_id).first()
        if user is None:
            raise credentials_exception
            
        # Check if token is in the blacklist
        if user.token_version != payload.get("version", 0):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has been revoked",
                headers={"WWW-Authenticate": authenticate_value},
            )
            
        # Check scopes if required
        if security_scopes.scopes:
            token_scopes = payload.get("scopes", [])
            for scope in security_scopes.scopes:
                if scope not in token_scopes:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Not enough permissions",
                        headers={"WWW-Authenticate": authenticate_value},
                    )
                    
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting current user: {str(e)}", exc_info=True)
        raise credentials_exception

# Get current active user
async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Dependency to get the current active user
    
    Args:
        current_user: The current user from get_current_user
        
    Returns:
        User: The active user
        
    Raises:
        HTTPException: If the user is inactive
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user

# Get current active superuser
async def get_current_active_superuser(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Dependency to get the current active superuser
    
    Args:
        current_user: The current user from get_current_user
        
    Returns:
        User: The superuser
        
    Raises:
        HTTPException: If the user is not a superuser
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )
    return current_user

# Role-based access control
def has_required_roles(required_roles: list[UserRole]):
    """
    Dependency to check if user has any of the required roles
    
    Args:
        required_roles: List of roles that are allowed to access the endpoint
        
    Returns:
        Callable: Dependency function
    """
    async def role_checker(current_user: User = Depends(get_current_active_user)) -> User:
        if current_user.role not in required_roles and not current_user.is_superuser:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        return current_user
    return role_checker

# Get current user with optional authentication
async def get_current_user_optional(
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme),
) -> Optional[User]:
    """
    Dependency to get the current user if authenticated, None otherwise
    """
    if not token:
        return None
        
    try:
        payload = verify_token(token)
        user_id = payload.get("sub")
        if user_id is None:
            return None
            
        user = db.query(User).filter(User.id == user_id).first()
        if user and user.token_version == payload.get("version", 0):
            return user
        return None
    except HTTPException:
        return None
    except Exception as e:
        logger.error(f"Error in get_current_user_optional: {str(e)}")
        return None
