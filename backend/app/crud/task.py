from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
from datetime import datetime

from ..models.task import Task, TaskStatus, TaskType

def create_task(
    db: Session,
    task_id: str,
    user_id: str,
    task_type: TaskType,
    status: TaskStatus = TaskStatus.PENDING,
    input_data: Optional[Dict[str, Any]] = None,
    result_data: Optional[Dict[str, Any]] = None,
    error_message: Optional[str] = None,
) -> Task:
    """Create a new task in the database."""
    db_task = Task(
        task_id=task_id,
        user_id=user_id,
        task_type=task_type,
        status=status,
        input_data=input_data,
        result_data=result_data,
        error_message=error_message,
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def get_task(db: Session, task_id: str, user_id: Optional[str] = None) -> Optional[Task]:
    """Get a task by its ID, optionally filtered by user ID."""
    query = db.query(Task).filter(Task.task_id == task_id)
    if user_id:
        query = query.filter(Task.user_id == user_id)
    return query.first()

def update_task_status(
    db: Session,
    task_id: str,
    status: TaskStatus,
    result_data: Optional[Dict[str, Any]] = None,
    error_message: Optional[str] = None,
) -> Optional[Task]:
    """Update the status of a task."""
    db_task = db.query(Task).filter(Task.task_id == task_id).first()
    if not db_task:
        return None
    
    db_task.status = status
    
    if result_data is not None:
        db_task.result_data = result_data
    
    if error_message is not None:
        db_task.error_message = error_message
    
    if status in [TaskStatus.COMPLETED, TaskStatus.FAILED, TaskStatus.CANCELLED]:
        db_task.completed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_task)
    return db_task

def list_user_tasks(
    db: Session,
    user_id: str,
    task_type: Optional[TaskType] = None,
    status: Optional[TaskStatus] = None,
    limit: int = 100,
    offset: int = 0,
) -> list[Task]:
    """List tasks for a user, with optional filtering by task type and status."""
    query = db.query(Task).filter(Task.user_id == user_id)
    
    if task_type:
        query = query.filter(Task.task_type == task_type)
    
    if status:
        query = query.filter(Task.status == status)
    
    return query.order_by(Task.created_at.desc()).offset(offset).limit(limit).all()

def delete_task(db: Session, task_id: str, user_id: Optional[str] = None) -> bool:
    """Delete a task by its ID, optionally filtered by user ID."""
    query = db.query(Task).filter(Task.task_id == task_id)
    if user_id:
        query = query.filter(Task.user_id == user_id)
    
    deleted = query.delete(synchronize_session=False)
    db.commit()
    return deleted > 0
