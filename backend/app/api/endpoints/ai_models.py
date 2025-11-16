from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from sqlalchemy.orm import Session
from ...database.database import get_db
from ...models.ai_models import DBAIModel, AIProvider, UserAIModelSettings
from ...schemas.ai_models import AIModel as SchemaAIModel, UserAIModelSettings as SchemaUserAIModelSettings
from ...services.model_update_service import ModelUpdateService
from ...core.security import get_current_active_user
from ...models.user import User

router = APIRouter()

@router.get("/models", response_model=List[SchemaAIModel])
async def list_models(
    provider: Optional[AIProvider] = None,
    available: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """List all available AI models with optional filtering."""
    query = db.query(DBAIModel)
    
    if provider is not None:
        query = query.filter(DBAIModel.provider == provider)
    if available is not None:
        query = query.filter(DBAIModel.is_available == available)
        
    return query.order_by(DBAIModel.created_at.desc()).all()

@router.get("/models/check-updates", status_code=status.HTTP_202_ACCEPTED)
async def check_for_updates(
    force: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Check for model updates."""
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can check for updates"
        )
        
    service = ModelUpdateService(db)
    updated = await service.check_for_updates(force=force)
    
    return {"status": "success" if updated else "no_updates"}

@router.get("/user/settings/model", response_model=SchemaUserAIModelSettings)
async def get_user_model_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get the current user's AI model settings."""
    settings = db.query(UserAIModelSettings).filter(
        UserAIModelSettings.user_id == current_user.id
    ).first()
    
    if not settings:
        # Create default settings if none exist
        default_model = db.query(DBAIModel).filter(
            DBAIModel.provider == AIProvider.OPENAI,
            DBAIModel.is_available == True
        ).order_by(DBAIModel.created_at.desc()).first()
        
        if not default_model:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No available AI models found"
            )
            
        settings = UserAIModelSettings(
            user_id=current_user.id,
            model_id=default_model.id,
            is_auto_upgrade=True
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
        
    return settings

@router.patch("/user/settings/model", response_model=SchemaUserAIModelSettings)
async def update_user_model_settings(
    settings_update: SchemaUserAIModelSettings,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update the current user's AI model settings."""
    settings = db.query(UserAIModelSettings).filter(
        UserAIModelSettings.user_id == current_user.id
    ).first()
    
    if not settings:
        settings = UserAIModelSettings(user_id=current_user.id)
        db.add(settings)
    
    # Update auto-upgrade setting
    if settings_update.is_auto_upgrade is not None:
        settings.is_auto_upgrade = settings_update.is_auto_upgrade
    
    # Update model if specified and available
    if settings_update.model_id is not None:
        model = db.query(DBAIModel).filter(
            DBAIModel.id == settings_update.model_id,
            DBAIModel.is_available == True
        ).first()
        
        if not model:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Specified model is not available"
            )
            
        settings.model_id = model.id
        settings.last_upgraded_at = db.func.now()
    
    db.commit()
    db.refresh(settings)
    return settings
