from enum import Enum
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING, Any, Dict
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func

from .database_clean import Base

class AIProvider(str, Enum):
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    COHERE = "cohere"
    HUGGINGFACE = "huggingface"

class AIModelStatus(str, Enum):
    ACTIVE = "active"
    DEPRECATED = "deprecated"
    BETA = "beta"
    ALPHA = "alpha"

class DBAIModel(Base):
    __tablename__ = "ai_models"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    model_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    provider: Mapped[AIProvider] = mapped_column(SQLEnum(AIProvider), nullable=False)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True)
    status: Mapped[AIModelStatus] = mapped_column(SQLEnum(AIModelStatus), default=AIModelStatus.ACTIVE)
    max_tokens: Mapped[Optional[int]] = mapped_column(nullable=True)
    description: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, 
        server_default=func.now(), 
        onupdate=func.now(),
        nullable=False
    )
    
    # Relationships
    user_settings: Mapped[Any] = relationship(
        "UserAIModelSettings", 
        back_populates="ai_model",
        cascade="all, delete-orphan"
    )

class UserAIModelSettings(Base):
    __tablename__ = "user_ai_model_settings"
    __allow_unmapped__ = True  # Allow unmapped attributes to avoid Mapped[] requirement
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    model_id: Mapped[int] = mapped_column(ForeignKey("ai_models.id"), nullable=False)
    is_auto_upgrade: Mapped[bool] = mapped_column(Boolean, default=True)
    last_upgraded_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, 
        server_default=func.now(), 
        onupdate=func.now(),
        nullable=False
    )
    
    # Relationships
    user: Mapped[Any] = relationship("User", back_populates="ai_model_settings")
    ai_model: Mapped[Any] = relationship(
        "DBAIModel", 
        back_populates="user_settings",
        lazy="joined"
    )
