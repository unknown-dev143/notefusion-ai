from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models import Note, User
from app.schemas.note import Note as NoteSchema, NoteCreate, NoteUpdate

router = APIRouter()


@router.post("/", response_model=NoteSchema, status_code=status.HTTP_201_CREATED)
async def create_note(
    note: NoteCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    db_note = Note(title=note.title, content=note.content, owner_id=current_user.id)
    db.add(db_note)
    await db.commit()
    await db.refresh(db_note)
    
    # Trigger Learning Engine in the background
    from app.core.learning_engine import learning_engine
    background_tasks.add_task(learning_engine.process_note_for_learning, db_note.id, db, current_user.id)
    
    return db_note


@router.get("/", response_model=List[NoteSchema])
async def read_notes(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    from sqlalchemy import select

    result = await db.execute(
        select(Note).filter(Note.owner_id == current_user.id).offset(skip).limit(limit)
    )
    notes = result.scalars().all()
    return notes


@router.get("/search", response_model=List[NoteSchema])
async def search_notes(
    q: str = "",
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    from sqlalchemy import select, or_

    result = await db.execute(
        select(Note).filter(
            Note.owner_id == current_user.id,
            or_(
                Note.title.ilike(f"%{q}%"),
                Note.content.ilike(f"%{q}%"),
            ),
        ).offset(skip).limit(limit)
    )
    return result.scalars().all()


@router.get("/{note_id}", response_model=NoteSchema)
async def read_note(
    note_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    from sqlalchemy import select

    result = await db.execute(
        select(Note).filter(Note.id == note_id, Note.owner_id == current_user.id)
    )
    db_note = result.scalars().first()

    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")
    return db_note


@router.put("/{note_id}", response_model=NoteSchema)
async def update_note(
    note_id: int,
    note: NoteUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    from sqlalchemy import select

    result = await db.execute(
        select(Note).filter(Note.id == note_id, Note.owner_id == current_user.id)
    )
    db_note = result.scalars().first()

    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")

    update_data = note.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_note, field, value)

    db.add(db_note)
    await db.commit()
    await db.refresh(db_note)
    return db_note


@router.patch("/{note_id}", response_model=NoteSchema)
async def update_note_partial(
    note_id: int,
    note: NoteUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """PATCH alias — same logic as PUT but for partial updates from the frontend."""
    from sqlalchemy import select

    result = await db.execute(
        select(Note).filter(Note.id == note_id, Note.owner_id == current_user.id)
    )
    db_note = result.scalars().first()

    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")

    update_data = note.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_note, field, value)

    db.add(db_note)
    await db.commit()
    await db.refresh(db_note)
    return db_note


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    from sqlalchemy import select

    result = await db.execute(
        select(Note).filter(Note.id == note_id, Note.owner_id == current_user.id)
    )
    db_note = result.scalars().first()

    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")

    await db.delete(db_note)
    await db.commit()
    return {"ok": True}
