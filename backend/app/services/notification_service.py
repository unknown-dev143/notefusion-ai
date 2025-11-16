"""Notification service for handling different types of notifications."""
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone
from enum import Enum
import json

from fastapi import HTTPException
from pydantic import BaseModel, EmailStr
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from firebase_admin import messaging

from app.core.config import settings
from app.models.user import User
from app.models.reminder import Reminder
from app.db.session import SessionLocal

logger = logging.getLogger(__name__)

class NotificationType(str, Enum):
    EMAIL = "email"
    PUSH = "push"
    IN_APP = "in_app"
    SMS = "sms"

class NotificationPriority(str, Enum):
    HIGH = "high"
    NORMAL = "normal"
    LOW = "low"

class NotificationData(BaseModel):
    title: str
    body: str
    data: Optional[Dict[str, Any]] = None
    priority: NotificationPriority = NotificationPriority.NORMAL
    type: NotificationType
    user_id: str
    reminder_id: Optional[int] = None

class NotificationService:
    """Service for managing notifications with WebSocket support."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_notification(
        self,
        user: User,
        title: str,
        message: str,
        notification_type: Union[NotificationType, str],
        data: Optional[Dict[str, Any]] = None,
        send_email: bool = True,
        send_push: bool = True,
        send_ws: bool = True,
        background_tasks: Optional[BackgroundTasks] = None
    ) -> Notification:
        """Create and send a new notification through multiple channels."""
        if isinstance(notification_type, str):
            notification_type = NotificationType(notification_type.lower())
            
        notification_data = NotificationCreate(
            user_id=user.id,
            title=title,
            message=message,
            notification_type=notification_type,
            data=data or {},
            status=NotificationStatus.UNREAD
        )
        
        # Create notification in database
        notification = Notification(**notification_data.dict())
        self.db.add(notification)
        await self.db.commit()
        await self.db.refresh(notification)
        
        # Prepare background tasks for sending notifications
        if background_tasks:
            if send_email and user.email_notifications:
                background_tasks.add_task(self._send_email_notification, user, notification)
                
            if send_push and user.push_notifications and user.fcm_tokens:
                background_tasks.add_task(self._send_push_notification, user, notification)
                
            if send_ws:
                background_tasks.add_task(self._send_ws_notification, user, notification)
        else:
            # Run synchronously if no background tasks provided
            if send_email and user.email_notifications:
                await self._send_email_notification(user, notification)
                
            if send_push and user.push_notifications and user.fcm_tokens:
                await self._send_push_notification(user, notification)
                
            if send_ws:
                await self._send_ws_notification(user, notification)
            
        return notification

    async def send_notification(
        self,
        user: User,
        title: str,
        message: str,
        notification_type: NotificationType,
        data: Optional[Dict[str, Any]] = None,
        priority: NotificationPriority = NotificationPriority.NORMAL,
        reminder: Optional[Reminder] = None,
    ) -> bool:
        """Send a notification to the user."""
        notification = NotificationData(
            title=title,
            body=message,
            data=data or {},
            priority=priority,
            type=notification_type,
            user_id=str(user.id),
            reminder_id=reminder.id if reminder else None,
        )

        try:
            if notification_type == NotificationType.EMAIL:
                return await self._send_email_notification(user, notification)
            elif notification_type == NotificationType.PUSH:
                return await self._send_push_notification(user, notification)
            elif notification_type == NotificationType.IN_APP:
                return await self._send_in_app_notification(user, notification)
            else:
                logger.warning(f"Unsupported notification type: {notification_type}")
                return False
        except Exception as e:
            logger.error(f"Error sending {notification_type} notification: {str(e)}", exc_info=True)
            return False

    async def send_reminder_notification(self, reminder: Reminder) -> bool:
        """Send a notification for a reminder."""
        db = AsyncSession()
        try:
            user = db.query(User).filter(User.id == reminder.user_id).first()
            if not user:
                logger.error(f"User {reminder.user_id} not found for reminder {reminder.id}")
                return False

            title = f"Reminder: {reminder.title}"
            message = reminder.description or "You have a reminder!"
            
            # Add reminder details to the notification data
            data = {
                "reminder_id": str(reminder.id),
                "type": "reminder",
                "due_date": reminder.due_date.isoformat(),
                "status": reminder.status,
            }

            # Send email notification if enabled
            email_sent = True
            if reminder.send_email and user.email:
                email_sent = await self.send_notification(
                    user=user,
                    title=title,
                    message=message,
                    notification_type=NotificationType.EMAIL,
                    data=data,
                    priority=NotificationPriority.HIGH,
                    reminder=reminder,
                )

            # Send push notification if enabled
            push_sent = True
            if reminder.send_push and user.fcm_tokens:
                push_sent = await self.send_notification(
                    user=user,
                    title=title,
                    message=message,
                    notification_type=NotificationType.PUSH,
                    data=data,
                    priority=NotificationPriority.HIGH,
                    reminder=reminder,
                )

            # Always create an in-app notification
            in_app_sent = await self.send_notification(
                user=user,
                title=title,
                message=message,
                notification_type=NotificationType.IN_APP,
                data=data,
                priority=NotificationPriority.HIGH,
                reminder=reminder,
            )

            return email_sent and push_sent and in_app_sent
        except Exception as e:
            logger.error(f"Error sending reminder notification: {str(e)}", exc_info=True)
            return False
        finally:
            db.close()

    async def _send_email_notification(
        self, user: User, notification: NotificationData
    ) -> bool:
        """Send an email notification using SendGrid."""
        if not self.sg:
            logger.warning("SendGrid is not configured")
            return False

        if not user.email:
            logger.warning(f"User {user.id} does not have an email address")
            return False

        message = Mail(
            from_email=settings.EMAIL_FROM,
            to_emails=user.email,
            subject=notification.title,
            html_content=f"""
            <h1>{notification.title}</h1>
            <p>{notification.body}</p>
            <p><small>This is an automated message. Please do not reply to this email.</small></p>
            """,
        )

        try:
            response = await self.sg.send(message)
            if response.status_code >= 200 and response.status_code < 300:
                logger.info(f"Email notification sent to {user.email}")
                return True
            else:
                logger.error(f"Failed to send email: {response.status_code} - {response.body}")
                return False
        except Exception as e:
            logger.error(f"Error sending email: {str(e)}")
            return False

    async def _send_push_notification(
        self, user: User, notification: NotificationData
    ) -> bool:
        """Send a push notification using Firebase Cloud Messaging."""
        if not user.fcm_tokens:
            logger.warning(f"User {user.id} does not have any FCM tokens")
            return False

        # Prepare the message
        message = messaging.MulticastMessage(
            notification=messaging.Notification(
                title=notification.title,
                body=notification.body,
            ),
            data={"data": json.dumps(notification.data)},
            tokens=user.fcm_tokens,
            android=messaging.AndroidConfig(
                priority="high",
                notification=messaging.AndroidNotification(
                    priority="high",
                    sound="default",
                    tag=str(notification.reminder_id) if notification.reminder_id else None,
                ),
            ),
            apns=messaging.APNSConfig(
                headers={
                    "apns-priority": "10",  # High priority for iOS
                    "apns-push-type": "alert",
                },
                payload=messaging.APNSPayload(
                    aps=messaging.Aps(
                        alert=messaging.ApsAlert(
                            title=notification.title,
                            body=notification.body,
                        ),
                        sound="default",
                        badge=1,
                    ),
                ),
            ),
        )

        try:
            response = await messaging.send_multicast(message)
            if response.failure_count > 0:
                logger.warning(
                    f"Failed to send {response.failure_count} push notifications"
                )
                # Remove invalid FCM tokens
                for idx, result in enumerate(response.responses):
                    if not result.exception:
                        continue
                    
                    error = result.exception
                    if isinstance(error, messaging.UnregisteredError):
                        # Token is no longer valid, remove it
                        token = user.fcm_tokens[idx]
                        await self._remove_fcm_token(user.id, token)
            
            success_count = response.success_count
            logger.info(f"Sent {success_count} push notifications to user {user.id}")
            return success_count > 0
        except Exception as e:
            logger.error(f"Error sending push notification: {str(e)}")
            return False

    async def _send_in_app_notification(
        self, user: User, notification: NotificationData
    ) -> bool:
        """Store an in-app notification in the database."""
        from app.models.notification import Notification
        from app.db.session import SessionLocal

        db = SessionLocal()
        try:
            db_notification = Notification(
                user_id=user.id,
                title=notification.title,
                message=notification.body,
                data=notification.data,
                is_read=False,
                reminder_id=notification.reminder_id,
            )
            db.add(db_notification)
            db.commit()
            db.refresh(db_notification)
            logger.info(f"Created in-app notification for user {user.id}")
            return True
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating in-app notification: {str(e)}")
            return False
        finally:
            db.close()

    async def _remove_fcm_token(self, user_id: str, token: str) -> None:
        """Remove an invalid FCM token from the user's profile."""
        from app.db.session import SessionLocal
        
        db = SessionLocal()
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if user and user.fcm_tokens and token in user.fcm_tokens:
                user.fcm_tokens = [t for t in user.fcm_tokens if t != token]
                db.commit()
                logger.info(f"Removed invalid FCM token for user {user_id}")
        except Exception as e:
            logger.error(f"Error removing FCM token: {str(e)}")
            db.rollback()
        finally:
            db.close()

# Create a singleton instance
notification_service = NotificationService()
