from ....celery import celery_app
from .service import VisualGenerationService

@celery_app.task(bind=True)
def generate_presentation_task(self, notes, diagrams=None, voice=None, style=None, duration_per_slide=5):
    """Background task to generate a video presentation from notes (and optional diagrams)."""
    try:
        service = VisualGenerationService()
        video_path = service.generate_presentation(
            notes=notes,
            diagrams=diagrams,
            voice=voice,
            style=style,
            duration_per_slide=duration_per_slide
        )
        return {"status": "SUCCESS", "video_path": video_path}
    except Exception as e:
        return {"status": "FAILURE", "error": str(e)}
