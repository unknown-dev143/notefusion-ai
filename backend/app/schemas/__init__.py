"""Pydantic schemas for the application."""

from .ai_models import (
    AIProvider,
    AIModelStatus,
    AIBase,
    AICreate,
    AIUpdate,
    AIInDB,
    UserAIModelSettingsBase,
    UserAIModelSettingsCreate,
    UserAIModelSettingsUpdate,
    UserAIModelSettingsInDB,
)

<<<<<<< HEAD
from .reminder import (
    ReminderBase,
    ReminderCreate,
    ReminderUpdate,
    ReminderInDB,
    ReminderResponse,
    ReminderListResponse,
    ReminderNotification,
)

from .flashcard import (
    FlashcardBase,
    FlashcardCreate,
    FlashcardUpdate,
    FlashcardReview,
    FlashcardResponse,
    FlashcardStats,
    FlashcardBatch,
)

=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
from .subscription import (
    SubscriptionTier,
    SubscriptionStatus,
    SubscriptionBase,
    SubscriptionCreate,
    SubscriptionUpdate,
    SubscriptionInDB,
    InvoiceBase,
    InvoiceCreate,
    InvoiceInDB,
    SubscriptionWithInvoices,
    SubscriptionPlan,
    SubscriptionFeatures,
    SubscriptionStatusResponse,
)

__all__ = [
    # AI Models
    'AIProvider',
    'AIModelStatus',
    'AIBase',
    'AICreate',
    'AIUpdate',
    'AIInDB',
    'UserAIModelSettingsBase',
    'UserAIModelSettingsCreate',
    'UserAIModelSettingsUpdate',
    'UserAIModelSettingsInDB',
    
<<<<<<< HEAD
    # Reminder
    'ReminderBase',
    'ReminderCreate',
    'ReminderUpdate',
    'ReminderInDB',
    'ReminderResponse',
    'ReminderListResponse',
    'ReminderNotification',
    
    # Flashcard
    'FlashcardBase',
    'FlashcardCreate',
    'FlashcardUpdate',
    'FlashcardReview',
    'FlashcardResponse',
    'FlashcardStats',
    'FlashcardBatch',
    
=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
    # Subscriptions
    'SubscriptionTier',
    'SubscriptionStatus',
    'SubscriptionBase',
    'SubscriptionCreate',
    'SubscriptionUpdate',
    'SubscriptionInDB',
    'InvoiceBase',
    'InvoiceCreate',
    'InvoiceInDB',
    'SubscriptionWithInvoices',
    'SubscriptionPlan',
    'SubscriptionFeatures',
    'SubscriptionStatusResponse',
]
