import json
import logging
from typing import List, Dict, Any, Optional
from app.core.engines import brain
from app.models.learning import ConceptStatus

logger = logging.getLogger(__name__)

class LearningEngine:
    """
    DEPRECATED: Use app.core.engines (NoteFusionBrain) instead.
    This class now acts as a Proxy for the 5-Engine architecture for backward compatibility.
    """
    def __init__(self):
        self.brain = brain

    async def parse_content_to_concepts(self, content: str, user_id: int, db: Any, note_id: Optional[int] = None) -> List[Dict[str, Any]]:
        # Librarian (Content Engine)
        return await self.brain.librarian.extract_knowledge_atoms(content)

    async def calculate_lvi(self, user_metrics: Dict[str, Any]) -> float:
        # Coach (Analytics Engine)
        return self.brain.coach.calculate_lvi(
            retention=user_metrics.get("retention_rate", 0),
            mastery_count=user_metrics.get("mastery_rate", 0) * 100, # Assuming 1.0 is 100%
            graph_density=user_metrics.get("graph_density", 0)
        )

    def generate_srs_interval(self, current_interval: int, ease_factor: float, quality: int, memory_decay_factor: float = 1.0) -> Dict[str, Any]:
        # Memory Trainer (Recall Engine)
        return self.brain.memory.calculate_next_review(current_interval, ease_factor, quality, memory_decay_factor)

    async def detect_knowledge_gaps(self, user_id: int, db: Any) -> List[Dict[str, Any]]:
        # Researcher (Knowledge Engine)
        # Simplified: Extract concept names
        # ... fetch titles from db ...
        return await self.brain.researcher.detect_knowledge_graph_gaps(["Example Concepts"])

    async def process_note_for_learning(self, note_id: int, db: Any, user_id: int):
        """
        Coordinated Action across Librarian and Memory Trainer.
        """
        from app.models.note import Note
        from app.models.learning import LearningConcept, RecallTask, ConceptStatus
        from sqlalchemy import select

        result = await db.execute(select(Note).filter(Note.id == note_id))
        note = result.scalars().first()
        if not note: return

        # Call Librarian
        concepts_data = await self.brain.librarian.extract_knowledge_atoms(note.content)
        
        for data in concepts_data:
            concept = LearningConcept(
                title=data.get("title", "Unknown Concept"),
                description=data.get("description", ""),
                content_summary=data.get("simple_explanation", ""),
                difficulty_level=data.get("difficulty", 1),
                owner_id=user_id,
                source_note_id=note_id,
                status=ConceptStatus.NEW
            )
            db.add(concept)
            await db.commit()
            await db.refresh(concept)
            
            # Create SRS Tasks
            for q in data.get("key_questions", ["What is the main idea?"]):
                task = RecallTask(
                    concept_id=concept.id,
                    user_id=user_id,
                    question=q,
                    answer=data.get("description", "Refer to description.")
                )
                db.add(task)
        
        await db.commit()

learning_engine = LearningEngine()
