"""API endpoints for notifications."""
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.session import get_db
from app.models.notification import Notification
from app.models.user import User
from app.api.deps import get_current_user
from app.schemas.notification import (
    Notification as NotificationSchema,
    NotificationListResponse,
    NotificationCounts,
    MarkAsReadResponse,
    MarkAllAsReadResponse,
    DeleteNotificationResponse,
)

router = APIRouter()

@router.get("/", response_model=NotificationListResponse)
async def list_notifications(
    skip: int = 0,
    limit: int = 10,
    is_read: Optional[bool] = None,
    type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all notifications for the current user."""
    query = db.query(Notification).filter(Notification.user_id == current_user.id)
    
    if is_read is not None:
        query = query.filter(Notification.is_read == is_read)
        
    if type:
        query = query.filter(Notification.type == type)
        
    total = query.count()
    notifications = query.offset(skip).limit(limit).all()
    
    return {
        "data": notifications,
        "total": total,
        "page": skip // limit + 1,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit if limit > 0 else 1,
    }

@router.get("/counts", response_model=NotificationCounts)
async def get_notification_counts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get notification counts for the current user."""
    total = db.query(Notification).filter(Notification.user_id == current_user.id).count()
    unread = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).count()
    
    return {
        "total": total,
        "unread": unread,
        "read": total - unread,
    }

@router.post("/{notification_id}/read", response_model=MarkAsReadResponse)
async def mark_as_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mark a notification as read."""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    if not notification.is_read:
        notification.is_read = True
        notification.read_at = datetime.utcnow()
        db.commit()
        db.refresh(notification)
    
    return {"success": True, "notification": notification}

@router.post("/read-all", response_model=MarkAllAsReadResponse)
async def mark_all_as_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mark all notifications as read for the current user."""
    result = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({
        "is_read": True,
        "read_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    })
    
    db.commit()
    
    return {"success": True, "count": result}

@router.delete("/{notification_id}", response_model=DeleteNotificationResponse)
async def delete_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a notification."""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    db.delete(notification)
    db.commit()
    
    return {"success": True, "message": "Notification deleted successfully"}

@router.delete("/", response_model=DeleteNotificationResponse)
async def delete_all_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete all notifications for the current user."""
    db.query(Notification).filter(Notification.user_id == current_user.id).delete()
    db.commit()
    
    return {"success": True, "message": "All notifications deleted successfully"}

@router.post("/subscribe")
async def subscribe_to_push_notifications(
    subscription: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Subscribe to push notifications."""
    # TODO: Implement push notification subscription
    # This would typically store the subscription details in the database
    # and register the device with a push notification service
    
    return {"success": True, "message": "Subscribed to push notifications"}

@router.post("/unsubscribe")
async def unsubscribe_from_push_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Unsubscribe from push notifications."""
    # TODO: Implement push notification unsubscription
    # This would typically remove the subscription details from the database
    # and unregister the device from the push notification service
    
    return {"success": True, "message": "Unsubscribed from push notifications"}
