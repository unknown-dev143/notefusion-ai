"""Notification model for storing in-app notifications."""
from datetime import datetime
from typing import Optional, Dict, Any

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.base_class import Base

class Notification(Base):
    """Notification model for storing in-app notifications."""
    __tablename__ = 'notifications'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    data = Column(JSON, nullable=True)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    read_at = Column(DateTime(timezone=True), nullable=True)
    reminder_id = Column(Integer, ForeignKey('reminders.id', ondelete='CASCADE'), nullable=True)

    # Relationships
    user = relationship('User', back_populates='notifications')
    reminder = relationship('Reminder', back_populates='notifications')

    def __repr__(self) -> str:
        return f"<Notification {self.id} - {self.title}>"
    
    def mark_as_read(self) -> None:
        """Mark the notification as read."""
        self.is_read = True
        self.read_at = datetime.utcnow()

    def to_dict(self) -> Dict[str, Any]:
        """Convert the notification to a dictionary."""
        return {
            'id': self.id,
            'title': self.title,
            'message': self.message,
            'data': self.data or {},
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'read_at': self.read_at.isoformat() if self.read_at else None,
            'reminder_id': self.reminder_id,
        }
