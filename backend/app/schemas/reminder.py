"""Pydantic models for reminders."""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, validator
from app.models.reminder import ReminderStatus, ReminderType

# Shared properties
class ReminderBase(BaseModel):
    """Base reminder schema with common fields."""
    title: str = Field(..., max_length=255, description="Title of the reminder")
    description: Optional[str] = Field(None, description="Optional description")
    due_date: datetime = Field(..., description="When the reminder should trigger")
    reminder_type: ReminderType = Field(
        default=ReminderType.CUSTOM,
        description="Type of reminder (note, task, deadline, meeting, custom)"
    )
    is_recurring: bool = Field(
        default=False,
        description="Whether the reminder should repeat"
    )
    recurrence_rule: Optional[str] = Field(
        None,
        description="Recurrence rule in iCalendar format (for recurring reminders)"
    )
    notify_via_email: bool = Field(
        default=False,
        description="Send email notification"
    )
    notify_via_push: bool = Field(
        default=True,
        description="Send push notification"
    )
    note_id: Optional[int] = Field(
        None,
        description="ID of the related note (if any)"
    )
    task_id: Optional[int] = Field(
        None,
        description="ID of the related task (if any)"
    )
    
    @validator('recurrence_rule')
    def validate_recurrence_rule(cls, v, values):
        if values.get('is_recurring') and not v:
            raise ValueError("Recurrence rule is required for recurring reminders")
        return v

# Properties to receive on reminder creation
class ReminderCreate(ReminderBase):
    """Schema for creating a new reminder."""
    pass

# Properties to receive on reminder update
class ReminderUpdate(BaseModel):
    """Schema for updating an existing reminder."""
    title: Optional[str] = Field(None, max_length=255, description="Title of the reminder")
    description: Optional[str] = Field(None, description="Optional description")
    due_date: Optional[datetime] = Field(None, description="When the reminder should trigger")
    status: Optional[ReminderStatus] = Field(None, description="Status of the reminder")
    is_recurring: Optional[bool] = Field(None, description="Whether the reminder should repeat")
    recurrence_rule: Optional[str] = Field(
        None,
        description="Recurrence rule in iCalendar format (for recurring reminders)"
    )
    notify_via_email: Optional[bool] = Field(None, description="Send email notification")
    notify_via_push: Optional[bool] = Field(None, description="Send push notification")

# Properties shared by models stored in DB
class ReminderInDBBase(ReminderBase):
    """Base schema for reminder in database."""
    id: int
    user_id: int
    status: ReminderStatus
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True

# Properties to return to client
class ReminderResponse(ReminderInDBBase):
    """Schema for returning a reminder to the client."""
    is_overdue: bool

# Properties stored in DB
class ReminderInDB(ReminderInDBBase):
    """Schema for reminder in database."""
    pass

# Response models
class ReminderListResponse(BaseModel):
    """Schema for paginated list of reminders."""
    items: List[ReminderResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

# Webhook payload for reminder notifications
class ReminderNotification(BaseModel):
    """Schema for reminder notification webhook payload."""
    reminder_id: int
    user_id: int
    title: str
    description: Optional[str]
    due_date: datetime
    is_overdue: bool
    notification_type: str = "reminder"
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
