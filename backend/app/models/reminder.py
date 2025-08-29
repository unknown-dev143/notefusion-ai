"""Reminder model for notes and tasks."""
from datetime import datetime
from enum import Enum
from typing import Optional

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Enum as SQLEnum, Text, Boolean
from sqlalchemy.orm import relationship

from app.models.database import Base


class ReminderStatus(str, Enum):
    """Status of a reminder."""
    PENDING = "pending"
    COMPLETED = "completed"
    DISMISSED = "dismissed"
    EXPIRED = "expired"


class ReminderType(str, Enum):
    """Type of reminder."""
    NOTE = "note"
    TASK = "task"
    DEADLINE = "deadline"
    MEETING = "meeting"
    CUSTOM = "custom"


class Reminder(Base):
    """Reminder model for notes and tasks."""
    __tablename__ = "reminders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    note_id = Column(Integer, ForeignKey("notes.id", ondelete="CASCADE"), nullable=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=True)
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    due_date = Column(DateTime(timezone=True), nullable=False)
    reminder_type = Column(SQLEnum(ReminderType), default=ReminderType.CUSTOM, nullable=False)
    status = Column(SQLEnum(ReminderStatus), default=ReminderStatus.PENDING, nullable=False)
    
    # Recurrence fields
    is_recurring = Column(Boolean, default=False, nullable=False)
    recurrence_rule = Column(String(100), nullable=True)  # e.g., "RRULE:FREQ=DAILY;INTERVAL=1"
    
    # Notification settings
    notify_via_email = Column(Boolean, default=False, nullable=False)
    notify_via_push = Column(Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="reminders")
    note = relationship("Note", back_populates="reminders")
    task = relationship("Task", back_populates="reminders")
    
    def __repr__(self) -> str:
        return f"<Reminder {self.id} - {self.title}>"
    
    @property
    def is_overdue(self) -> bool:
        """Check if the reminder is overdue."""
        return self.status == ReminderStatus.PENDING and self.due_date < datetime.utcnow()
    
    def to_dict(self) -> dict:
        """Convert reminder to dictionary."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "note_id": self.note_id,
            "task_id": self.task_id,
            "title": self.title,
            "description": self.description,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "reminder_type": self.reminder_type.value,
            "status": self.status.value,
            "is_recurring": self.is_recurring,
            "recurrence_rule": self.recurrence_rule,
            "notify_via_email": self.notify_via_email,
            "notify_via_push": self.notify_via_push,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "is_overdue": self.is_overdue,
        }
