import json
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_

from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.user import User
from app.models.task import Task
from app.schemas.task import Task as TaskSchema, TaskCreate, TaskUpdate

router = APIRouter()


def _serialize_tags(tags: Optional[List[str]]) -> str:
    """Convert a list of tags to a JSON string for DB storage."""
    return json.dumps(tags or [])


def _deserialize_tags(raw: Optional[str]) -> List[str]:
    """Convert JSON string from DB back to a list."""
    if not raw:
        return []
    try:
        return json.loads(raw)
    except Exception:
        return []


def _task_to_dict(task: Task) -> dict:
    """Normalize a Task ORM object for response."""
    return {
        "id": str(task.id),
        "title": task.title,
        "description": task.description,
        "status": task.status,
        "priority": task.priority,
        "due_date": task.due_date,
        "tags": _deserialize_tags(task.tags),
        "category": task.category,
        "reminder_enabled": task.reminder_enabled,
        "reminder_time": task.reminder_time,
        "completed_at": task.completed_at.isoformat() if task.completed_at else None,
        "owner_id": str(task.owner_id),
        "created_at": task.created_at.isoformat() if task.created_at else None,
        "updated_at": task.updated_at.isoformat() if task.updated_at else None,
    }


@router.get("/", response_model=List[dict])
async def read_tasks(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    status: Optional[str] = None,
    priority: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Retrieve all tasks for the current user with optional filtering."""
    query = select(Task).where(Task.owner_id == current_user.id)

    if status:
        query = query.where(Task.status == status)
    if priority:
        query = query.where(Task.priority == priority)
    if search:
        query = query.where(
            or_(
                Task.title.ilike(f"%{search}%"),
                Task.description.ilike(f"%{search}%"),
            )
        )

    query = query.order_by(Task.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    tasks = result.scalars().all()
    return [_task_to_dict(t) for t in tasks]


@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_in: TaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Create a new task."""
    task = Task(
        title=task_in.title,
        description=task_in.description,
        status=task_in.status or "todo",
        priority=task_in.priority or "medium",
        due_date=task_in.due_date,
        tags=_serialize_tags(task_in.tags),
        category=task_in.category,
        reminder_enabled=task_in.reminder_enabled or False,
        reminder_time=task_in.reminder_time,
        owner_id=current_user.id,
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return _task_to_dict(task)


@router.get("/{task_id}", response_model=dict)
async def read_task(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get a single task by ID."""
    result = await db.execute(
        select(Task).where(Task.id == task_id, Task.owner_id == current_user.id)
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return _task_to_dict(task)


@router.patch("/{task_id}", response_model=dict)
async def update_task(
    task_id: int,
    task_in: TaskUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Partially update a task."""
    result = await db.execute(
        select(Task).where(Task.id == task_id, Task.owner_id == current_user.id)
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    update_data = task_in.model_dump(exclude_unset=True)

    # Handle status -> set completed_at
    if "status" in update_data and update_data["status"] in ("done", "completed"):
        task.completed_at = datetime.now(timezone.utc)
    elif "status" in update_data:
        task.completed_at = None

    # Handle tags serialisation
    if "tags" in update_data:
        update_data["tags"] = _serialize_tags(update_data["tags"])

    for field, value in update_data.items():
        setattr(task, field, value)

    await db.commit()
    await db.refresh(task)
    return _task_to_dict(task)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Delete a task."""
    result = await db.execute(
        select(Task).where(Task.id == task_id, Task.owner_id == current_user.id)
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    await db.delete(task)
    await db.commit()
