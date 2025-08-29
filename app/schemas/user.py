from enum import Enum
from typing import Optional, List, Dict, Any
from datetime import datetime, date

from pydantic import (
    BaseModel, EmailStr, Field, validator, root_validator,
    HttpUrl, constr, conint, conlist
)
from pydantic.types import constr

class UserRole(str, Enum):
    """User roles for role-based access control"""
    USER = "user"
    EDITOR = "editor"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"

class UserBase(BaseModel):
    """Base user model containing common fields for all user-related schemas."""
    email: EmailStr = Field(
        ...,
        description="User's email address, must be unique",
        example="user@example.com"
    )
    username: str = Field(
        ...,
        min_length=3,
        max_length=50,
        regex=r'^[a-zA-Z0-9_-]+$',
        description="Username may only contain letters, numbers, underscores, and hyphens",
        example="johndoe"
    )
    full_name: Optional[str] = Field(
        None,
        min_length=1,
        max_length=100,
        description="User's full name",
        example="John Doe"
    )
    
    @validator('username')
    def username_must_be_valid(cls, v):
        if ' ' in v:
            raise ValueError('Username cannot contain spaces')
        if not v.isalnum() and '-' not in v and '_' not in v:
            raise ValueError('Username can only contain alphanumeric characters, underscores, and hyphens')
        return v.lower()

class UserCreate(UserBase):
    """Schema for creating a new user."""
    password: str = Field(
        ...,
        min_length=8,
        max_length=100,
        description="Password must be at least 8 characters long and contain at least one number and one special character",
        example="SecurePassword123!"
    )
    password_confirm: str = Field(
        ...,
        description="Must match the password field",
        example="SecurePassword123!"
    )
    
    @validator('password')
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one number')
        if not any(char.isupper() for char in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(char.islower() for char in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(not char.isalnum() for char in v):
            raise ValueError('Password must contain at least one special character')
        return v
    
    @root_validator
    def passwords_match(cls, values):
        password = values.get('password')
        password_confirm = values.get('password_confirm')
        if password != password_confirm:
            raise ValueError('Passwords do not match')
        return values

class UserUpdate(BaseModel):
    """Schema for updating an existing user."""
    email: Optional[EmailStr] = Field(
        None,
        description="New email address",
        example="new.email@example.com"
    )
    username: Optional[str] = Field(
        None,
        min_length=3,
        max_length=50,
        regex=r'^[a-zA-Z0-9_-]+$',
        description="New username"
    )
    full_name: Optional[str] = Field(
        None,
        min_length=1,
        max_length=100,
        description="New full name"
    )
    current_password: Optional[str] = Field(
        None,
        min_length=8,
        description="Current password (required for sensitive changes)"
    )
    new_password: Optional[str] = Field(
        None,
        min_length=8,
        max_length=100,
        description="New password (must be at least 8 characters long)"
    )
    
    @root_validator
    def validate_password_change(cls, values):
        new_password = values.get('new_password')
        current_password = values.get('current_password')
        
        if new_password and not current_password:
            raise ValueError('Current password is required to set a new password')
            
        if new_password:
            if len(new_password) < 8:
                raise ValueError('New password must be at least 8 characters long')
            if not any(char.isdigit() for char in new_password):
                raise ValueError('New password must contain at least one number')
            if not any(char.isupper() for char in new_password):
                raise ValueError('New password must contain at least one uppercase letter')
            if not any(char.islower() for char in new_password):
                raise ValueError('New password must contain at least one lowercase letter')
            if not any(not char.isalnum() for char in new_password):
                raise ValueError('New password must contain at least one special character')
                
        return values

class UserBaseResponse(UserBase):
    """Base response model for user data (excludes sensitive information)."""
    id: int = Field(..., description="Unique identifier for the user")
    is_active: bool = Field(default=True, description="Whether the user account is active")
    is_verified: bool = Field(default=False, description="Whether the user's email has been verified")
    role: UserRole = Field(default=UserRole.USER, description="User's role for access control")
    created_at: datetime = Field(..., description="Timestamp when the user was created")
    updated_at: datetime = Field(..., description="Timestamp when the user was last updated")
    last_login: Optional[datetime] = Field(None, description="Timestamp of the user's last login")
    
    class Config:
        orm_mode = True
        use_enum_values = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
        }


class UserResponse(UserBaseResponse):
    """Response model for user data (includes public profile information)."""
    pass


class UserInDB(UserBaseResponse):
    """Internal user model that includes hashed password and other sensitive data.
    
    This should never be returned in API responses.
    """
    hashed_password: str = Field(..., description="Hashed password")
    failed_login_attempts: int = Field(0, description="Number of failed login attempts")
    last_failed_login: Optional[datetime] = Field(None, description="Timestamp of last failed login attempt")
    token_version: int = Field(0, description="Token version for invalidating old tokens")
    
    class Config(UserBaseResponse.Config):
        fields = {
            'hashed_password': {'exclude': True},
            'failed_login_attempts': {'exclude': True},
            'last_failed_login': {'exclude': True},
            'token_version': {'exclude': True},
        }


class UserLogin(BaseModel):
    """Schema for user login."""
    username: str = Field(..., description="Username or email address")
    password: str = Field(..., description="Password")
    remember_me: bool = Field(False, description="Whether to create a long-lived session")


class UserLoginResponse(BaseModel):
    """Response model for successful login."""
    access_token: str = Field(..., description="JWT access token")
    refresh_token: str = Field(..., description="JWT refresh token")
    token_type: str = Field("bearer", description="Type of token")
    expires_in: int = Field(..., description="Time in seconds until the token expires")
    user: UserResponse = Field(..., description="User information")


class UserRegister(UserCreate):
    """Schema for user registration."""
    terms_accepted: bool = Field(
        False,
        description="Must be true to accept terms and conditions",
    )
    
    @validator('terms_accepted')
    def terms_must_be_accepted(cls, v):
        if not v:
            raise ValueError('You must accept the terms and conditions')
        return v


class UserPasswordReset(BaseModel):
    """Schema for requesting a password reset."""
    email: EmailStr = Field(..., description="User's email address")


class UserPasswordResetConfirm(BaseModel):
    """Schema for confirming a password reset."""
    token: str = Field(..., description="Password reset token")
    new_password: str = Field(..., min_length=8, description="New password")
    confirm_password: str = Field(..., description="Confirm new password")
    
    @validator('confirm_password')
    def passwords_match(cls, v, values, **kwargs):
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('Passwords do not match')
        return v


class UserProfileUpdate(UserBase):
    """Schema for updating user profile information."""
    current_password: Optional[str] = Field(
        None,
        min_length=8,
        description="Current password (required for sensitive changes)"
    )
    
    @root_validator
    def validate_sensitive_changes(cls, values):
        email = values.get('email')
        current_password = values.get('current_password')
        
        if email and not current_password:
            raise ValueError('Current password is required to change email')
            
        return values


class UserSessionResponse(BaseModel):
    """Response model for user session information."""
    id: int = Field(..., description="Session ID")
    user_agent: Optional[str] = Field(None, description="User agent string")
    ip_address: Optional[str] = Field(None, description="IP address")
    created_at: datetime = Field(..., description="When the session was created")
    last_activity: datetime = Field(..., description="Last activity timestamp")
    is_current: bool = Field(False, description="Whether this is the current session")
    
    class Config:
        orm_mode = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
        }
