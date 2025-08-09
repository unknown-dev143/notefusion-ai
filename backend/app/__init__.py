"""NoteFusion AI Backend Package."""

# Import models to ensure they are registered with SQLAlchemy
from .models import database, user, ai_models, task

# Import schemas
from .schemas import ai_models as ai_models_schemas, video

# Import services
from .services import model_update_service, video as video_service

# Make these available when importing from app
__all__ = [
    'database',
    'user',
    'ai_models',
    'task',
    'ai_models_schemas',
    'video',
    'model_update_service',
    'video_service',
]