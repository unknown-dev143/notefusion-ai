from typing import Optional, List, Any
from pydantic import BaseModel
from datetime import datetime

class PresentationBase(BaseModel):
    title: str
    topic: Optional[str] = None
    slides_data: List[Any] # Flexible list of slide objects
    theme_id: Optional[str] = "ocean"

class PresentationCreate(PresentationBase):
    pass

class PresentationUpdate(BaseModel):
    title: Optional[str] = None
    topic: Optional[str] = None
    slides_data: Optional[List[Any]] = None
    theme_id: Optional[str] = None

class Presentation(PresentationBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True
