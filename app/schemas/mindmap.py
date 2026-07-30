from typing import Optional
from pydantic import BaseModel
from datetime import datetime

# Shared properties
class MindMapBase(BaseModel):
    title: str
    data: str

# Properties to receive on MindMap creation
class MindMapCreate(MindMapBase):
    pass

# Properties to receive on MindMap update
class MindMapUpdate(BaseModel):
    title: Optional[str] = None
    data: Optional[str] = None

# Properties to return to client
class MindMap(MindMapBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True
