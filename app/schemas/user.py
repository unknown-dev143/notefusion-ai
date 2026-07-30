from enum import Enum
from typing import Optional, List, Dict, Any, Union
from datetime import datetime, date

from pydantic import (
    BaseModel,
    EmailStr,
    Field,
    field_validator,
    model_validator,
    HttpUrl,
    constr,
    conint,
    conlist,
    ConfigDict,
)


class UserRole(str, Enum):
    """User roles for role-based access control"""

    USER = "user"
    EDITOR = "editor"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"


class UserBase(BaseModel):
    """Base user model containing common fields for all user-related schemas."""

    email: EmailStr = Field(..., description="User's email address, must be unique")
    username: str = Field(
        ...,
        min_length=3,
        max_length=50,
        pattern=r"^[a-zA-Z0-9_-]+$",
        description="Username may only contain letters, numbers, underscores, and hyphens",
    )
    full_name: Optional[str] = Field(
        None, min_length=1, max_length=100, description="User's full name"
    )

    @field_validator("username")
    @classmethod
    def username_must_be_valid(cls, v: str) -> str:
        if " " in v:
            raise ValueError("Username cannot contain spaces")
        if not v.replace("-", "").replace("_", "").isalnum():
            raise ValueError(
                "Username can only contain alphanumeric characters, underscores, and hyphens"
            )
        return v.lower()


class UserCreate(UserBase):
    """Schema for creating a new user."""

    password: str = Field(
        ...,
        min_length=8,
        max_length=100,
        description="Password must be at least 8 characters long and contain at least one number and one special character",
    )
    password_confirm: str = Field(..., description="Must match the password field")

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not any(char.isdigit() for char in v):
            raise ValueError("Password must contain at least one number")
        if not any(char.isupper() for char in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(char.islower() for char in v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(not char.isalnum() for char in v):
            raise ValueError("Password must contain at least one special character")
        return v

    @model_validator(mode="after")
    def passwords_match(self) -> "UserCreate":
        if self.password != self.password_confirm:
            raise ValueError("Passwords do not match")
        return self


class UserUpdate(BaseModel):
    """Schema for updating an existing user."""

    email: Optional[EmailStr] = Field(None, description="New email address")
    username: Optional[str] = Field(
        None,
        min_length=3,
        max_length=50,
        pattern=r"^[a-zA-Z0-9_-]+$",
        description="New username",
    )
    full_name: Optional[str] = Field(
        None, min_length=1, max_length=100, description="New full name"
    )
    current_password: Optional[str] = Field(
        None,
        min_length=8,
        description="Current password (required for sensitive changes)",
    )
    new_password: Optional[str] = Field(
        None,
        min_length=8,
        max_length=100,
        description="New password (must be at least 8 characters long)",
    )

    @model_validator(mode="after")
    def validate_password_change(self) -> "UserUpdate":
        if self.new_password and not self.current_password:
            raise ValueError("Current password is required to set a new password")

        if self.new_password:
            v = self.new_password
            if len(v) < 8:
                raise ValueError("New password must be at least 8 characters long")
            if not any(char.isdigit() for char in v):
                raise ValueError("New password must contain at least one number")
            if not any(char.isupper() for char in v):
                raise ValueError(
                    "New password must contain at least one uppercase letter"
                )
            if not any(char.islower() for char in v):
                raise ValueError(
                    "New password must contain at least one lowercase letter"
                )
            if not any(not char.isalnum() for char in v):
                raise ValueError(
                    "New password must contain at least one special character"
                )

        return self


class UserBaseResponse(UserBase):
    """Base response model for user data (excludes sensitive information)."""

    id: int = Field(..., description="Unique identifier for the user")
    is_active: bool = Field(
        default=True, description="Whether the user account is active"
    )
    is_verified: bool = Field(
        default=False, description="Whether the user's email has been verified"
    )
    role: UserRole = Field(
        default=UserRole.USER, description="User's role for access control"
    )
    created_at: datetime = Field(..., description="Timestamp when the user was created")
    updated_at: Optional[datetime] = Field(
        None, description="Timestamp when the user was last updated"
    )
    last_login: Optional[datetime] = Field(
        None, description="Timestamp of the user's last login"
    )

    model_config = ConfigDict(from_attributes=True, use_enum_values=True)


class UserResponse(UserBaseResponse):
    """Response model for user data (includes public profile information)."""

    pass


class UserInDB(UserBaseResponse):
    """Internal user model that includes hashed password and other sensitive data.

    This should never be returned in API responses.
    """

    hashed_password: str = Field(..., description="Hashed password")
    failed_login_attempts: int = Field(0, description="Number of failed login attempts")
    last_failed_login: Optional[datetime] = Field(
        None, description="Timestamp of last failed login attempt"
    )
    token_version: int = Field(
        0, description="Token version for invalidating old tokens"
    )

    model_config = ConfigDict(
        from_attributes=True,
        exclude={
            "hashed_password",
            "failed_login_attempts",
            "last_failed_login",
            "token_version",
        },
    )


class UserLogin(BaseModel):
    """Schema for user login."""

    username: str = Field(..., description="Username or email address")
    password: str = Field(..., description="Password")
    remember_me: bool = Field(
        False, description="Whether to create a long-lived session"
    )


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

    @field_validator("terms_accepted")
    @classmethod
    def terms_must_be_accepted(cls, v: bool) -> bool:
        if not v:
            raise ValueError("You must accept the terms and conditions")
        return v


class UserPasswordReset(BaseModel):
    """Schema for requesting a password reset."""

    email: EmailStr = Field(..., description="User's email address")


class UserPasswordResetConfirm(BaseModel):
    """Schema for confirming a password reset."""

    token: str = Field(..., description="Password reset token")
    new_password: str = Field(..., min_length=8, description="New password")
    confirm_password: str = Field(..., description="Confirm new password")

    @model_validator(mode="after")
    def passwords_match(self) -> "UserPasswordResetConfirm":
        if self.new_password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self


class UserProfileUpdate(UserBase):
    """Schema for updating user profile information."""

    current_password: Optional[str] = Field(
        None,
        min_length=8,
        description="Current password (required for sensitive changes)",
    )

    @model_validator(mode="after")
    def validate_sensitive_changes(self) -> "UserProfileUpdate":
        if self.email and not self.current_password:
            raise ValueError("Current password is required to change email")
        return self


class UserSessionResponse(BaseModel):
    """Response model for user session information."""

    id: int = Field(..., description="Session ID")
    user_agent: Optional[str] = Field(None, description="User agent string")
    ip_address: Optional[str] = Field(None, description="IP address")
    created_at: datetime = Field(..., description="When the session was created")
    last_activity: datetime = Field(..., description="Last activity timestamp")
    is_current: bool = Field(False, description="Whether this is the current session")

    model_config = ConfigDict(from_attributes=True)


User = UserResponse
