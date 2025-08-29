from datetime import timedelta
import re
from typing import Dict, Any

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from pydantic import EmailStr, validator

from app.core.security import (
    authenticate_user,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    get_password_hash,
    verify_password
)
from app.core.database import get_db
from app.models.user import User
from app.schemas.user import User as UserSchema, UserCreate, UserInDB
from app.schemas.token import Token
from app.core.logging import logger

router = APIRouter(tags=["authentication"])

# Constants
USERNAME_PATTERN = r'^[a-zA-Z0-9_-]{3,20}$'
PASSWORD_MIN_LENGTH = 8

@router.post("/token", response_model=Token, responses={
    401: {"description": "Incorrect username or password"},
    400: {"description": "Inactive user or invalid input"},
    500: {"description": "Internal server error"}
})
async def login_for_access_token(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    try:
        # Input validation
        if not form_data.username or not form_data.password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username and password are required"
            )

        # Authenticate user
        user = authenticate_user(db, form_data.username, form_data.password)
        if not user:
            logger.warning(f"Failed login attempt for username: {form_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not user.is_active:
            logger.warning(f"Login attempt for inactive user: {user.username}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is not active. Please contact support."
            )
        
        # Generate access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.username, "user_id": str(user.id)},
            expires_delta=access_token_expires
        )
        
        logger.info(f"User {user.username} logged in successfully")
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": int(access_token_expires.total_seconds()),
            "user": {
                "id": str(user.id),
                "username": user.username,
                "email": user.email,
                "is_active": user.is_active,
                "is_superuser": user.is_superuser
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during login. Please try again."
        )

@router.post(
    "/register",
    response_model=UserSchema,
    status_code=status.HTTP_201_CREATED,
    responses={
        400: {"description": "Invalid input or user already exists"},
        500: {"description": "Internal server error"}
    }
)
async def register_user(
    request: Request,
    user_data: UserCreate,
    db: Session = Depends(get_db)
) -> User:
    """
    Register a new user account
    """
    try:
        # Validate username format
        if not re.match(USERNAME_PATTERN, user_data.username):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Username must be 3-20 characters long and "
                    "contain only letters, numbers, underscores, or hyphens"
                )
            )
        
        # Validate password strength
        if len(user_data.password) < PASSWORD_MIN_LENGTH:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Password must be at least {PASSWORD_MIN_LENGTH} characters long"
            )
        
        # Check if email is valid
        try:
            EmailStr.validate(user_data.email)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email format"
            )
        
        # Check for existing user with email or username
        existing_user = db.query(User).filter(
            (User.email == user_data.email) | 
            (User.username == user_data.username)
        ).first()
        
        if existing_user:
            if existing_user.email == user_data.email:
                detail = "Email already registered"
            else:
                detail = "Username already taken"
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=detail
            )
        
        # Create new user
        hashed_password = get_password_hash(user_data.password)
        db_user = User(
            email=user_data.email,
            username=user_data.username,
            hashed_password=hashed_password,
            is_active=True,
            is_superuser=False  # Default to non-admin
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        logger.info(f"New user registered: {db_user.username} ({db_user.email})")
        
        return db_user
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Registration error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during registration. Please try again."
        )
