import os
import logging
from pathlib import Path
from typing import List,  Dict, Any, Optional
from celery import shared_task
from celery.exceptions import Reject
from ...services.visual.service import VisualGenerationService
from ...config import settings

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def generate_video_task(self, video_data: Dict[str, Any]) -> str:
    """
    Background task to generate a video from the given data.
    
    Args:
        video_data: Dictionary containing video generation parameters
            - notes: Structured notes for video content
            - diagrams: List of diagrams to include
            - voice: Voice for narration
            - style: Visual style for the video
            - output_format: Output format (mp4, gif, etc.)
            
    Returns:
        str: Path to the generated video file
    """
    try:
        # Update task state
        self.update_state(state='PROGRESS', meta={'status': 'Initializing'})
        
        # Initialize the visual generation service
        visual_service = VisualGenerationService()
        
        # Create output directory if it doesn't exist
        output_dir = Path(settings.EXPORT_DIR) / 'videos'
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate video
        self.update_state(state='PROGRESS', meta={'status': 'Generating video'})
        output_path = visual_service.generate_presentation(
            notes=video_data.get('notes', ''),
            diagrams=video_data.get('diagrams', []),
            voice=video_data.get('voice', 'default'),
            style=video_data.get('style', 'default'),
            output_dir=str(output_dir),
            on_progress=lambda p: self.update_state(
                state='PROGRESS', 
                meta={'status': 'Generating', 'progress': p}
            )
        )
        
        return str(output_path)
        
    except Exception as exc:
        logger.error(f"Video generation failed: {str(exc)}", exc_info=True)
        raise self.retry(exc=exc)

@shared_task
def cleanup_video_file(file_path: str) -> None:
    """
    Background task to clean up temporary video files.
    
    Args:
        file_path: Path to the file to be deleted
    """
    try:
        if os.path.exists(file_path):
            os.unlink(file_path)
            logger.info(f"Cleaned up temporary video file: {file_path}")
    except Exception as e:
        logger.error(f"Failed to clean up video file {file_path}: {str(e)}")
        raise Reject(e, requeue=False)

@shared_task
def get_video_generation_status(task_id: str) -> Dict[str, Any]:
    """
    Get the status of a video generation task.
    
    Args:
        task_id: The Celery task ID to check
        
    Returns:
        Dict containing task status and result if available
    """
    from celery.result import AsyncResult
    from ... import celery_app
    
    task = AsyncResult(task_id, app=celery_app)
    
    response = {
        'task_id': task_id,
        'status': task.status,
        'result': task.result if task.ready() else None
    }
    
    if task.status == 'PROGRESS':
        response['progress'] = task.info.get('progress', 0)
        response['status_text'] = task.info.get('status', 'In progress')
    
    return response
