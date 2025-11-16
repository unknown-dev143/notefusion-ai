from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from enum import Enum

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

class AIModelBase(BaseModel):
    name: str
    model_id: str
    provider: AIProvider
    is_available: bool = True
    status: AIModelStatus = AIModelStatus.ACTIVE
    max_tokens: Optional[int] = None
    description: Optional[str] = None

class AIModelCreate(AIModelBase):
    pass

class AIModelUpdate(BaseModel):
    is_available: Optional[bool] = None
    status: Optional[AIModelStatus] = None
    max_tokens: Optional[int] = None
    description: Optional[str] = None

class AIModel(AIModelBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class UserAIModelSettingsBase(BaseModel):
    model_id: int
    is_auto_upgrade: bool = True
    
class UserAIModelSettingsUpdate(BaseModel):
    model_id: Optional[int] = None
    is_auto_upgrade: Optional[bool] = None

class UserAIModelSettingsCreate(UserAIModelSettingsBase):
    pass

class UserAIModelSettingsUpdate(BaseModel):
    model_id: Optional[int] = None
    is_auto_upgrade: Optional[bool] = None

class UserAIModelSettings(UserAIModelSettingsBase):
    id: int
    user_id: int
    last_upgraded_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    ai_model: AIModel  # Include the full model object
    
    class Config:
        orm_mode = True

class AIConfigResponse(BaseModel):
    """Response model for AI configuration endpoint"""
    models: List[AIModel]
    settings: UserAIModelSettings
    update_available: bool
    recommended_upgrade: Optional[AIModel] = None
    last_checked: str
