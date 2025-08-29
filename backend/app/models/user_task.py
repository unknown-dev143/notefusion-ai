from datetime import datetime
from enum import Enum
from typing import List, Optional
from sqlalchemy import Column, String, Text, Enum as SQLEnum, JSON, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID, ARRAY
import uuid

from .database import Base

class TaskStatus(str, Enum):
    """Status of a user task."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class TaskPriority(str, Enum):
    """Priority levels for tasks."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class UserTask(Base):
    """Database model for user tasks."""
    __tablename__ = "user_tasks"
    
    # Primary key
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    
    # Task details
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(SQLEnum(TaskStatus), default=TaskStatus.PENDING, nullable=False)
    priority = Column(SQLEnum(TaskPriority), default=TaskPriority.MEDIUM, nullable=False)
    
    # Dates
    due_date = Column(DateTime, nullable=True)
    reminder_enabled = Column(Boolean, default=False, nullable=False)
    reminder_time = Column(DateTime, nullable=True)
    
    # Categorization
    category = Column(String(100), nullable=True)
    tags = Column(ARRAY(String(100)), default=[], nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False, index=True)
    
    def __repr__(self):
        return f"<UserTask {self.title} ({self.status})>"
