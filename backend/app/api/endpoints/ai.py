from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, Optional
from pydantic import BaseModel
from ...config.ai_models import AIModel, get_available_models, get_default_model
from ...services.ai_service import AIService, ai_service
from ...core.security import get_current_active_user

router = APIRouter()

class AIModelInfo(BaseModel):
    id: str
    name: str
    description: str
    max_tokens: int
    available: bool

class AIConfigUpdate(BaseModel):
    api_key: Optional[str] = None
    default_model: Optional[str] = None

@router.get("/models", response_model=Dict[str, AIModelInfo])
async def list_models():
    """List all available AI models and their configurations."""
    models = {}
    for model_enum, config in get_available_models().items():
        models[model_enum.value] = {
            "id": model_enum.value,
            "name": config.name,
            "description": config.description,
            "max_tokens": config.max_tokens,
            "available": config.available
        }
    return models

@router.get("/models/default", response_model=AIModelInfo)
async def get_default_ai_model():
    """Get the default AI model configuration."""
    default_model = get_default_model()
    config = ai_service.get_model_info(default_model)
    return config

@router.post("/config", response_model=Dict[str, Any])
async def update_ai_config(
    config_update: AIConfigUpdate,
    current_user: dict = Depends(get_current_active_user)
):
    """Update AI configuration (API key and/or default model).
    
    Requires authentication and admin privileges.
    """
    if not current_user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Admin privileges required")
    
    updates = {}
    
    if config_update.api_key is not None:
        ai_service.set_api_key(config_update.api_key)
        updates["api_key_updated"] = True
        
    if config_update.default_model is not None:
        try:
            model_enum = AIModel(config_update.default_model)
            ai_service.set_model(model_enum)
            updates["default_model_updated"] = True
            updates["default_model"] = model_enum.value
        except ValueError as e:
            raise HTTPException(status_code=400, detail=f"Invalid model: {str(e)}")
    
    return {"status": "success", "updates": updates}

@router.get("/config/current", response_model=Dict[str, Any])
async def get_current_config(
    current_user: dict = Depends(get_current_active_user)
):
    """Get the current AI configuration."""
    if not current_user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Admin privileges required")
    
    return {
        "default_model": ai_service.default_model.value,
        "available_models": {
            m.value: m.name for m in get_available_models().keys()
        },
        "api_key_configured": bool(ai_service.api_key)
    }
