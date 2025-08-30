from enum import Enum
from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy import Column, String, Text, Enum as SQLEnum, JSON, DateTime, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
import uuid

from .database_clean import Base

# Import the TaskStatus and TaskType enums
class TaskStatus(str, Enum):
    """Status of an asynchronous task."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class TaskType(str, Enum):
    """Type of an asynchronous task."""
    VIDEO_GENERATION = "video_generation"
    AUDIO_PROCESSING = "audio_processing"
    DOCUMENT_PROCESSING = "document_processing"
    AI_TRAINING = "ai_training"

class Task(Base):
    """Database model for tracking asynchronous tasks."""
    __tablename__ = "tasks"
    __table_args__ = (
        Index('idx_tasks_user_id', 'user_id'),
        Index('idx_tasks_status', 'status'),
        Index('idx_tasks_created_at', 'created_at'),
        {'comment': 'Tracks asynchronous tasks in the system'}
    )

    # Primary key
    id: str = Column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid.uuid4,
        comment='Primary key'
    )
    
    # Task identification
    task_id: str = Column(
        String(255), 
        unique=True, 
        index=True, 
        nullable=False,
        comment='Unique task identifier'
    )
    
    # User and task metadata
    user_id: str = Column(
        String(255), 
        index=True, 
        nullable=False,
        comment='ID of the user who initiated the task'
    )
    
    task_type: TaskType = Column(
        SQLEnum(TaskType), 
        nullable=False,
        comment='Type of the task'
    )
    
    status: TaskStatus = Column(
        SQLEnum(TaskStatus), 
        default=TaskStatus.PENDING, 
        nullable=False,
        index=True,
        comment='Current status of the task'
    )
    
    # Task data
    input_data: Optional[Dict[str, Any]] = Column(
        JSON, 
        nullable=True,
        comment='Input data for the task'
    )
    
    result_data: Optional[Dict[str, Any]] = Column(
        JSON, 
        nullable=True,
        comment='Output/result data from the task'
    )
    
    error_message: Optional[str] = Column(
        Text, 
        nullable=True,
        comment='Error message if the task failed'
    )
    
    # Timestamps
    created_at: datetime = Column(
        DateTime, 
        default=datetime.utcnow, 
        nullable=False,
        comment='When the task was created'
    )
    
    updated_at: datetime = Column(
        DateTime, 
        default=datetime.utcnow, 
        onupdate=datetime.utcnow, 
        nullable=False,
        comment='When the task was last updated'
    )
    
    completed_at: Optional[datetime] = Column(
        DateTime, 
        nullable=True,
        comment='When the task was completed (or failed)'
    )

    def to_dict(self) -> Dict[str, Any]:
        """Convert task to dictionary."""
        return {
            "task_id": self.task_id,
            "user_id": self.user_id,
            "task_type": self.task_type.value if hasattr(self.task_type, 'value') else str(self.task_type),
            "status": self.status.value if hasattr(self.status, 'value') else str(self.status),
            "input_data": self.input_data,
            "result_data": self.result_data,
            "error_message": self.error_message,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
        }
