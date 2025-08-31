import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, Optional
import openai
from openai import OpenAI
from ..config.ai_models import AIModel, MODEL_CONFIGS, get_available_models
from ..models.database_clean import get_db
from ..models.ai_models import AIProvider, DBAIModel
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

class ModelUpdateService:
    def __init__(self, db: Session):
        self.db = db
        self.last_checked: Optional[datetime] = None
        self.client = OpenAI()
        
    async def check_for_updates(self, force: bool = False) -> bool:
        """
        Check for new model versions from the provider.
        
        Args:
            force: If True, force a check even if it was done recently
            
        Returns:
            bool: True if updates were found, False otherwise
        """
        try:
            # Only check once per hour unless forced
            if not force and self.last_checked and \
               (datetime.utcnow() - self.last_checked) < timedelta(hours=1):
                logger.info("Skipping model update check - too soon since last check")
                return False
                
            logger.info("Checking for AI model updates...")
            
            # Get available models from the provider
            try:
                models = self.client.models.list()
                model_ids = {model.id for model in models.data}
                logger.debug(f"Found {len(model_ids)} models from provider")
            except Exception as e:
                logger.error(f"Failed to fetch models from provider: {e}")
                return False
                
            # Check for new or updated models
            updated = False
            db_models = self.db.query(DBAIModel).all()
            known_model_ids = {m.model_id: m for m in db_models}
            
            # Update existing models
            for db_model in db_models:
                is_available = db_model.model_id in model_ids
                if db_model.is_available != is_available:
                    logger.info(f"Model {db_model.model_id} availability changed to {is_available}")
                    db_model.is_available = is_available
                    db_model.updated_at = datetime.utcnow()
                    updated = True
            
            # Add new models that aren't in our database yet
            for model_id in model_ids:
                if model_id not in known_model_ids:
                    logger.info(f"Found new model: {model_id}")
                    # Extract provider from model ID (e.g., 'gpt-4' -> 'openai')
                    provider = 'openai'  # Default provider
                    if 'claude' in model_id.lower():
                        provider = 'anthropic'
                    elif 'command' in model_id.lower() or 'cohere' in model_id.lower():
                        provider = 'cohere'
                    
                    new_model = DBAIModel(
                        name=model_id,  # Use model_id as name by default
                        model_id=model_id,
                        provider=provider,
                        is_available=True,
                        status='active' if 'beta' not in model_id.lower() else 'beta',
                        description=f"Automatically discovered {provider} model"
                    )
                    self.db.add(new_model)
                    updated = True
            
            if updated:
                self.db.commit()
                logger.info("Model database updated with latest information")
            else:
                logger.info("No model updates found")
                
            self.last_checked = datetime.utcnow()
            return updated
            
        except Exception as e:
            logger.error(f"Error in check_for_updates: {e}")
            self.db.rollback()
            return False
            
    def get_recommended_upgrade(self, current_model: DBAIModel) -> Optional[DBAIModel]:
        """
        Get a recommended upgrade for the current model.
        
        Args:
            current_model: The current model to find an upgrade for
            
        Returns:
            Optional[DBAIModel]: The recommended upgrade model, or None if no upgrade is available
        """
        if not current_model:
            return None
            
        try:
            # Get all available models from the same provider, ordered by capability
            models = self.db.query(DBAIModel).filter(
                DBAIModel.provider == current_model.provider,
                DBAIModel.is_available == True,
                DBAIModel.status.in_(['active', 'beta'])
            ).order_by(DBAIModel.max_tokens.desc()).all()
            
            if not models:
                return None
                
            # Find the current model in the list
            current_idx = -1
            for i, model in enumerate(models):
                if model.id == current_model.id:
                    current_idx = i
                    break
                    
            # If current model is not in the list or is the most capable, no upgrade
            if current_idx <= 0:
                return None
                
            # Recommend the next most capable model
            return models[current_idx - 1]
            
        except Exception as e:
            logger.error(f"Error in get_recommended_upgrade: {e}")
            return None

# Background task to periodically check for updates
async def start_model_update_task():
    """
    Background task that periodically checks for model updates.
    """
    from ..main import app
    from ..models.database import SessionLocal
    
    logger.info("Starting model update background task")
    
    while True:
        db = None
        try:
            db = SessionLocal()
            service = ModelUpdateService(db)
            await service.check_for_updates()
        except Exception as e:
            logger.error(f"Error in model update task: {e}")
        finally:
            if db:
                db.close()
        
        # Check every 6 hours, or more frequently in development
        check_interval = 6 * 60 * 60  # 6 hours
        if app and hasattr(app, 'debug') and app.debug:
            check_interval = 3600  # 1 hour in debug mode
            
        logger.debug(f"Next model update check in {check_interval//3600} hours")
        await asyncio.sleep(check_interval)
