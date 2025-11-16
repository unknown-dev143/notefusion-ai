from datetime import datetime, timedelta
from typing import List, Optional, TYPE_CHECKING, Dict, Any
from sqlalchemy import String, Boolean, DateTime, ForeignKey, event, text
from sqlalchemy.orm import relationship, Mapped, mapped_column, Session, sessionmaker
from sqlalchemy.sql import func, select
from passlib.context import CryptContext
import secrets
import string

from .database_clean import Base, SessionLocal

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def generate_secure_string(length=32):
    """Generate a secure random string for tokens"""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))

class User(Base):
    __tablename__ = "users"
    
    # Basic info
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    # Relationships
    subscription: Mapped[Optional["Subscription"]] = relationship("Subscription", back_populates="user", uselist=False)
    ai_model_settings: Mapped[Optional["UserAIModelSettings"]] = relationship(
        "UserAIModelSettings", 
        back_populates="user", 
        uselist=False,
        cascade="all, delete-orphan"
    )
    
    # Authentication tokens
    verification_token: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)
    verification_token_expires: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    password_reset_token: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)
    password_reset_expires: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    # Security
    failed_login_attempts: Mapped[int] = mapped_column(default=0, nullable=False)
    last_failed_login: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    # API key
    openai_api_key: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )
    
    # Notification settings
    email_notifications: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    push_notifications: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
    # Token refresh
    refresh_token: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)
    refresh_token_expires: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    # Relationships
    tasks: Mapped[List["Task"]] = relationship("Task", back_populates="owner")
    ai_model_settings: Mapped["UserAIModelSettings"] = relationship(
        "UserAIModelSettings", back_populates="user", uselist=False
    )
    
    def __repr__(self) -> str:
        return f"<User {self.email}>"
    
    def verify_password(self, plain_password: str) -> bool:
        """Verify password against stored hash"""
        return pwd_context.verify(plain_password, self.hashed_password)
    
    def set_password(self, password: str) -> None:
        """Set hashed password"""
        self.hashed_password = pwd_context.hash(password)
    
    def generate_verification_token(self, expires_hours: int = 24) -> None:
        """Generate and store a verification token"""
        self.verification_token = generate_secure_string()
        self.verification_token_expires = datetime.utcnow() + timedelta(hours=expires_hours)
    
    def generate_password_reset_token(self, expires_minutes: int = 60) -> None:
        """Generate and store a password reset token"""
        self.password_reset_token = generate_secure_string()
        self.password_reset_expires = datetime.utcnow() + timedelta(minutes=expires_minutes)
    
    def generate_refresh_token(self, expires_days: int = 30) -> str:
        """Generate and store a refresh token"""
        self.refresh_token = generate_secure_string()
        self.refresh_token_expires = datetime.utcnow() + timedelta(days=expires_days)
        return self.refresh_token
    
    def clear_tokens(self) -> None:
        """Clear all authentication tokens"""
        self.verification_token = None
        self.verification_token_expires = None
        self.password_reset_token = None
        self.password_reset_expires = None
        self.refresh_token = None
        self.refresh_token_expires = None
    
    def record_failed_login(self) -> None:
        """Record a failed login attempt"""
        self.failed_login_attempts += 1
        self.last_failed_login = datetime.utcnow()
    
    def record_successful_login(self) -> None:
        """Record a successful login"""
        self.failed_login_attempts = 0
        self.last_login = datetime.utcnow()

# Event listeners
@event.listens_for(User, 'before_insert')
def before_user_insert(mapper, connection, target: User):
    target.email = target.email.lower()
    target.created_at = datetime.utcnow()
    target.updated_at = datetime.utcnow()

@event.listens_for(User, 'before_update')
def before_user_update(mapper, connection, target: User):
    if target.email:
        target.email = target.email.lower()
    target.updated_at = datetime.utcnow()

# Import here to avoid circular imports
if TYPE_CHECKING:
    from .ai_models import UserAIModelSettings
else:
    UserAIModelSettings = "UserAIModelSettings"

def _setup_ai_model_settings_relationship():
    """
    Set up the AI model settings relationship dynamically to avoid circular imports.
    This function is called at the end of the file after all models are defined.
    """
    # The relationship is already defined in the User class
    # No need to set it up again here
    pass

# Call the setup function when the module is loaded
_setup_ai_model_settings_relationship()
