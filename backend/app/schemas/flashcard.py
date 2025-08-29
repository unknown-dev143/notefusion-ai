from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any, ClassVar
from pydantic import BaseModel, Field, validator, root_validator, conint, confloat
import re
import uuid

from .validators import BaseSchema, validate_uuid

class FlashcardBase(BaseSchema):
    """Base schema for Flashcard with common fields and validation.
    
    Attributes:
        note_id: Optional reference to the source note (UUID)
        front_text: The front side text (question/term)
        back_text: The back side text (answer/definition)
        tags: List of tags for organization
    """
    
    # Constants for validation
    MIN_TAG_LENGTH: ClassVar[int] = 2
    MAX_TAG_LENGTH: ClassVar[int] = 30
    MAX_TAGS: ClassVar[int] = 10
    
    note_id: Optional[str] = Field(
        None,
        description="Optional reference to the source note (UUID)",
        example="123e4567-e89b-12d3-a456-426614174000"
    )
    front_text: str = Field(
        ...,
        min_length=1,
        max_length=1000,
        description="The front side text of the flashcard (question/term)",
        example="What is the capital of France?"
    )
    back_text: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="The back side text of the flashcard (answer/definition)",
        example="Paris is the capital of France."
    )
    tags: List[str] = Field(
        default_factory=list,
        description=f"List of tags (max {MAX_TAGS} tags, {MIN_TAG_LENGTH}-{MAX_TAG_LENGTH} chars each)",
        example=["geography", "capitals"]
    )
    
    @validator('note_id')
    def validate_note_id(cls, v):
        if v is not None:
            try:
                validate_uuid(v)
            except ValueError as e:
                raise ValueError("Invalid note_id format. Must be a valid UUID.")
        return v
    
    @validator('tags')
    def validate_tags(cls, v):
        if len(v) > cls.MAX_TAGS:
            raise ValueError(f'Cannot have more than {cls.MAX_TAGS} tags')
        return v
    
    @validator('tags', each_item=True)
    def validate_tag_format(cls, v):
        v = v.strip()
        if not v:
            raise ValueError('Tag cannot be empty')
            
        if len(v) < cls.MIN_TAG_LENGTH:
            raise ValueError(f'Tag must be at least {cls.MIN_TAG_LENGTH} characters long')
            
        if len(v) > cls.MAX_TAG_LENGTH:
            raise ValueError(f'Tag cannot be longer than {cls.MAX_TAG_LENGTH} characters')
            
        if not re.match(r'^[a-zA-Z0-9_\-]+$', v):
            raise ValueError('Tags can only contain letters, numbers, underscores, and hyphens')
            
        return v.lower()

class FlashcardCreate(FlashcardBase):
    """Schema for creating a new flashcard with default spaced repetition settings.
    
    Attributes:
        ease_factor: Ease factor for spaced repetition (130-250, where 250 = 2.5)
        interval: Current interval in days for spaced repetition
        due_date: When the card is next due for review
    """
    DEFAULT_EASE_FACTOR: ClassVar[int] = 250
    MIN_EASE_FACTOR: ClassVar[int] = 130
    MAX_EASE_FACTOR: ClassVar[int] = 250
    
    ease_factor: int = Field(
        default=DEFAULT_EASE_FACTOR,
        ge=MIN_EASE_FACTOR,
        le=MAX_EASE_FACTOR,
        description=f"Ease factor for spaced repetition ({MIN_EASE_FACTOR}-{MAX_EASE_FACTOR}, where {MAX_EASE_FACTOR} = 2.5)",
        example=250
    )
    interval: int = Field(
        default=1,
        ge=1,
        description="Current interval in days for spaced repetition"
    )

# Schema for updating a flashcard
class FlashcardUpdate(BaseModel):
    """Schema for updating an existing flashcard."""
    front_text: Optional[str] = Field(
        None, 
        min_length=1, 
        max_length=1000,
        description="Updated front text"
    )
    back_text: Optional[str] = Field(
        None, 
        min_length=1, 
        max_length=2000,
        description="Updated back text"
    )
    tags: Optional[List[str]] = Field(
        None,
        description="Updated list of tags"
    )
    
    @validator('tags', each_item=True)
    def validate_tag_format(cls, v):
        if not re.match(r'^[a-zA-Z0-9_\-]+$', v):
            raise ValueError('Tags can only contain letters, numbers, underscores, and hyphens')
        if len(v) > 30:
            raise ValueError('Tag cannot be longer than 30 characters')
        return v.lower()

