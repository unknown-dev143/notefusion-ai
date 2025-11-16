from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field, validator
from uuid import UUID, uuid4

from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.user import User
from app.models.user_task import UserTask, TaskStatus, TaskPriority

router = APIRouter()

# Pydantic models for request/response
class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    status: TaskStatus = TaskStatus.PENDING
    priority: TaskPriority = TaskPriority.MEDIUM
    due_date: Optional[datetime] = None
    reminder_enabled: bool = False
    reminder_time: Optional[datetime] = None
    category: Optional[str] = Field(None, max_length=100)
    tags: List[str] = Field(default_factory=list)
    
    @validator('tags', each_item=True)
    def validate_tag_length(cls, v):
        if len(v) > 100:
            raise ValueError('Tag must be 100 characters or less')
        return v

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    due_date: Optional[datetime] = None
    reminder_enabled: Optional[bool] = None
    reminder_time: Optional[datetime] = None
    category: Optional[str] = Field(None, max_length=100)
    tags: Optional[List[str]] = None
    
    @validator('tags', each_item=True)
    def validate_tag_length(cls, v):
        if v and len(v) > 100:
            raise ValueError('Tag must be 100 characters or less')
        return v

class TaskInDB(TaskBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        orm_mode = True

@router.get("/tasks", response_model=List[TaskInDB])
async def get_tasks(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=100, description="Maximum number of records to return"),
    status: Optional[TaskStatus] = None,
    priority: Optional[TaskPriority] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get all tasks for the current user with optional filtering by status and priority.
    """
    query = db.query(UserTask).filter(
        UserTask.user_id == current_user.id
    )
    
    if status is not None:
        query = query.filter(UserTask.status == status)
    if priority is not None:
        query = query.filter(UserTask.priority == priority)
        
    tasks = query.order_by(
        UserTask.due_date.asc(),
        UserTask.priority.desc(),
        UserTask.created_at.desc()
    ).offset(skip).limit(limit).all()
    
    return tasks

@router.post("/tasks", response_model=TaskInDB, status_code=status.HTTP_201_CREATED)
async def create_task(
    task: TaskCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create a new task for the current user.
    """
    # Prepare task data
    task_data = task.dict()
    
    # Create the task
    db_task = UserTask(
        **task_data,
        user_id=current_user.id
    )
    
    # Add to database
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    
    return db_task

@router.get("/tasks/{task_id}", response_model=TaskInDB)
async def get_task(
    task_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific task by ID.
    
    Only the task owner can access the task.
    """
    task = db.query(UserTask).filter(
        UserTask.id == task_id,
        UserTask.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
        
    return task

@router.put("/tasks/{task_id}", response_model=TaskInDB)
async def update_task(
    task_id: UUID,
    task_update: TaskUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update an existing task.
    
    Only the task owner can update the task.
    """
    # Get the task
    db_task = db.query(UserTask).filter(
        UserTask.id == task_id,
        UserTask.user_id == current_user.id
    ).first()
    
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Prepare update data
    update_data = task_update.dict(exclude_unset=True)
    
    # Handle status change to completed
    if 'status' in update_data and update_data['status'] == TaskStatus.COMPLETED:
        update_data['completed_at'] = datetime.utcnow()
    elif 'status' in update_data and update_data['status'] != TaskStatus.COMPLETED:
        update_data['completed_at'] = None
    
    # Update task fields
    for field, value in update_data.items():
        setattr(db_task, field, value)
    
    # Update the updated_at timestamp
    db_task.updated_at = datetime.utcnow()
    
    # Save changes
    db.commit()
    db.refresh(db_task)
    
    return db_task

@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Delete a task.
    
    Only the task owner can delete the task.
    """
    # Get the task
    db_task = db.query(UserTask).filter(
        UserTask.id == task_id,
        UserTask.user_id == current_user.id
    ).first()
    
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Delete the task
    db.delete(db_task)
    db.commit()
    
    return None

@router.patch("/tasks/{task_id}/status/{status}", response_model=TaskInDB)
async def update_task_status(
    task_id: UUID,
    status: TaskStatus,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update a task's status.
    
    Only the task owner can update the task status.
    """
    # Get the task
    db_task = db.query(UserTask).filter(
        UserTask.id == task_id,
        UserTask.user_id == current_user.id
    ).first()
    
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Update status
    db_task.status = status
    
    # Update completion time if marked as completed
    if status == TaskStatus.COMPLETED:
        db_task.completed_at = datetime.utcnow()
    else:
        db_task.completed_at = None
    
    # Update the updated_at timestamp
    db_task.updated_at = datetime.utcnow()
    
    # Save changes
    db.commit()
    db.refresh(db_task)
    
    return db_task

@router.get("/tasks/search", response_model=List[TaskInDB])
async def search_tasks(
    q: str = Query(..., min_length=1, max_length=100, description="Search query"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=100, description="Maximum number of records to return"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Search tasks by title or description.
    
    Only returns tasks owned by the current user.
    """
    search = f"%{q}%"
    
    tasks = db.query(UserTask).filter(
        UserTask.user_id == current_user.id,
        (UserTask.title.ilike(search)) | (UserTask.description.ilike(search))
    ).order_by(
        UserTask.due_date.asc(),
        UserTask.priority.desc(),
        UserTask.created_at.desc()
    ).offset(skip).limit(limit).all()
    
    return tasks
