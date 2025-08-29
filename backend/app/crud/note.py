from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas
from datetime import datetime

def get_note(db: Session, note_id: int) -> Optional[models.Note]:
    """Get a single note by ID"""
    return db.query(models.Note).filter(models.Note.id == note_id).first()

def get_notes(
    db: Session, 
    user_id: int, 
    folder_id: Optional[int] = None,
    skip: int = 0, 
    limit: int = 100
) -> List[models.Note]:
    """Get multiple notes with pagination and optional filtering"""
    query = db.query(models.Note).filter(models.Note.user_id == user_id)
    
    if folder_id is not None:
        query = query.filter(models.Note.folder_id == folder_id)
    
    return query.offset(skip).limit(limit).all()

def create_note(db: Session, note: schemas.NoteCreate, user_id: int) -> models.Note:
    """Create a new note"""
    db_note = models.Note(
        **note.dict(),
        user_id=user_id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note

def update_note(
    db: Session, 
    note_id: int, 
    note: schemas.NoteUpdate
) -> models.Note:
    """Update an existing note"""
    db_note = get_note(db, note_id=note_id)
    if not db_note:
        return None
    
    update_data = note.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    for field, value in update_data.items():
        setattr(db_note, field, value)
    
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note

def delete_note(db: Session, note_id: int) -> bool:
    """Delete a note"""
    db_note = get_note(db, note_id=note_id)
    if not db_note:
        return False
    
    db.delete(db_note)
    db.commit()
    return True

def create_attachment(
    db: Session, 
    attachment: schemas.AttachmentCreate
) -> models.Attachment:
    """Create a new attachment"""
    db_attachment = models.Attachment(**attachment.dict())
    db.add(db_attachment)
    db.commit()
    db.refresh(db_attachment)
    return db_attachment

def get_note_attachments(
    db: Session, 
    note_id: int
) -> List[models.Attachment]:
    """Get all attachments for a note"""
    return db.query(models.Attachment).filter(
        models.Attachment.note_id == note_id
    ).all()

def delete_attachment(db: Session, attachment_id: int) -> bool:
    """Delete an attachment"""
    db_attachment = db.query(models.Attachment).filter(
        models.Attachment.id == attachment_id
    ).first()
    
    if not db_attachment:
        return False
    
    # TODO: Delete file from storage
    
    db.delete(db_attachment)
    db.commit()
    return True
