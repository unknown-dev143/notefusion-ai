"""
CRUD operations for Audio Notes.
"""
from typing import Optional, List, Dict, Any
from datetime import datetime
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.models.audio_note import AudioNote
from app.schemas.audio_note import AudioNoteCreate, AudioNoteUpdate, AudioNoteQueryParams

class CRUDAudioNote:
    """CRUD operations for AudioNote model."""
    
    @staticmethod
    def get(db: Session, note_id: int) -> Optional[AudioNote]:
        """Get an audio note by ID."""
        return db.query(AudioNote).filter(AudioNote.id == note_id).first()
    
    @staticmethod
    def get_multi(
        db: Session, 
        *, 
        skip: int = 0, 
        limit: int = 100,
        user_id: Optional[int] = None,
        search: Optional[str] = None
    ) -> List[AudioNote]:
        """Get multiple audio notes with optional filtering and pagination."""
        query = db.query(AudioNote)
        
        if user_id is not None:
            query = query.filter(AudioNote.user_id == user_id)
            
        if search:
            search_filter = or_(
                AudioNote.title.ilike(f"%{search}%"),
                AudioNote.transcription.ilike(f"%{search}%")
            )
            query = query.filter(search_filter)
            
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    def get_multi_paginated(
        db: Session,
        params: AudioNoteQueryParams,
        user_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """Get paginated audio notes with filtering and sorting."""
        query = db.query(AudioNote)
        
        # Apply user filter if provided
        if user_id is not None:
            query = query.filter(AudioNote.user_id == user_id)
            
        # Apply search filter
        if params.search:
            search_filter = or_(
                AudioNote.title.ilike(f"%{params.search}%"),
                AudioNote.transcription.ilike(f"%{params.search}%")
            )
            query = query.filter(search_filter)
            
        # Get total count for pagination
        total = query.count()
        
        # Apply sorting
        sort_column = getattr(AudioNote, params.sort_by, AudioNote.created_at)
        if params.sort_order.lower() == "desc":
            sort_column = sort_column.desc()
        query = query.order_by(sort_column)
        
        # Apply pagination
        items = query.offset((params.page - 1) * params.page_size).limit(params.page_size).all()
        
        # Calculate total pages
        total_pages = (total + params.page_size - 1) // params.page_size
        
        return {
            "items": items,
            "total": total,
            "page": params.page,
            "page_size": params.page_size,
            "total_pages": total_pages
        }
    
    @staticmethod
    def create(db: Session, *, obj_in: AudioNoteCreate, user_id: Optional[int] = None) -> AudioNote:
        """Create a new audio note."""
        db_obj = AudioNote(
            title=obj_in.title,
            file_path=obj_in.file_path,
            file_size=obj_in.file_size,
            duration=obj_in.duration,
            transcription=obj_in.transcription,
            user_id=user_id,
            tags=obj_in.tags or [],
            language=obj_in.language or "en"
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    @staticmethod
    def update(
        db: Session, 
        *, 
        db_obj: AudioNote, 
        obj_in: AudioNoteUpdate
    ) -> AudioNote:
        """Update an existing audio note."""
        update_data = obj_in.dict(exclude_unset=True)
        
        # Handle tags update properly
        if "tags" in update_data and update_data["tags"] is not None:
            db_obj.tags = update_data["tags"]
            
        # Update other fields
        for field, value in update_data.items():
            if field != "tags" and hasattr(db_obj, field):
                setattr(db_obj, field, value)
                
        db_obj.updated_at = datetime.utcnow()
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    @staticmethod
    def remove(db: Session, *, note_id: int) -> Optional[AudioNote]:
        """Delete an audio note."""
        obj = db.query(AudioNote).filter(AudioNote.id == note_id).first()
        if obj:
            db.delete(obj)
            db.commit()
            return obj
        return None
    
    @staticmethod
    def get_stats(
        db: Session,
        user_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """Get statistics about audio notes."""
        query = db.query(
            func.count(AudioNote.id).label("total_notes"),
            func.sum(AudioNote.duration).label("total_duration"),
            func.sum(AudioNote.file_size).label("total_size"),
            func.max(AudioNote.created_at).label("last_created")
        )
        
        if user_id is not None:
            query = query.filter(AudioNote.user_id == user_id)
            
        result = query.first()
        
        return {
            "total_notes": result[0] or 0,
            "total_duration": float(result[1]) if result[1] else 0.0,
            "total_size": result[2] or 0,
            "last_created": result[3].isoformat() if result[3] else None
        }

# Create a singleton instance for easier imports
audio_note = CRUDAudioNote()
