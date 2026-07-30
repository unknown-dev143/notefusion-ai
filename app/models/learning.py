from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, Enum, JSON, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base

class RelationType(enum.Enum):
    PREREQUISITE = "prerequisite"
    RELATED = "related"
    ANALOGY = "analogy"
    PART_OF = "part_of"

class ConceptStatus(enum.Enum):
    NEW = "new"
    LEARNING = "learning"
    MASTERED = "mastered"

class LearnerType(enum.Enum):
    VISUAL = "visual"
    LOGICAL = "logical"
    AUDITORY = "auditory"
    READ_WRITE = "read_write"

class CognitiveProfile(Base):
    """🧠 Cognitive Profile AI Storage"""
    __tablename__ = "cognitive_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    # AI Inferred Data
    learner_type = Column(Enum(LearnerType), default=LearnerType.LOGICAL)
    attention_span_minutes = Column(Integer, default=25)
    memory_decay_factor = Column(Float, default=1.0) # 1.0 is standard, lower is faster forgetting
    
    # Style Preferences
    prefers_analogies = Column(Boolean, default=True)
    prefers_diagrams = Column(Boolean, default=True)
    
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class LearningSession(Base):
    """Tracks interaction blocks to infer attention span and focus"""
    __tablename__ = "learning_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    start_time = Column(DateTime(timezone=True), server_default=func.now())
    end_time = Column(DateTime(timezone=True), nullable=True)
    
    focus_score = Column(Float, default=1.0) # 0-1
    session_type = Column(String(50)) # e.g., "recall", "synthesis", "deep_work"

class LearningConcept(Base):
    __tablename__ = "learning_concepts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True, nullable=False)
    description = Column(Text, nullable=True)
    content_summary = Column(Text, nullable=True) # AI generated summary
    
    # Metadata for LVI
    difficulty_level = Column(Integer, default=1) # 1-5
    importance_score = Column(Float, default=0.5) # 0-1
    status = Column(Enum(ConceptStatus), default=ConceptStatus.NEW)
    
    # Logic trace
    source_note_id = Column(Integer, ForeignKey("notes.id"), nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    owner = relationship("User")
    note = relationship("Note")
    
    # Connections (Self-referential many-to-many through LearningRelation)
    # relations_to = relationship("LearningRelation", foreign_keys="[LearningRelation.source_id]")
    # relations_from = relationship("LearningRelation", foreign_keys="[LearningRelation.target_id]")

class LearningRelation(Base):
    __tablename__ = "learning_relations"

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("learning_concepts.id"), nullable=False)
    target_id = Column(Integer, ForeignKey("learning_concepts.id"), nullable=False)
    relation_type = Column(Enum(RelationType), default=RelationType.RELATED)
    strength = Column(Float, default=1.0) # For visualization weights

class RecallTask(Base):
    """Spaced Repetition System (SRS) cards"""
    __tablename__ = "recall_tasks"

    id = Column(Integer, primary_key=True, index=True)
    concept_id = Column(Integer, ForeignKey("learning_concepts.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # SRS Fields
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    
    interval = Column(Integer, default=1) # Days
    ease_factor = Column(Float, default=2.5)
    last_review = Column(DateTime(timezone=True), server_default=func.now())
    next_review = Column(DateTime(timezone=True), server_default=func.now())
    mastery_level = Column(Integer, default=0) # 0-5
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class LearningMetric(Base):
    """Data points for Learning Velocity Index (LVI)"""
    __tablename__ = "learning_metrics"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    date = Column(DateTime(timezone=True), server_default=func.now())
    retention_rate = Column(Float, default=0.0) # % correct in SRS
    concepts_mastered = Column(Integer, default=0)
    connections_made = Column(Integer, default=0)
    time_spent_seconds = Column(Integer, default=0)
    
    lvi_score = Column(Float, default=0.0)
