"""
API endpoints for audio notes with pagination support.
"""
import os
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps
from app.core.config import settings
from app.services.audio import AudioService

router = APIRouter()

# Initialize services
audio_service = AudioService()

@router.post("/upload", response_model=schemas.AudioUploadResponse)
async def upload_audio_note(
    *,
    title: str,
    file: UploadFile = File(...),
    current_user: models.User = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db),
):
    """
    Upload a new audio note.
    """
    # Create upload directory if it doesn't exist
    upload_dir = Path(settings.UPLOAD_DIR) / "audio_notes"
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate a unique filename
    file_ext = Path(file.filename).suffix if file.filename else ".wav"
    filename = f"{current_user.id}_{int(datetime.utcnow().timestamp())}{file_ext}"
    file_path = upload_dir / filename
    
    try:
        # Save the file
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Get file size
        file_size = os.path.getsize(file_path)
        
        # Get audio duration
        duration = audio_service.get_audio_duration(file_path)
        
        # Create audio note in database
        note_in = schemas.AudioNoteCreate(
            title=title,
            file_path=str(file_path),
            file_size=file_size,
            duration=duration,
            language="en",  # Default language
        )
        
        note = crud.audio_note.create(
            db=db, 
            obj_in=note_in, 
            user_id=current_user.id
        )
        
        return {
            "id": note.id,
            "title": note.title,
            "file_path": note.file_path,
            "audio_url": f"{settings.API_V1_STR}/audio/notes/{note.id}/file",
            "duration": note.duration,
            "file_size": note.file_size,
        }
        
    except Exception as e:
        # Clean up file if there was an error
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading file: {str(e)}"
        )

@router.get("/{note_id}", response_model=schemas.AudioNote)
def get_audio_note(
    note_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db),
):
    """
    Get an audio note by ID.
    """
    note = crud.audio_note.get(db, note_id=note_id)
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audio note not found"
        )
    
    # Check permissions
    if note.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Convert to response model
    return {
        **note.to_dict(),
        "audio_url": f"{settings.API_V1_STR}/audio/notes/{note.id}/file"
    }

@router.get("/{note_id}/file")
async def get_audio_file(
    note_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db),
):
    """
    Get the audio file for a note.
    """
    note = crud.audio_note.get(db, note_id=note_id)
    if not note or not os.path.exists(note.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audio file not found"
        )
    
    # Check permissions
    if note.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return FileResponse(
        note.file_path,
        media_type="audio/mpeg",
        filename=os.path.basename(note.file_path)
    )

@router.get("/", response_model=schemas.AudioNoteListResponse)
def list_audio_notes(
    params: schemas.AudioNoteQueryParams = Depends(),
    current_user: models.User = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db),
):
    """
    List audio notes with pagination.
    """
    result = crud.audio_note.get_multi_paginated(
        db=db,
        params=params,
        user_id=current_user.id
    )
    
    # Add audio URLs to each note
    items = [
        {
            **note.to_dict(),
            "audio_url": f"{settings.API_V1_STR}/audio/notes/{note.id}/file"
        }
        for note in result["items"]
    ]
    
    return {
        **result,
        "items": items
    }

@router.put("/{note_id}", response_model=schemas.AudioNote)
def update_audio_note(
    note_id: int,
    note_in: schemas.AudioNoteUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db),
):
    """
    Update an audio note.
    """
    note = crud.audio_note.get(db, note_id=note_id)
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audio note not found"
        )
    
    # Check permissions
    if note.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Update the note
    note = crud.audio_note.update(db, db_obj=note, obj_in=note_in)
    
    return {
        **note.to_dict(),
        "audio_url": f"{settings.API_V1_STR}/audio/notes/{note.id}/file"
    }

@router.delete("/{note_id}", response_model=schemas.AudioNote)
def delete_audio_note(
    note_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db),
):
    """
    Delete an audio note.
    """
    note = crud.audio_note.get(db, note_id=note_id)
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audio note not found"
        )
    
    # Check permissions
    if note.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Delete the file if it exists
    if os.path.exists(note.file_path):
        try:
            os.remove(note.file_path)
        except Exception as e:
            print(f"Error deleting audio file: {str(e)}")
    
    # Delete the note from the database
    crud.audio_note.remove(db, note_id=note_id)
    
    return {
        **note.to_dict(),
        "audio_url": f"{settings.API_V1_STR}/audio/notes/{note.id}/file"
    }

@router.get("/stats/me", response_model=schemas.AudioNoteStats)
def get_my_audio_stats(
    current_user: models.User = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db),
):
    """
    Get statistics about the current user's audio notes.
    """
    return crud.audio_note.get_stats(db, user_id=current_user.id)

@router.get("/stats/all", response_model=schemas.AudioNoteStats)
def get_all_audio_stats(
    current_user: models.User = Depends(deps.get_current_active_superuser),
    db: Session = Depends(deps.get_db),
):
    """
    Get statistics about all audio notes (admin only).
    """
    return crud.audio_note.get_stats(db, user_id=None)
