<<<<<<< HEAD
import os
import logging
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, BackgroundTasks
from fastapi.responses import JSONResponse, FileResponse
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime
import shutil

from ... import models, schemas, crud
from ...database import get_db, SessionLocal
from ...core.security import get_current_user
from ...models.user import User
from ...services.file_upload import file_upload_service
from ...services.ai import AIService

# Configure logging
logger = logging.getLogger(__name__)
=======
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import JSONResponse
from typing import List, Optional
from sqlalchemy.orm import Session
from ... import models, schemas, crud
from ...database import get_db
from ...services import cloud_storage
from ...core.security import get_current_user
from ...models.user import User
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e

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
<<<<<<< HEAD
    """
    Upload an attachment to a note.
    
    Supported file types:
    - Images: .jpg, .jpeg, .png, .gif
    - Documents: .pdf, .doc, .docx, .txt
    - Audio: .mp3, .wav, .m4a
    """
=======
    """Upload an attachment to a note"""
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
    # Verify note exists and user has permission
    db_note = crud.get_note(db, note_id=note_id)
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")
    if db_note.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    try:
<<<<<<< HEAD
        # Save the uploaded file
        file_info = await file_upload_service.save_upload_file(file)
        
        # Create attachment record in database
        attachment_data = {
            "filename": file_info["filename"],
            "file_path": file_info["file_path"],
            "file_url": file_info["file_url"],
            "file_type": file_info["file_type"],
            "file_size": file_info["file_size"],
            "note_id": note_id
        }
        
        db_attachment = crud.create_attachment(
            db=db,
            attachment=schemas.AttachmentCreate(**attachment_data)
        )
        
        # If it's an audio file, trigger transcription
        if file_info["file_type"].startswith("audio/") or file_info["file_type"].endswith("m4a"):
            background_tasks = BackgroundTasks()
            background_tasks.add_task(
                transcribe_audio,
                db=db,
                attachment_id=db_attachment.id,
                file_path=file_info["file_path"]
            )
        
        return db_attachment
        
    except Exception as e:
        logger.error(f"Error uploading file: {str(e)}", exc_info=True)
=======
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
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
        raise HTTPException(
            status_code=500, 
            detail=f"Error uploading file: {str(e)}"
        )
<<<<<<< HEAD
            detail=f"Error uploading file: {str(e)}"
        )

@router.post("/{note_id}/generate", response_model=Dict[str, Any])
async def generate_note_content(
    note_id: int,
    prompt: schemas.NoteGenerationPrompt,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate note content using AI based on the provided prompt.
    
    This can be used to:
    - Summarize existing content
    - Generate flashcards
    - Expand on ideas
    - Format notes
    """
    # Verify note exists and user has permission
=======

@router.post("/{note_id}/generate", response_model=schemas.Note)
async def generate_note_content(
    note_id: int,
    prompt: schemas.NoteGenerationPrompt,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate note content using AI"""
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
    db_note = crud.get_note(db, note_id=note_id)
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")
    if db_note.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    try:
<<<<<<< HEAD
        # Get user's AI settings
        ai_settings = get_user_ai_settings(db, current_user.id)
        
        # Initialize AI service with user's settings
        ai_service = AIService(api_key=ai_settings.get("api_key"))
        
        # Generate content using AI
        generated_content = await ai_service.generate_note_content(
            note_content=db_note.content,
            prompt=prompt.prompt,
            language=prompt.language,
            style=prompt.style,
            length=prompt.length
        )
        
        # Update note content
        update_data = {
            "content": generated_content,
            "updated_at": datetime.utcnow(),
            "last_edited_by": current_user.id
        }
        
        # If this is a new note, update the title as well
        if not db_note.title or db_note.title == "Untitled":
            update_data["title"] = f"Generated Note - {datetime.utcnow().strftime('%Y-%m-%d %H:%M')}"
        
        updated_note = crud.update_note(
            db=db,
            note_id=note_id,
            note=schemas.NoteUpdate(**update_data)
        )
        
        return {"status": "success", "note": updated_note}
    
    except Exception as e:
        logger.error(f"Error generating note content: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating content: {str(e)}"
        )
    try:
=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
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
