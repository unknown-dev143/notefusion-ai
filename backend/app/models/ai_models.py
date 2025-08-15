from enum import Enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum as SQLEnum, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

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
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    model_id = Column(String, unique=True, nullable=False)
    provider = Column(SQLEnum(AIProvider), nullable=False)
    is_available = Column(Boolean, default=True)
    status = Column(SQLEnum(AIModelStatus), default=AIModelStatus.ACTIVE)
    max_tokens = Column(Integer)
    description = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user_settings = relationship("UserAIModelSettings", back_populates="ai_model")

class UserAIModelSettings(Base):
    __tablename__ = "user_ai_model_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    model_id = Column(Integer, ForeignKey("ai_models.id"), nullable=False)
    is_auto_upgrade = Column(Boolean, default=True)
    last_upgraded_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="ai_model_settings")
    ai_model = relationship("DBAIModel", back_populates="user_settings")
