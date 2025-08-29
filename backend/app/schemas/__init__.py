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
