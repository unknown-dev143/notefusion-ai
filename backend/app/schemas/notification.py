"""Pydantic models for notifications."""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class NotificationBase(BaseModel):
    """Base notification schema."""
    title: str = Field(..., max_length=255)
    message: str
    type: str = Field(..., max_length=50)
    data: Optional[Dict[str, Any]] = None

class NotificationCreate(NotificationBase):
    """Schema for creating a notification."""
    user_id: str
    reminder_id: Optional[int] = None

class NotificationUpdate(BaseModel):
    """Schema for updating a notification."""
    is_read: Optional[bool] = None

class Notification(NotificationBase):
    """Notification schema for responses."""
    id: int
    user_id: str
    is_read: bool = False
    reminder_id: Optional[int] = None
    created_at: datetime
    read_at: Optional[datetime] = None
    updated_at: datetime

    class Config:
        orm_mode = True

class NotificationListResponse(BaseModel):
    """Response schema for listing notifications."""
    data: List[Notification]
    total: int
    page: int
    limit: int
    total_pages: int

class NotificationCounts(BaseModel):
    """Schema for notification counts."""
    total: int
    unread: int
    read: int

class MarkAsReadResponse(BaseModel):
    """Response schema for marking a notification as read."""
    success: bool
    notification: Notification

class MarkAllAsReadResponse(BaseModel):
    """Response schema for marking all notifications as read."""
    success: bool
    count: int

class DeleteNotificationResponse(BaseModel):
    """Response schema for deleting a notification."""
    success: bool
    message: str
