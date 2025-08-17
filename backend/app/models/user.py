from datetime import datetime, timedelta
from typing import List, Optional, TYPE_CHECKING, Dict, Any
from sqlalchemy import String, Boolean, DateTime, ForeignKey, event
from sqlalchemy.orm import relationship, Mapped, mapped_column, Session
from sqlalchemy.sql import func
from passlib.context import CryptContext
import secrets
import string

from .database import Base
from .subscription_models import Subscription

if TYPE_CHECKING:
    from .subscription_models import Subscription

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def generate_secure_string(length=32):
    """Generate a secure random string for tokens"""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))

class User(Base):
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    # Email verification
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    verification_token: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)
    verification_token_expires: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    # Password reset
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
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Token refresh
    refresh_token: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)
    refresh_token_expires: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    # Relationships
    notes = relationship("Note", back_populates="owner", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="user", cascade="all, delete-orphan")
    subscription: Mapped[Optional[Subscription]] = relationship(
        "Subscription", 
        back_populates="user", 
        uselist=False,
        cascade="all, delete-orphan"
    )
    invoices = relationship("Invoice", back_populates="user", cascade="all, delete-orphan")
    ai_model_settings = relationship(
        "UserAIModelSettings", 
        back_populates="user", 
        cascade="all, delete-orphan",
        lazy="selectin"
    )
    
    def __repr__(self) -> str:
        return f"<User {self.email}>"
    
    def verify_password(self, plain_password: str) -> bool:
        """Verify password against stored hash"""
        return pwd_context.verify(plain_password, self.hashed_password)
    
    def set_password(self, password: str) -> None:
        """Set hashed password"""
        self.hashed_password = pwd_context.hash(password)
    
    def generate_verification_token(self, expires_hours: int = 24) -> str:
        """Generate and store a verification token"""
        self.verification_token = generate_secure_string()
        self.verification_token_expires = datetime.utcnow() + timedelta(hours=expires_hours)
        return self.verification_token
    
    def generate_password_reset_token(self, expires_minutes: int = 60) -> str:
        """Generate and store a password reset token"""
        self.password_reset_token = generate_secure_string()
        self.password_reset_expires = datetime.utcnow() + timedelta(minutes=expires_minutes)
        return self.password_reset_token
    
    def generate_refresh_token(self, expires_days: int = 30) -> str:
        """Generate and store a refresh token"""
        self.refresh_token = generate_secure_string(64)
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
        self.last_login = datetime.utcnow()
        self.failed_login_attempts = 0
        self.last_failed_login = None

# Event listeners
@event.listens_for(User, 'before_insert')
def before_user_insert(mapper, connection, target: User) -> None:
    if target.hashed_password and not target.hashed_password.startswith('$2b$'):
        target.hashed_password = pwd_context.hash(target.hashed_password)

@event.listens_for(User, 'before_update')
def before_user_update(mapper, connection, target: User) -> None:
    # Only hash the password if it's being set directly (not already hashed)
    state = target._sa_instance_state
    if state.attrs.hashed_password.history.has_changes() and target.hashed_password and not target.hashed_password.startswith('$2b$'):
        target.hashed_password = pwd_context.hash(target.hashed_password)

# Import here to avoid circular imports
if TYPE_CHECKING:
    from .ai_models import UserAIModelSettings
else:
    # Lazy import for runtime
    UserAIModelSettings = "UserAIModelSettings"

# Update the UserAIModelSettings to include the relationship
def _setup_ai_model_settings_relationship():
    from .ai_models import UserAIModelSettings
    UserAIModelSettings.user = relationship(
        "User", 
        back_populates="ai_model_settings",
        cascade="all, delete-orphan"
    )

# Call the setup function when the module is loaded
_setup_ai_model_settings_relationship()
