from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.user import User
from app.models.learning import LearningConcept, LearningRelation, RecallTask, LearningMetric, ConceptStatus, RelationType
from app.schemas.learning import Concept, ConceptCreate, Connection, RecallTask as RecallTaskSchema, LearningMetrics as LearningMetricsSchema
from app.core.learning_engine import learning_engine
from app.core.engines import brain
from app.models.note import Note

router = APIRouter()

# API STRUCTURE (MANDATORY)

@router.post("/upload")
async def upload_material(
    note_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Flow A: Add Knowledge -> Content Engine -> Concepts Created."""
    await learning_engine.process_note_for_learning(note_id, db, current_user.id)
    return {"status": "success", "message": "Material processed into structured knowledge."}

@router.get("/learn-session")
async def get_learn_session(
    concept_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Flow B: Learn -> Learning Engine generates guided session."""
    if not concept_id:
        # Fetch a concept that needs attention or is new
        result = await db.execute(select(LearningConcept).filter(LearningConcept.owner_id == current_user.id).limit(1))
        concept = result.scalars().first()
    else:
        result = await db.execute(select(LearningConcept).filter(LearningConcept.id == concept_id))
        concept = result.scalars().first()

    if not concept:
        raise HTTPException(status_code=404, detail="No concepts available to learn.")

    # Call Teacher (Learning Engine) for guided structure
    session_data = await brain.teacher.generate_tutor_guided_session(
        {"title": concept.title, "description": concept.description},
        profile=None # Add profile fetch if needed
    )
    
    return {
        "concept_id": concept.id,
        "concept_title": concept.title,
        **session_data
    }

@router.post("/submit-answer")
async def submit_answer(
    performance: Dict[str, Any], # {task_id, quality, hesitation_ms}
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Flow B: submit-answer -> Update Recall schedule + Analytics."""
    return await submit_recall_performance(performance.get("task_id"), performance, db, current_user)

@router.get("/dashboard-analytics")
async def get_dashboard_data(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Dashboard -> Return analytics (LVI, progress, weak areas)."""
    return await get_learning_metrics(db, current_user)

@router.get("/concepts", response_model=List[Concept])
async def read_concepts(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    result = await db.execute(
        select(LearningConcept).filter(LearningConcept.owner_id == current_user.id).offset(skip).limit(limit)
    )
    return result.scalars().all()

@router.post("/concepts/extract/{note_id}")
async def extract_concepts_from_note(
    note_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    await learning_engine.process_note_for_learning(note_id, db, current_user.id)
    return {"status": "success", "message": "Concepts extracted and SRS tasks generated."}

@router.get("/graph", response_model=Dict[str, Any])
async def get_knowledge_graph(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Connection Layer: Fetches nodes and edges for the graph visualization."""
    result_concepts = await db.execute(
        select(LearningConcept).filter(LearningConcept.owner_id == current_user.id)
    )
    concepts = result_concepts.scalars().all()
    
    # Simple edge logic (related concepts or shared notes)
    nodes = [{"id": str(c.id), "label": c.title, "status": c.status.value, "difficulty": c.difficulty_level} for c in concepts]
    
    # Fetch actual relations if they exist
    result_relations = await db.execute(
        select(LearningRelation).join(LearningConcept, LearningRelation.source_id == LearningConcept.id).filter(LearningConcept.owner_id == current_user.id)
    )
    relations = result_relations.scalars().all()
    edges = [{"source": str(r.source_id), "target": str(r.target_id), "type": r.relation_type.value} for r in relations]
    
    return {"nodes": nodes, "links": edges}

@router.get("/recall-queue", response_model=List[RecallTaskSchema])
async def get_recall_queue(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Memory Layer: Fetches tasks due for review today."""
    from datetime import datetime
    
    result = await db.execute(
        select(RecallTask)
        .filter(RecallTask.user_id == current_user.id)
        .filter(RecallTask.next_review <= datetime.now())
        .order_by(RecallTask.next_review.asc())
        .limit(20)
    )
    return result.scalars().all()

@router.get("/concepts", response_model=List[Concept])
async def get_concepts(
    limit: int = 10,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Fetches learning concepts for the dashboard/user."""
    result = await db.execute(
        select(LearningConcept)
        .filter(LearningConcept.owner_id == current_user.id)
        .order_by(LearningConcept.id.desc())
        .limit(limit)
    )
    return result.scalars().all()

@router.post("/recall/{task_id}")
async def submit_recall_performance(
    task_id: int,
    performance: Dict[str, Any], # {quality, hesitation_ms, response_time_ms}
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Adaptive Recall: Updates the SRS schedule based on performance."""
    from app.models.learning import RecallTask, CognitiveProfile
    from datetime import datetime, timedelta
    
    # 1. Fetch Task
    result = await db.execute(select(RecallTask).filter(RecallTask.id == task_id, RecallTask.user_id == current_user.id))
    task = result.scalars().first()
    if not task: raise HTTPException(status_code=404, detail="Task not found")

    # 2. Fetch Cognitive Profile
    result_cog = await db.execute(select(CognitiveProfile).filter(CognitiveProfile.user_id == current_user.id))
    profile = result_cog.scalars().first()
    decay_factor = profile.memory_decay_factor if profile else 1.0

    # 3. Calculate New Interval
    quality = performance.get("quality", 3)
    srs_data = learning_engine.generate_srs_interval(
        current_interval=task.interval_days,
        ease_factor=task.ease_factor,
        quality=quality,
        memory_decay_factor=decay_factor
    )

    # 4. Update Task
    task.interval_days = srs_data["interval"]
    task.ease_factor = srs_data["ease_factor"]
    task.next_review = datetime.now() + timedelta(days=task.interval_days)
    task.last_reviewed = datetime.now()
    task.mastery_level = min(5, task.mastery_level + (1 if quality >= 4 else -1))
    
    # 5. Background: Train Cognitive AI from this event
    # (Simplified: if hesitation is high, maybe increase decay factor)
    hesitation = performance.get("hesitation_ms", 0)
    if profile:
        if hesitation > 5000:
            # User hesitated too long, increase memory decay 
            profile.memory_decay_factor = min(2.0, profile.memory_decay_factor + 0.05)
        elif hesitation < 1500 and quality >= 4:
            # User answered quickly and correctly, decrease decay
            profile.memory_decay_factor = max(0.5, profile.memory_decay_factor - 0.02)
        
        db.add(profile)

    await db.commit()
    return {"status": "synced", "next_review": task.next_review}

@router.get("/metrics", response_model=LearningMetricsSchema)
async def get_learning_metrics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Calculates and returns the latest LVI metrics."""
    from datetime import datetime
    # 1. Fetch data for metrics
    result_concepts = await db.execute(
        select(func.count(LearningConcept.id)).filter(LearningConcept.owner_id == current_user.id, LearningConcept.status == ConceptStatus.MASTERED)
    )
    mastered_count = result_concepts.scalar() or 0
    
    result_relations = await db.execute(
        select(func.count(LearningRelation.id)).join(LearningConcept, LearningRelation.source_id == LearningConcept.id).filter(LearningConcept.owner_id == current_user.id)
    )
    relations_count = result_relations.scalar() or 0
    
    # Calc LVI
    lvi = await learning_engine.calculate_lvi({
        "retention_rate": 0.8, 
        "mastery_rate": mastered_count / 10 if mastered_count > 0 else 0,
        "graph_density": relations_count / (mastered_count + 1)
    })
    
    return {
        "retention_rate": 0.8,
        "concepts_mastered": mastered_count,
        "connections_made": relations_count,
        "lvi_score": lvi,
        "date": datetime.now()
    }
