from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.models.learning import ConceptStatus, RelationType

class ConceptBase(BaseModel):
    title: str
    description: Optional[str] = None
    content_summary: Optional[str] = None
    difficulty_level: int = 1
    importance_score: float = 0.5
    status: ConceptStatus = ConceptStatus.NEW

class ConceptCreate(ConceptBase):
    source_note_id: Optional[int] = None

class Concept(ConceptBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ConnectionBase(BaseModel):
    source_id: int
    target_id: int
    relation_type: RelationType = RelationType.RELATED
    strength: float = 1.0

class Connection(ConnectionBase):
    id: int

    class Config:
        from_attributes = True

class RecallTaskBase(BaseModel):
    concept_id: int
    question: str
    answer: str

class RecallTask(RecallTaskBase):
    id: int
    next_review: datetime
    mastery_level: int

    class Config:
        from_attributes = True

class LearningMetrics(BaseModel):
    retention_rate: float
    concepts_mastered: int
    connections_made: int
    lvi_score: float
    date: datetime

    class Config:
        from_attributes = True
