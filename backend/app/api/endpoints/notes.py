from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import JSONResponse
from typing import List, Optional
from sqlalchemy.orm import Session
from ... import models, schemas, crud
from ...database import get_db
from ...services import cloud_storage
from ...core.security import get_current_user
from ...models.user import User

router = APIRouter(prefix="/notes", tags=["notes"])

@router.post("/", response_model=schemas.Note)
def create_note(
    note: schemas.NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new note"""
    return crud.create_note(db=db, note=note, user_id=current_user.id)

@router.get("/", response_model=List[schemas.Note])
def read_notes(
    skip: int = 0,
    limit: int = 100,
    folder_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve notes"""
    notes = crud.get_notes(
        db, 
        user_id=current_user.id, 
        folder_id=folder_id,
        skip=skip, 
        limit=limit
    )
    return notes

@router.get("/{note_id}", response_model=schemas.Note)
def read_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific note by ID"""
    db_note = crud.get_note(db, note_id=note_id)
    if db_note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    if db_note.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return db_note

@router.put("/{note_id}", response_model=schemas.Note)
def update_note(
    note_id: int,
    note: schemas.NoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a note"""
    db_note = crud.get_note(db, note_id=note_id)
    if db_note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    if db_note.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return crud.update_note(db=db, note_id=note_id, note=note)

@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a note"""
    db_note = crud.get_note(db, note_id=note_id)
    if db_note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    if db_note.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    crud.delete_note(db=db, note_id=note_id)
    return {"status": "success"}

@router.post("/{note_id}/attachments", response_model=schemas.Attachment)
async def upload_attachment(
    note_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload an attachment to a note"""
    # Verify note exists and user has permission
    db_note = crud.get_note(db, note_id=note_id)
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")
    if db_note.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    try:
        # Upload to cloud storage
        file_path = f"notes/{note_id}/{file.filename}"
        file_url = await cloud_storage.upload_file(
            file.file, 
            file_path,
            content_type=file.content_type
        )
        
        # Save attachment record
        attachment = schemas.AttachmentCreate(
            filename=file.filename,
            file_path=file_path,
            file_url=file_url,
            file_type=file.content_type or "application/octet-stream",
            file_size=file.size,
            note_id=note_id
        )
        
        return crud.create_attachment(db=db, attachment=attachment)
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error uploading file: {str(e)}"
        )

@router.post("/{note_id}/generate", response_model=schemas.Note)
async def generate_note_content(
    note_id: int,
    prompt: schemas.NoteGenerationPrompt,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate note content using AI"""
    db_note = crud.get_note(db, note_id=note_id)
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")
    if db_note.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    try:
        # Call AI service to generate content
        # This is a placeholder - implement based on your AI service
        generated_content = "Generated content based on prompt"
        
        # Update note with generated content
        update_data = {"content": f"{db_note.content}\n\n{generated_content}"}
        return crud.update_note(db=db, note_id=note_id, note=update_data)
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error generating content: {str(e)}"
        )
