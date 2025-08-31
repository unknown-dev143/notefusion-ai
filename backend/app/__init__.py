"""NoteFusion AI Backend Package."""

# Import models to ensure they are registered with SQLAlchemy
from .models import (
    Base, SessionLocal, engine, async_session_factory, metadata,
    User, Task, Subscription, Invoice, DBAIModel, UserAIModelSettings, Flashcard,
    get_db
)

# Import schemas
from .schemas import ai_models as ai_models_schemas, video, subscription as subscription_schemas

# Import services
from .services import model_update_service, video as video_service, subscription as subscription_service

# Import utils
from .utils import subscription as subscription_utils

# Make these available when importing from app
__all__ = [
    'Base', 'SessionLocal', 'engine', 'async_session_factory', 'metadata',
    'User', 'Task', 'Subscription', 'Invoice', 'DBAIModel', 'UserAIModelSettings', 'Flashcard',
    'get_db',
    'ai_models_schemas',
    'video',
    'subscription_schemas',
    'model_update_service',
    'video_service',
    'subscription_service',
    'subscription_utils',
]