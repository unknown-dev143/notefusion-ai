import os
import logging
from pathlib import Path
from typing import Dict, Any, Optional, List, Tuple
from celery import shared_task
from celery.exceptions import Reject
from sqlalchemy.orm import Session

from ...core.config import settings
from ...db.session import SessionLocal
from ...models.task import Task, TaskStatus, TaskType
from ...crud.task import get_task, update_task_status
from ...services.video.service import VideoGenerationService
from ...services.video.ffmpeg_service import FFmpegVideoService

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3, default_retry_delay=60, time_limit=3600)
def process_video_generation(self, task_id: str, request_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Background task to process video generation.
    
    Args:
        task_id: The ID of the task to process
        request_data: Video generation request data
        
    Returns:
        Dict containing task result information
    """
    db = SessionLocal()
    try:
        # Get the task from the database
        task = get_task(db, task_id=task_id)
        if not task:
            logger.error(f"Task {task_id} not found")
            raise Reject(f"Task {task_id} not found", requeue=False)
            
        # Update task status to processing
        update_task_status(
            db=db,
            task_id=task_id,
            status=TaskStatus.PROCESSING,
            result_data={"progress": 0, "status": "Initializing video generation"}
        )
        
        # Initialize services
        video_service = VideoGenerationService(db)
        
        # Create a progress callback function
        def progress_callback(progress: float, status: str):
            # Update task progress in the database
            update_task_status(
                db=db,
                task_id=task_id,
                status=TaskStatus.PROCESSING,
                result_data={"progress": progress, "status": status}
            )
            # Also update the Celery task state
            self.update_state(
                state='PROGRESS',
                meta={'progress': progress, 'status': status}
            )
        
        # Process the video generation
        result = video_service._process_video_generation(
            task_id=task_id,
            request=request_data,
            user_id=task.user_id,
            progress_callback=progress_callback
        )
        
        # Update task status to completed
        update_task_status(
            db=db,
            task_id=task_id,
            status=TaskStatus.COMPLETED,
            result_data={
                **result,
                "progress": 100,
                "status": "Video generation completed"
            }
        )
        
        return {
            "task_id": task_id,
            "status": TaskStatus.COMPLETED,
            "result": result
        }
        
    except Exception as exc:
        logger.error(f"Video generation failed for task {task_id}: {str(exc)}", exc_info=True)
        
        # Update task status to failed
        if 'task_id' in locals() and 'db' in locals():
            update_task_status(
                db=db,
                task_id=task_id,
                status=TaskStatus.FAILED,
                error_message=str(exc)
            )
        
        # Retry the task if we haven't exceeded max retries
        if self.request.retries < self.max_retries:
            raise self.retry(exc=exc, countdown=self.default_retry_delay * (2 ** self.request.retries))
        else:
            raise Reject(exc, requeue=False)
            
    finally:
        if 'db' in locals():
            db.close()

@shared_task
def cleanup_video_files(file_paths: List[str]) -> None:
    """
    Clean up temporary video files.
    
    Args:
        file_paths: List of file paths to clean up
    """
    for file_path in file_paths:
        try:
            if file_path and os.path.exists(file_path):
                os.unlink(file_path)
                logger.info(f"Cleaned up temporary file: {file_path}")
        except Exception as e:
            logger.error(f"Failed to clean up file {file_path}: {str(e)}")
            continue
