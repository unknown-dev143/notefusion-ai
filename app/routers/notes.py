from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models import Note, User
from app.schemas.note import Note as NoteSchema, NoteCreate, NoteUpdate

router = APIRouter()

@router.post("/", response_model=NoteSchema, status_code=status.HTTP_201_CREATED)
def create_note(
    note: NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_note = Note(
        title=note.title,
        content=note.content,
        owner_id=current_user.id
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note

@router.get("/", response_model=List[NoteSchema])
def read_notes(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    notes = db.query(Note).filter(Note.owner_id == current_user.id).offset(skip).limit(limit).all()
    return notes

@router.get("/{note_id}", response_model=NoteSchema)
def read_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_note = db.query(Note).filter(
        Note.id == note_id,
        Note.owner_id == current_user.id
    ).first()
    
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    return db_note

@router.put("/{note_id}", response_model=NoteSchema)
def update_note(
    note_id: int,
    note: NoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_note = db.query(Note).filter(
        Note.id == note_id,
        Note.owner_id == current_user.id
    ).first()
    
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    update_data = note.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_note, field, value)
    
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note

@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_note = db.query(Note).filter(
        Note.id == note_id,
        Note.owner_id == current_user.id
    ).first()
    
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    db.delete(db_note)
    db.commit()
    return {"ok": True}
