"""
AI Settings API endpoints for managing AI model configurations.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import datetime
import logging

from ...database.database import get_db
from ...models.ai_models import DBAIModel, UserAIModelSettings, AIProvider
from ...schemas.ai_models import (
    AIModel as SchemaAIModel,
    UserAIModelSettings as SchemaUserAIModelSettings,
    UserAIModelSettingsUpdate
)
from ...core.security import get_current_active_user
from ...models.user import User
from ...services.model_update_service import ModelUpdateService

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/ai/settings", response_model=dict)
async def get_ai_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get the current user's AI settings including available models and current configuration.
    """
    try:
        # Get all available models
        models = db.query(DBAIModel).filter(
            DBAIModel.is_available == True
        ).order_by(DBAIModel.created_at.desc()).all()
        
        if not models:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No available AI models found"
            )
        
        # Get or create user settings
        settings = db.query(UserAIModelSettings).filter(
            UserAIModelSettings.user_id == current_user.id
        ).first()
        
        if not settings:
            # Create default settings with the first available model
            default_model = models[0]
            settings = UserAIModelSettings(
                user_id=current_user.id,
                model_id=default_model.id,
                is_auto_upgrade=True
            )
            db.add(settings)
            db.commit()
            db.refresh(settings)
        
        # Check for updates
        update_service = ModelUpdateService(db)
        update_available = False
        recommended_upgrade = None
        
        if settings.is_auto_upgrade:
            # Check if there's a newer model available
            current_model = next((m for m in models if m.id == settings.model_id), None)
            if current_model:
                recommended = update_service.get_recommended_upgrade(current_model)
                if recommended and recommended.id != current_model.id:
                    update_available = True
                    recommended_upgrade = recommended
        
        return {
            "models": models,
            "settings": settings,
            "update_available": update_available,
            "recommended_upgrade": recommended_upgrade,
            "last_checked": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting AI settings: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get AI settings"
        )

@router.patch("/ai/settings", response_model=SchemaUserAIModelSettings)
async def update_ai_settings(
    settings_update: UserAIModelSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update the current user's AI settings.
    """
    try:
        # Get existing settings
        settings = db.query(UserAIModelSettings).filter(
            UserAIModelSettings.user_id == current_user.id
        ).first()
        
        if not settings:
            # Create new settings if they don't exist
            settings = UserAIModelSettings(user_id=current_user.id)
            db.add(settings)
        
        # Update model if specified
        if settings_update.model_id is not None:
            # Verify the model exists and is available
            model = db.query(DBAIModel).filter(
                DBAIModel.id == settings_update.model_id,
                DBAIModel.is_available == True
            ).first()
            
            if not model:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Specified model is not available"
                )
            
            settings.model_id = settings_update.model_id
            settings.last_upgraded_at = datetime.utcnow()
        
        # Update auto-upgrade setting if specified
        if settings_update.is_auto_upgrade is not None:
            settings.is_auto_upgrade = settings_update.is_auto_upgrade
        
        db.commit()
        db.refresh(settings)
        
        return settings
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating AI settings: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update AI settings"
        )

@router.post("/ai/models/check-updates", status_code=status.HTTP_202_ACCEPTED)
async def check_ai_model_updates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Check for AI model updates.
    Returns 202 Accepted - the check is performed asynchronously.
    """
    try:
        # This will trigger the background update check
        update_service = ModelUpdateService(db)
        await update_service.check_for_updates(force=True)
        
        return {"status": "update_check_started"}
        
    except Exception as e:
        logger.error(f"Error checking for model updates: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to check for model updates"
        )
