from datetime import datetime
from typing import List, Optional
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    openai_api_key = Column(String, nullable=True)
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    ai_model_settings = relationship("UserAIModelSettings", back_populates="user", uselist=False)
    
    def __repr__(self):
        return f"<User {self.email}>"

# Update the UserAIModelSettings to include the relationship
from .ai_models import UserAIModelSettings as UserAIModelSettingsModel
UserAIModelSettingsModel.user = relationship("User", back_populates="ai_model_settings")
