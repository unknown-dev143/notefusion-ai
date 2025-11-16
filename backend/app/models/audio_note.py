"""
Database model for audio notes.
"""
from datetime import datetime
from typing import Optional, List
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship

from app.core.database import Base

class AudioNote(Base):
    """Database model for storing audio notes."""
    __tablename__ = "audio_notes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer)  # Size in bytes
    duration = Column(Float)  # Duration in seconds
    transcription = Column(String, nullable=True)
    
    # User who created the note
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user = relationship("User", back_populates="audio_notes")
    
    # Additional metadata
    tags = Column(JSON, default=list)  # List of tags
    language = Column(String, default="en")
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<AudioNote(id={self.id}, title='{self.title}')>"
    
    def to_dict(self):
        """Convert the model to a dictionary."""
        return {
            "id": self.id,
            "title": self.title,
            "file_path": self.file_path,
            "file_size": self.file_size,
            "duration": self.duration,
            "transcription": self.transcription,
            "user_id": self.user_id,
            "tags": self.tags,
            "language": self.language,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "audio_url": f"/api/audio/notes/{self.id}/file" if self.file_path else None
        }
