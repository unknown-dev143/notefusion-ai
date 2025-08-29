"""
Audit logging for security-relevant events.

This module provides functionality to log security events for auditing purposes.
"""
from datetime import datetime
from enum import Enum
from typing import Dict, Any, Optional, List, Union
import json
import logging
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey, Text

from ..db.base import Base
from ..core.config import settings

# Set up logging
logger = logging.getLogger(__name__)

class AuditEventType(str, Enum):
    """Types of audit events."""
    LOGIN_SUCCESS = "login_success"
    LOGIN_FAILURE = "login_failure"
    LOGOUT = "logout"
    PASSWORD_CHANGE = "password_change"
    PASSWORD_RESET = "password_reset"
    USER_CREATE = "user_create"
    USER_UPDATE = "user_update"
    USER_DELETE = "user_delete"
    PERMISSION_CHANGE = "permission_change"
    ROLE_CHANGE = "role_change"
    SETTINGS_UPDATE = "settings_update"
    DATA_ACCESS = "data_access"
    DATA_MODIFY = "data_modify"
    DATA_DELETE = "data_delete"
    API_CALL = "api_call"
    SECURITY_EVENT = "security_event"
    SYSTEM_EVENT = "system_event"
    OTHER = "other"

class AuditLogModel(Base):
    """Database model for audit logs."""
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    event_type = Column(String(50), index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    resource_type = Column(String(100), nullable=True, index=True)
    resource_id = Column(String(100), nullable=True, index=True)
    status = Column(String(20), nullable=True)
    details = Column(JSON, nullable=True)
    metadata_ = Column("metadata", JSON, nullable=True)

class AuditEvent(BaseModel):
    """Audit event model."""
    event_type: AuditEventType
    user_id: Optional[int] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    resource_type: Optional[str] = None
    resource_id: Optional[Union[str, int]] = None
    status: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None

class AuditLogger:
    """Audit logging service."""
    
    def __init__(self, db: Session):
        """Initialize the audit logger.
        
        Args:
            db: SQLAlchemy database session
        """
        self.db = db
    
    def log_event(self, event: AuditEvent) -> AuditLogModel:
        """Log an audit event.
        
        Args:
            event: The audit event to log
            
        Returns:
            AuditLogModel: The created audit log entry
        """
        try:
            log_entry = AuditLogModel(
                event_type=event.event_type.value if hasattr(event.event_type, 'value') else str(event.event_type),
                user_id=event.user_id,
                ip_address=event.ip_address,
                user_agent=event.user_agent,
                resource_type=event.resource_type,
                resource_id=str(event.resource_id) if event.resource_id is not None else None,
                status=event.status,
                details=event.details,
                metadata_=event.metadata
            )
            
            self.db.add(log_entry)
            self.db.commit()
            self.db.refresh(log_entry)
            
            # Also log to application logs
            log_data = {
                "audit_event": {
                    "id": log_entry.id,
                    "event_type": log_entry.event_type,
                    "user_id": log_entry.user_id,
                    "resource": f"{log_entry.resource_type}:{log_entry.resource_id}" 
                               if log_entry.resource_type and log_entry.resource_id else None,
                    "status": log_entry.status,
                    "timestamp": log_entry.timestamp.isoformat()
                }
            }
            
            if event.event_type == AuditEventType.LOGIN_FAILURE:
                logger.warning("Failed login attempt", extra=log_data)
            elif event.event_type in [AuditEventType.USER_CREATE, AuditEventType.USER_UPDATE, AuditEventType.USER_DELETE]:
                logger.info(f"User management event: {event.event_type}", extra=log_data)
            else:
                logger.info(f"Audit event: {event.event_type}", extra=log_data)
            
            return log_entry
            
        except Exception as e:
            logger.error(f"Failed to log audit event: {str(e)}", exc_info=True)
            self.db.rollback()
            raise
    
    def get_events(
        self,
        event_type: Optional[Union[AuditEventType, str]] = None,
        user_id: Optional[int] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[Union[str, int]] = None,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[AuditLogModel]:
        """Query audit events.
        
        Args:
            event_type: Filter by event type
            user_id: Filter by user ID
            resource_type: Filter by resource type
            resource_id: Filter by resource ID
            start_time: Filter events after this time
            end_time: Filter events before this time
            limit: Maximum number of results to return
            offset: Number of results to skip
            
        Returns:
            List[AuditLogModel]: List of matching audit log entries
        """
        query = self.db.query(AuditLogModel)
        
        if event_type:
            event_type_str = event_type.value if hasattr(event_type, 'value') else str(event_type)
            query = query.filter(AuditLogModel.event_type == event_type_str)
            
        if user_id is not None:
            query = query.filter(AuditLogModel.user_id == user_id)
            
        if resource_type:
            query = query.filter(AuditLogModel.resource_type == resource_type)
            
        if resource_id is not None:
            query = query.filter(AuditLogModel.resource_id == str(resource_id))
            
        if start_time:
            query = query.filter(AuditLogModel.timestamp >= start_time)
            
        if end_time:
            query = query.filter(AuditLogModel.timestamp <= end_time)
            
        return query.order_by(AuditLogModel.timestamp.desc()).offset(offset).limit(limit).all()

def get_audit_logger() -> AuditLogger:
    """Get an audit logger instance."""
    from ..db.session import SessionLocal
    db = SessionLocal()
    try:
        return AuditLogger(db)
    except Exception:
        db.close()
        raise
