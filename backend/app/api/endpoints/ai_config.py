from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
import logging
from datetime import datetime

from ...database.database import get_db
from ...models.ai_models import DBAIModel, UserAIModelSettings
from ...schemas.ai_models import AIConfig as SchemaAIConfig, UserAIModelSettings as SchemaUserAIModelSettings
from ...core.security import get_current_active_user
from ...models.user import User
from ...services.model_update_service import ModelUpdateService

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/config/current", response_model=SchemaAIConfig)
async def get_ai_config(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get the current AI configuration for the user."""
    try:
        # Get user's model settings or create default
        user_settings = db.query(UserAIModelSettings).filter(
            UserAIModelSettings.user_id == current_user.id
        ).first()
        
        if not user_settings:
            # Create default settings
            default_model = db.query(DBAIModel).filter(
                DBAIModel.is_available == True,
                DBAIModel.provider == "openai"  # Default provider
            ).order_by(DBAIModel.created_at.desc()).first()
            
            if not default_model:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="No available AI models found"
                )
                
            user_settings = UserAIModelSettings(
                user_id=current_user.id,
                model_id=default_model.id,
                is_auto_upgrade=True
            )
            db.add(user_settings)
            db.commit()
            db.refresh(user_settings)
        
        # Get the model details
        model = db.query(DBAIModel).filter(DBAIModel.id == user_settings.model_id).first()
        if not model:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Configured model not found"
            )
            
        # Check for updates if needed
        update_service = ModelUpdateService(db)
        if user_settings.is_auto_upgrade:
            await update_service.check_for_updates()
            
        # Check if there's a recommended upgrade
        recommended_upgrade = None
        if user_settings.is_auto_upgrade and model.id != update_service.get_recommended_model().id:
            recommended_upgrade = update_service.get_recommended_model().model_id
        
        return {
            "default_model": model.model_id,
            "api_key_configured": bool(current_user.openai_api_key),
            "auto_upgrade": user_settings.is_auto_upgrade,
            "last_checked_for_updates": user_settings.last_checked_at.isoformat() if user_settings.last_checked_at else None,
            "update_available": recommended_upgrade is not None,
            "recommended_upgrade": recommended_upgrade
        }
        
    except Exception as e:
        logger.error(f"Error getting AI config: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get AI configuration"
        )

@router.post("/config", response_model=SchemaAIConfig)
async def update_ai_config(
    config: SchemaAIConfig,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update the AI configuration for the user."""
    try:
        # Get or create user settings
        user_settings = db.query(UserAIModelSettings).filter(
            UserAIModelSettings.user_id == current_user.id
        ).first()
        
        if not user_settings:
            user_settings = UserAIModelSettings(user_id=current_user.id)
            db.add(user_settings)
        
        # Update API key if provided
        if config.api_key is not None:
            current_user.openai_api_key = config.api_key
            
        # Update model if provided
        if config.default_model is not None:
            model = db.query(DBAIModel).filter(
                DBAIModel.model_id == config.default_model,
                DBAIModel.is_available == True
            ).first()
            
            if not model:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Model {config.default_model} is not available"
                )
                
            user_settings.model_id = model.id
            user_settings.last_upgraded_at = datetime.utcnow()
        
        # Update auto-upgrade setting
        if config.auto_upgrade is not None:
            user_settings.is_auto_upgrade = config.auto_upgrade
        
        # Check for updates if requested
        if config.check_updates:
            update_service = ModelUpdateService(db)
            await update_service.check_for_updates(force=True)
            user_settings.last_checked_at = datetime.utcnow()
        
        db.commit()
        db.refresh(user_settings)
        
        # Get the updated model
        model = db.query(DBAIModel).filter(DBAIModel.id == user_settings.model_id).first()
        
        return {
            "default_model": model.model_id,
            "api_key_configured": bool(current_user.openai_api_key),
            "auto_upgrade": user_settings.is_auto_upgrade,
            "last_checked_for_updates": user_settings.last_checked_at.isoformat() if user_settings.last_checked_at else None,
            "update_available": False,  # Just updated, so no updates available
            "recommended_upgrade": None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating AI config: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update AI configuration"
        )

@router.get("/models", response_model=Dict[str, Dict[str, Any]])
async def list_ai_models(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List all available AI models."""
    try:
        models = db.query(DBAIModel).filter(DBAIModel.is_available == True).all()
        
        # Get user's current model
        user_settings = db.query(UserAIModelSettings).filter(
            UserAIModelSettings.user_id == current_user.id
        ).first()
        
        result = {}
        for model in models:
            result[model.model_id] = {
                "name": model.name,
                "description": model.description,
                "max_tokens": model.max_tokens,
                "available": model.is_available,
                "is_default": user_settings and user_settings.model_id == model.id
            }
            
        return result
        
    except Exception as e:
        logger.error(f"Error listing AI models: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list AI models"
        )
