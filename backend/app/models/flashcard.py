from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy import (
    Column, String, Text, DateTime, Integer, 
    ForeignKey, JSON, CheckConstraint, Index
)
from sqlalchemy.orm import relationship, validates
from sqlalchemy.sql import func
from .database import Base
import uuid
from pydantic import constr

class Flashcard(Base):
    """Flashcard model for storing study flashcards with spaced repetition support."""
    __tablename__ = "flashcards"
    
    # Primary key and foreign keys
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(
        String(36), 
        ForeignKey("users.id", ondelete="CASCADE"), 
        nullable=False,
        index=True
    )
    note_id = Column(
        String(36), 
        ForeignKey("notes.id", ondelete="SET NULL"), 
        nullable=True,
        index=True
    )
    
    # Content with length constraints
    front_text = Column(Text, nullable=False)
    back_text = Column(Text, nullable=False)
    
    # Add indexes for common query patterns
    __table_args__ = (
        Index('ix_flashcards_due_date', 'due_date'),
        Index('ix_flashcards_user_front', 'user_id', 'front_text', unique=True),
        CheckConstraint('LENGTH(front_text) <= 2000', name='ck_flashcards_front_text_length'),
        CheckConstraint('LENGTH(back_text) <= 10000', name='ck_flashcards_back_text_length'),
        CheckConstraint('ease_factor BETWEEN 130 AND 250', name='ck_flashcards_ease_factor_range'),
        CheckConstraint('review_count >= 0', name='ck_flashcards_review_count_non_negative')
    )
    
    # Spaced repetition fields with validation
    ease_factor = Column(
        Integer, 
        default=250, 
        nullable=False,
        doc="""Ease factor (130-250) where 250 = 2.5 (stored as integer to avoid floating point)
        Higher values increase the interval more quickly."""
    )
    interval = Column(
        Integer, 
        default=1, 
        nullable=False,
        doc="Interval in days until next review"
    )
    due_date = Column(
        DateTime, 
        nullable=False, 
        default=datetime.utcnow,
        index=True,
        doc="Next scheduled review date"
    )
    last_reviewed = Column(
        DateTime, 
        nullable=True,
        doc="Timestamp of last review"
    )
    review_count = Column(
        Integer, 
        default=0, 
        nullable=False,
        doc="Total number of times this card has been reviewed"
    )
    
    # Metadata
    tags = Column(
        JSON, 
        default=list,
        doc="List of tags for organization and filtering"
    )
    created_at = Column(
        DateTime, 
        default=datetime.utcnow, 
        nullable=False,
        index=True,
        doc="Timestamp when the card was created"
    )
    
    # Relationships
    user = relationship("User", back_populates="flashcards")
    note = relationship("Note", back_populates="flashcards")
    
    @validates('ease_factor')
    def validate_ease_factor(self, key, ease_factor):
        if not (130 <= ease_factor <= 250):
            raise ValueError("Ease factor must be between 130 and 250")
        return ease_factor
        
    @validates('front_text', 'back_text')
    def validate_text_length(self, key, value):
        max_length = 2000 if key == 'front_text' else 10000
        if len(value) > max_length:
            raise ValueError(f"{key} exceeds maximum length of {max_length} characters")
        return value.strip()
    
    def __repr__(self):
        return f"<Flashcard(id='{self.id}', front='{self.front_text[:50]}...')>"
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="flashcards")
    note = relationship("Note", back_populates="flashcards")
    
    def update_spaced_repetition(self, quality: int):
        """Update the flashcard's spaced repetition parameters based on review quality.
        
        Args:
            quality: 0-5 rating of how well the user knew the answer
                    0: Complete blackout
                    3: Correct response after some thought
                    5: Perfect response, immediate recall
        """
        if quality < 0 or quality > 5:
            raise ValueError("Quality must be between 0 and 5")
            
        # Convert ease factor to decimal for calculations
        ef = self.ease_factor / 100
        
        if quality >= 3:
            # Correct response
            if self.review_count == 0:
                self.interval = 1
            elif self.review_count == 1:
                self.interval = 6
            else:
                self.interval = int(round(self.interval * ef))
                
            # Update ease factor (bounded between 1.3 and 2.5)
            ef = max(1.3, min(ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)), 2.5))
        else:
            # Incorrect response - reset interval but keep ease factor
            self.interval = 1
            
        # Update fields
        self.ease_factor = int(ef * 100)  # Store as integer (2.5 -> 250)
        self.review_count += 1
        self.last_reviewed = datetime.utcnow()
        self.due_date = datetime.utcnow() + timedelta(days=self.interval)
        
    def to_dict(self) -> Dict[str, Any]:
        """Convert flashcard to dictionary for JSON serialization."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "note_id": self.note_id,
            "front_text": self.front_text,
            "back_text": self.back_text,
            "ease_factor": self.ease_factor / 100,  # Convert back to decimal
            "interval": self.interval,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "last_reviewed": self.last_reviewed.isoformat() if self.last_reviewed else None,
            "review_count": self.review_count,
            "tags": self.tags,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }
