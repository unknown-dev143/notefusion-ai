from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime


class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    status: Optional[str] = Field("todo", pattern="^(todo|in-progress|in_progress|done|pending|completed|cancelled)$")
    priority: Optional[str] = Field("medium", pattern="^(low|medium|high)$")
    due_date: Optional[str] = None
    tags: Optional[List[str]] = []
    category: Optional[str] = None
    reminder_enabled: Optional[bool] = False
    reminder_time: Optional[str] = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[str] = None
    tags: Optional[List[str]] = None
    category: Optional[str] = None
    reminder_enabled: Optional[bool] = None
    reminder_time: Optional[str] = None
    completed_at: Optional[datetime] = None


class Task(TaskBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

    # Override tags to handle JSON string stored in DB
    @classmethod
    def model_validate(cls, obj, *args, **kwargs):
        import json
        if hasattr(obj, "tags") and isinstance(obj.tags, str):
            try:
                obj.tags = json.loads(obj.tags)
            except Exception:
                obj.tags = []
        return super().model_validate(obj, *args, **kwargs)
