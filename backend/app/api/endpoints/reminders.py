"""
Reminders API endpoints.

This module provides API endpoints for managing reminders and deadlines for notes and tasks.
"""
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app import models, schemas
from app.api.deps import get_db, get_current_user
from app.core.security import get_current_active_user
from app.models.reminder import Reminder, ReminderStatus, ReminderType
from app.schemas.reminder import (
    ReminderCreate,
    ReminderUpdate,
    ReminderResponse,
    ReminderListResponse,
)

router = APIRouter()

# Helper functions
def get_reminder_or_404(
    db: Session, reminder_id: int, user_id: int
) -> models.Reminder:
    """Get a reminder by ID or raise 404 if not found or not owned by user."""
    reminder = (
        db.query(models.Reminder)
        .filter(
            models.Reminder.id == reminder_id,
            models.Reminder.user_id == user_id,
        )
        .first()
    )
    if not reminder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reminder not found",
        )
    return reminder

# CRUD Endpoints

@router.post(
    "/",
    response_model=ReminderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new reminder",
)
async def create_reminder(
    reminder_in: ReminderCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
) -> models.Reminder:
    """
    Create a new reminder for a note or task.
    
    - **title**: Title of the reminder (required)
    - **description**: Optional description
    - **due_date**: When the reminder should trigger (required)
    - **reminder_type**: Type of reminder (note, task, deadline, meeting, custom)
    - **is_recurring**: Whether the reminder should repeat
    - **recurrence_rule**: Recurrence rule in iCalendar format (for recurring reminders)
    - **notify_via_email**: Send email notification
    - **notify_via_push**: Send push notification
    - **note_id**: ID of the related note (optional)
    - **task_id**: ID of the related task (optional)
    """
    # Validate that either note_id or task_id is provided
    if not reminder_in.note_id and not reminder_in.task_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either note_id or task_id must be provided",
        )
    
    # Check if the note or task exists and is owned by the user
    if reminder_in.note_id:
        note = (
            db.query(models.Note)
            .filter(
                models.Note.id == reminder_in.note_id,
                models.Note.user_id == current_user.id,
            )
            .first()
        )
        if not note:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Note not found",
            )
    
    if reminder_in.task_id:
        task = (
            db.query(models.Task)
            .filter(
                models.Task.id == reminder_in.task_id,
                models.Task.user_id == current_user.id,
            )
            .first()
        )
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found",
            )
    
    # Create the reminder
    reminder = models.Reminder(
        user_id=current_user.id,
        **reminder_in.dict(exclude_unset=True),
    )
    
    db.add(reminder)
    db.commit()
    db.refresh(reminder)
    
    # TODO: Schedule the reminder with Celery
    
    return reminder

@router.get(
    "/",
    response_model=ReminderListResponse,
    summary="List all reminders",
)
async def list_reminders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
    status: Optional[ReminderStatus] = None,
    reminder_type: Optional[ReminderType] = None,
    due_after: Optional[datetime] = None,
    due_before: Optional[datetime] = None,
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
) -> dict:
    """
    List all reminders for the current user with optional filtering.
    
    - **status**: Filter by status (pending, completed, dismissed, expired)
    - **reminder_type**: Filter by type (note, task, deadline, meeting, custom)
    - **due_after**: Filter reminders due after this datetime
    - **due_before**: Filter reminders due before this datetime
    - **page**: Page number (1-based)
    - **page_size**: Number of items per page (max 100)
    """
    query = db.query(models.Reminder).filter(
        models.Reminder.user_id == current_user.id
    )
    
    # Apply filters
    if status:
        query = query.filter(models.Reminder.status == status)
    if reminder_type:
        query = query.filter(models.Reminder.reminder_type == reminder_type)
    if due_after:
        query = query.filter(models.Reminder.due_date >= due_after)
    if due_before:
        query = query.filter(models.Reminder.due_date <= due_before)
    
    # Pagination
    total = query.count()
    items = (
        query.order_by(models.Reminder.due_date.asc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }

@router.get(
    "/upcoming",
    response_model=List[ReminderResponse],
    summary="Get upcoming reminders",
)
async def get_upcoming_reminders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
    hours_ahead: int = Query(24, ge=1, le=168, description="Hours to look ahead"),
) -> List[models.Reminder]:
    """
    Get reminders that are due within the next X hours.
    
    - **hours_ahead**: Number of hours to look ahead (1-168, default: 24)
    """
    now = datetime.utcnow()
    end_time = now + timedelta(hours=hours_ahead)
    
    return (
        db.query(models.Reminder)
        .filter(
            models.Reminder.user_id == current_user.id,
            models.Reminder.status == ReminderStatus.PENDING,
            models.Reminder.due_date >= now,
            models.Reminder.due_date <= end_time,
        )
        .order_by(models.Reminder.due_date.asc())
        .all()
    )

@router.get(
    "/{reminder_id}",
    response_model=ReminderResponse,
    summary="Get a reminder by ID",
)
async def get_reminder(
    reminder_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
) -> models.Reminder:
    """
    Get a specific reminder by ID.
    """
    return get_reminder_or_404(db, reminder_id, current_user.id)

@router.put(
    "/{reminder_id}",
    response_model=ReminderResponse,
    summary="Update a reminder",
)
async def update_reminder(
    reminder_id: int,
    reminder_in: ReminderUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
) -> models.Reminder:
    """
    Update a reminder.
    
    Only the fields provided in the request will be updated.
    """
    reminder = get_reminder_or_404(db, reminder_id, current_user.id)
    
    # Update fields from the request
    update_data = reminder_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(reminder, field, value)
    
    reminder.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(reminder)
    
    # TODO: Update the scheduled task if the due date changed
    
    return reminder

@router.delete(
    "/{reminder_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a reminder",
)
async def delete_reminder(
    reminder_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
) -> None:
    """
    Delete a reminder.
    """
    reminder = get_reminder_or_404(db, reminder_id, current_user.id)
    
    # TODO: Cancel any scheduled tasks for this reminder
    
    db.delete(reminder)
    db.commit()

@router.post(
    "/{reminder_id}/complete",
    response_model=ReminderResponse,
    summary="Mark a reminder as completed",
)
async def complete_reminder(
    reminder_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
) -> models.Reminder:
    """
    Mark a reminder as completed.
    """
    reminder = get_reminder_or_404(db, reminder_id, current_user.id)
    
    if reminder.status == ReminderStatus.COMPLETED:
        return reminder
    
    reminder.status = ReminderStatus.COMPLETED
    reminder.completed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(reminder)
    
    return reminder

@router.post(
    "/{reminder_id}/dismiss",
    response_model=ReminderResponse,
    summary="Dismiss a reminder",
)
async def dismiss_reminder(
    reminder_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
) -> models.Reminder:
    """
    Dismiss a reminder without marking it as completed.
    """
    reminder = get_reminder_or_404(db, reminder_id, current_user.id)
    
    if reminder.status == ReminderStatus.DISMISSED:
        return reminder
    
    reminder.status = ReminderStatus.DISMISSED
    reminder.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(reminder)
    
    return reminder
