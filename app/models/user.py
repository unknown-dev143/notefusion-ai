from datetime import datetime
from enum import Enum as EnumType
from typing import List, Optional

from sqlalchemy import (
    Boolean, Column, DateTime, Enum, Integer, String, 
    ForeignKey, event
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from passlib.context import CryptContext

from app.core.database import Base, engine
from app.core.config import settings
from app.schemas.user import UserRole

# Initialize password context with increased work factor
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=settings.SECURITY_BCRYPT_ROUNDS,
)

class User(Base):
    """User model for authentication and authorization."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)
    
    # Authentication
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    is_superuser = Column(Boolean, default=False)
    role = Column(Enum(UserRole), default=UserRole.USER, nullable=False)
    
    # Security
    failed_login_attempts = Column(Integer, default=0, nullable=False)
    last_failed_login = Column(DateTime, nullable=True)
    last_login = Column(DateTime, nullable=True)
    token_version = Column(Integer, default=0, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    notes = relationship("Note", back_populates="owner", cascade="all, delete-orphan")
    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self) -> str:
        return f"<User {self.username}>"
    
    def verify_password(self, password: str) -> bool:
        """Verify the provided password against the stored hash."""
        try:
            return pwd_context.verify(password, self.hashed_password)
        except Exception as e:
            return False
    
    def set_password(self, password: str) -> None:
        """Set a new password for the user."""
        self.hashed_password = pwd_context.hash(password)
    
    def increment_token_version(self) -> None:
        """Increment the token version to invalidate all existing tokens."""
        self.token_version += 1
    
    def record_failed_login(self) -> None:
        """Record a failed login attempt."""
        self.failed_login_attempts += 1
        self.last_failed_login = datetime.utcnow()
    
    def record_successful_login(self) -> None:
        """Record a successful login."""
        self.last_login = datetime.utcnow()
        self.failed_login_attempts = 0
    
    def is_locked(self) -> bool:
        """Check if the account is locked due to too many failed login attempts."""
        if self.failed_login_attempts < settings.MAX_LOGIN_ATTEMPTS:
            return False
            
        if not self.last_failed_login:
            return False
            
        lockout_time = self.last_failed_login + timedelta(
            minutes=settings.LOGIN_LOCKOUT_MINUTES
        )
        return datetime.utcnow() < lockout_time
    
    def has_permission(self, permission: str) -> bool:
        """Check if the user has a specific permission."""
        if self.is_superuser:
            return True
            
        # Example permission check - expand based on your needs
        if permission == "admin" and self.role == UserRole.ADMIN:
            return True
            
        return False


class UserSession(Base):
    """Track user sessions for security and analytics."""
    __tablename__ = "user_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    session_token = Column(String(255), unique=True, nullable=False)
    refresh_token = Column(String(255), unique=True, nullable=True)
    user_agent = Column(String(500), nullable=True)
    ip_address = Column(String(45), nullable=True)  # IPv6 can be up to 45 chars
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_activity = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)
    
    # Relationships
    user = relationship("User", back_populates="sessions")
    
    def is_expired(self) -> bool:
        """Check if the session has expired."""
        return datetime.utcnow() > self.expires_at


@event.listens_for(User, 'before_insert')
def hash_password_before_insert(mapper, connection, target):
    """Hash the password before inserting a new user."""
    if target.hashed_password and not target.hashed_password.startswith('$'):
        target.hashed_password = pwd_context.hash(target.hashed_password)


@event.listens_for(User, 'before_update')
def hash_password_before_update(mapper, connection, target):
    """Hash the password before updating a user if it was changed."""
    state = target.__mapper__.get_history('hashed_password', target.dict())
    if state.added and not state.added[0].startswith('$'):
        target.hashed_password = pwd_context.hash(state.added[0])
