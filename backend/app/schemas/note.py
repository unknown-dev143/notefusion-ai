from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

# Shared properties
class NoteBase(BaseModel):
    title: str = Field(..., max_length=255)
    content: Optional[str] = None
    folder_id: Optional[int] = None
    is_pinned: bool = False
    is_archived: bool = False
    tags: List[str] = []
    metadata: Dict[str, Any] = {}

# Properties to receive on note creation
class NoteCreate(NoteBase):
    pass

# Properties to receive on note update
class NoteUpdate(NoteBase):
    title: Optional[str] = None
    content: Optional[str] = None

# Properties shared by models stored in DB
class NoteInDBBase(NoteBase):
    id: int
    user_id: int
    version: int = 1
    created_at: datetime
    updated_at: datetime
    last_edited_by: Optional[int] = None
    
    class Config:
        orm_mode = True

# Properties to return to client
class Note(NoteInDBBase):
    pass

# Properties stored in DB
class NoteInDB(NoteInDBBase):
    pass

# Attachment schemas
class AttachmentBase(BaseModel):
    filename: str
    file_path: str
    file_url: str
    file_type: str
    file_size: int
    note_id: int

class AttachmentCreate(AttachmentBase):
    pass

class Attachment(AttachmentBase):
    id: int
    uploaded_at: datetime
    
    class Config:
        orm_mode = True

# Folder schemas
class FolderBase(BaseModel):
    name: str = Field(..., max_length=100)
    parent_id: Optional[int] = None

class FolderCreate(FolderBase):
    pass

class FolderUpdate(FolderBase):
    name: Optional[str] = None

class Folder(FolderBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

class FolderWithNotes(Folder):
    notes: List[Note] = []
    subfolders: List['FolderWithNotes'] = []

# Note generation
class NoteGenerationPrompt(BaseModel):
    prompt: str
    language: str = "en"
    style: str = "default"
    length: str = "medium"  # short, medium, long
    include_summary: bool = True
    include_key_points: bool = True
    custom_instructions: Optional[str] = None
