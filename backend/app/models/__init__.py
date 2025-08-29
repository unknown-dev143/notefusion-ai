"""Database models package"""

# Import Base first to avoid circular imports
from .database import Base

# Import all models to ensure they are registered with SQLAlchemy
# The order matters to avoid circular imports
from .user import User
from .ai_models import DBAIModel, UserAIModelSettings, AIProvider, AIModelStatus
from .task import Task, TaskStatus, TaskType
<<<<<<< HEAD
from .user_task import UserTask, TaskStatus as UserTaskStatus, TaskPriority
=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
from .subscription_models import Subscription, Invoice, SubscriptionTier, SubscriptionStatus
from .subscription import get_subscription_features

# Import remaining database models after all models are defined
from .database import Session, Transcript, Diagram, NotesVersion, PracticeQuestion
<<<<<<< HEAD
from .flashcard import Flashcard
=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e

__all__ = [
    'Base',
    'Session',
<<<<<<< HEAD
    'UserTask',
    'UserTaskStatus',
    'TaskPriority',
    'Transcript',
    'Flashcard',
=======
    'Transcript',
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
    'Diagram',
    'NotesVersion',
    'PracticeQuestion',
    'User',
    'DBAIModel',
    'UserAIModelSettings',
    'AIProvider',
    'AIModelStatus',
    'Task',
    'TaskStatus',
    'TaskType',
    'Subscription',
    'Invoice',
    'SubscriptionTier',
    'SubscriptionStatus',
    'get_subscription_features',
]