class FlashcardReview(BaseSchema):
    """Schema for recording a flashcard review.
    
    Attributes:
        quality: Rating of how well the card was known (0-5)
    """
    MIN_QUALITY: ClassVar[int] = 0
    MAX_QUALITY: ClassVar[int] = 5
    
    quality: int = Field(
        ...,
        ge=MIN_QUALITY,
        le=MAX_QUALITY,
        description=f"Rating of how well the card was known ({MIN_QUALITY}-{MAX_QUALITY})",
        example=3
    )
    
    @validator('quality')
    def validate_quality(cls, v):
        if not isinstance(v, int) or v < cls.MIN_QUALITY or v > cls.MAX_QUALITY:
            raise ValueError(f'Quality must be an integer between {cls.MIN_QUALITY} and {cls.MAX_QUALITY}')
        return v

class FlashcardResponse(FlashcardBase):
    """Schema for flashcard responses with all fields.
    
    This includes read-only fields that are set by the system.
    """
    id: str = Field(..., description="Unique identifier for the flashcard")
    user_id: str = Field(..., description="ID of the user who owns this flashcard")
    ease_factor: float = Field(..., ge=1.3, le=2.5, description="Current ease factor")
    interval: int = Field(..., ge=1, description="Current interval in days")
    due_date: datetime = Field(..., description="When the card is next due for review")
    last_reviewed: Optional[datetime] = Field(
        None,
        description="When the card was last reviewed"
    )
    review_count: int = Field(
        0,
        ge=0,
        description="Number of times the card has been reviewed"
    )
    created_at: datetime = Field(..., description="When the card was created")
    updated_at: datetime = Field(..., description="When the card was last updated")
    
    class Config(FlashcardBase.Config):
        schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "user_id": "123e4567-e89b-12d3-a456-426614174001",
                "note_id": "123e4567-e89b-12d3-a456-426614174002",
                "front_text": "What is the capital of France?",
                "back_text": "Paris is the capital of France.",
                "tags": ["geography", "capitals"],
                "ease_factor": 2.5,
                "interval": 1,
                "due_date": "2023-01-01T00:00:00",
                "last_reviewed": None,
                "review_count": 0,
                "created_at": "2023-01-01T00:00:00",
                "updated_at": "2023-01-01T00:00:00"
            }
        }
    
    class Config:
        orm_mode = True

class FlashcardStats(BaseSchema):
    """Schema for flashcard statistics.
    
    Attributes:
        total_cards: Total number of flashcards for the user
        due_cards: Number of cards currently due for review
        average_ease: Average ease factor of all cards (1.3-2.5)
        new_cards_per_day: Number of new cards to review per day
        max_reviews_per_day: Maximum number of reviews per day
        retention_rate: Percentage of correct reviews (0-100)
    """
    total_cards: int = Field(..., ge=0, description="Total number of flashcards")
    due_cards: int = Field(..., ge=0, description="Number of cards due for review")
    average_ease: float = Field(..., ge=1.3, le=2.5, description="Average ease factor")
    new_cards_per_day: int = Field(20, ge=1, le=100, description="New cards per day")
    max_reviews_per_day: int = Field(200, ge=10, le=1000, description="Max reviews per day")
    retention_rate: float = Field(
        ..., 
        ge=0, 
        le=100, 
        description="Percentage of correct reviews (0-100)"
    )
    
    class Config(BaseSchema.Config):
        schema_extra = {
            "example": {
                "total_cards": 100,
                "due_cards": 15,
                "average_ease": 2.1,
                "new_cards_per_day": 20,
                "max_reviews_per_day": 200,
                "retention_rate": 85.5
            }
        }
    
    class Config:
        orm_mode = True

class FlashcardBatch(BaseSchema):
    """Schema for creating multiple flashcards at once.
    
    Attributes:
        flashcards: List of flashcards to create
        default_tags: Tags to apply to all flashcards in the batch
    """
    MAX_BATCH_SIZE: ClassVar[int] = 100
    
    flashcards: List[FlashcardCreate] = Field(
        ..., 
        max_items=MAX_BATCH_SIZE,
        description=f"List of up to {MAX_BATCH_SIZE} flashcards to create"
    )
    default_tags: List[str] = Field(
        default_factory=list,
        description="Tags to apply to all flashcards in the batch"
    )
    
    @root_validator
    def validate_batch_size(cls, values):
        if len(values.get('flashcards', [])) > cls.MAX_BATCH_SIZE:
            raise ValueError(f'Cannot create more than {cls.MAX_BATCH_SIZE} flashcards at once')
        return values
    
    @validator('default_tags', each_item=True)
    def validate_default_tags(cls, v):
        return FlashcardBase.validate_tag_format.__func__(cls, v)
    
    class Config:
        schema_extra = {
            "example": {
                "flashcards": [
                    {
                        "front_text": "What is the capital of France?",
                        "back_text": "Paris",
                        "tags": ["geography", "capitals"]
                    },
                    {
                        "front_text": "What is 2+2?",
                        "back_text": "4",
                        "tags": ["math", "arithmetic"]
                    }
                ]
            }
        }
