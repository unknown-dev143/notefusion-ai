"""Video generation service for NoteFusion AI."""
import os
import uuid
import logging
from pathlib import Path
from typing import Dict, Any, Optional, List, Callable

from sqlalchemy.orm import Session

from ...schemas.video import VideoGenerationRequest, VideoStyle, VideoVoice
from ...models.task import Task, TaskStatus, TaskType
from ...crud.task import create_task, update_task_status, get_task
from ...core.config import settings

from .ffmpeg_service import FFmpegVideoService
from .tts import tts_client

logger = logging.getLogger(__name__)

class VideoGenerationService:
    """Service for generating videos from text content."""
    
    def __init__(self, db: Session):
        self.db = db
        self.output_dir = Path(getattr(settings, 'VIDEO_OUTPUT_DIR', 'data/videos'))
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.ffmpeg_service = FFmpegVideoService(output_dir=str(self.output_dir))
    
    async def generate_video(
        self, 
        request: VideoGenerationRequest, 
        user_id: str
    ) -> Dict[str, Any]:
        """Start a video generation task.
        
        Args:
            request: Video generation request
            user_id: ID of the user making the request
            
        Returns:
            Dictionary with task ID and status
        """
        task_id = str(uuid.uuid4())
        task_data = request.dict()
        
        # Create task in database
        task = create_task(
            db=self.db,
            task_id=task_id,
            user_id=user_id,
            task_type=TaskType.VIDEO_GENERATION,
            status=TaskStatus.PENDING,
            input_data=task_data,
            result_data={"progress": 0, "status": "Starting video generation"}
        )
        
        try:
            self.db.commit()
            
            # Start background task
            self._process_video_generation.delay(
                task_id=task_id,
                request_data=task_data,
                user_id=user_id
            )
            
            return {
                "task_id": task_id,
                "status": TaskStatus.PENDING,
                "message": "Video generation started",
                "created_at": task.created_at.isoformat()
            }
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to start video generation: {str(e)}", exc_info=True)
            raise
    
    def _process_video_generation(
        self,
        task_id: str,
        request_data: Dict[str, Any],
        user_id: str
    ) -> None:
        """Process video generation in a background task."""
        try:
            # Update task status
            self._update_task_status(
                task_id=task_id,
                status=TaskStatus.PROCESSING,
                progress=10,
                status_message="Preparing slides"
            )
            
            # Generate slides from script
            slides = self._generate_slides(
                script=request_data["script"],
                style=request_data["style"],
                duration_per_slide=request_data.get("duration_per_slide", 5)
            )
            
            # Generate narration if needed
            narration_audio = None
            if request_data.get("include_narration", True):
                self._update_task_status(
                    task_id=task_id,
                    progress=30,
                    status_message="Generating narration"
                )
                
                narration_text = " ".join(slide.get("content", "") for slide in slides)
                if narration_text.strip():
                    narration_audio = self._generate_narration(
                        text=narration_text,
                        voice=request_data.get("voice", VideoVoice.NEUTRAL)
                    )
            
            # Generate video
            self._update_task_status(
                task_id=task_id,
                progress=60,
                status_message="Generating video"
            )
            
            output_filename = f"{task_id}.mp4"
            video_path = self.ffmpeg_service.generate_video(
                slides=slides,
                output_filename=output_filename,
                narration_audio=narration_audio,
                progress_callback=lambda p: self._update_progress(task_id, 60 + int(p * 0.4))
            )
            
            # Update task with result
            self._update_task_status(
                task_id=task_id,
                status=TaskStatus.COMPLETED,
                progress=100,
                status_message="Video generation completed",
                result={
                    "video_path": str(video_path.relative_to(self.output_dir)),
                    "video_url": f"/api/videos/{task_id}/download"
                }
            )
            
        except Exception as e:
            logger.error(f"Video generation failed: {str(e)}", exc_info=True)
            self._update_task_status(
                task_id=task_id,
                status=TaskStatus.FAILED,
                error_message=str(e)
            )
    
    def _generate_slides(
        self,
        script: str,
        style: VideoStyle,
        duration_per_slide: int = 5
    ) -> List[Dict[str, Any]]:
        """Convert script into slides with styling."""
        # Simple implementation - split by double newlines
        paragraphs = [p.strip() for p in script.split('\n\n') if p.strip()]
        
        slides = []
        for i, content in enumerate(paragraphs):
            is_title = i == 0 and len(content) < 100  # First short paragraph is title
            
            slide = {
                "content": content,
                "duration": duration_per_slide,
                "style": self._get_slide_style(style, is_title=is_title)
            }
            slides.append(slide)
        
        return slides
    
    def _get_slide_style(
        self,
        style: VideoStyle,
        is_title: bool = False
    ) -> Dict[str, Any]:
        """Get style configuration for a slide."""
        base_styles = {
            VideoStyle.PROFESSIONAL: {
                "background_color": "#1a1a2e",
                "font_color": "#ffffff",
                "font_size": 40 if not is_title else 60
            },
            VideoStyle.EDUCATIONAL: {
                "background_color": "#f8f9fa",
                "font_color": "#212529",
                "font_size": 36 if not is_title else 48
            },
            VideoStyle.CASUAL: {
                "background_color": "#ffffff",
                "font_color": "#2d3436",
                "font_size": 32 if not is_title else 44
            }
        }
        
        return base_styles.get(style, base_styles[VideoStyle.PROFESSIONAL])
    
    def _generate_narration(
        self,
        text: str,
        voice: VideoVoice = VideoVoice.NEUTRAL
    ) -> Optional[str]:
        """Generate narration audio using TTS."""
        try:
            # In a real implementation, we would use the TTS client here
            # For now, we'll just return None as a placeholder
            return None
            
            # Example implementation:
            # output_path = self.output_dir / f"narration_{uuid.uuid4().hex}.mp3"
            # tts_client.synthesize_speech(
            #     text=text,
            #     voice_name=voice.value,
            #     output_path=output_path
            # )
            # return str(output_path)
            
        except Exception as e:
            logger.warning(f"Failed to generate narration: {str(e)}")
            return None
    
    def _update_task_status(
        self,
        task_id: str,
        status: TaskStatus = None,
        progress: int = None,
        status_message: str = None,
        error_message: str = None,
        result: Dict[str, Any] = None
    ) -> None:
        """Update task status in the database."""
        try:
            update_data = {}
            if status is not None:
                update_data["status"] = status
            
            result_data = {}
            task = get_task(self.db, task_id)
            if task.result_data:
                result_data.update(task.result_data)
            
            if progress is not None:
                result_data["progress"] = progress
            if status_message:
                result_data["status"] = status_message
            if error_message:
                result_data["error"] = error_message
            if result:
                result_data["result"] = result
            
            if result_data:
                update_data["result_data"] = result_data
            
            if update_data:
                update_task_status(
                    db=self.db,
                    task_id=task_id,
                    **update_data
                )
                self.db.commit()
                
        except Exception as e:
            logger.error(f"Failed to update task status: {str(e)}", exc_info=True)
            self.db.rollback()
    
    def _update_progress(self, task_id: str, progress: int) -> None:
        """Update task progress."""
        self._update_task_status(
            task_id=task_id,
            progress=progress,
            status_message=f"Processing ({progress}%)"
        )
    
    def get_video_status(self, task_id: str, user_id: str) -> Dict[str, Any]:
        """Get the status of a video generation task."""
        task = get_task(self.db, task_id)
        if not task or task.user_id != user_id:
            raise ValueError("Task not found or access denied")
        
        result = {
            "task_id": task.id,
            "status": task.status,
            "created_at": task.created_at.isoformat(),
            "updated_at": task.updated_at.isoformat()
        }
        
        if task.result_data:
            result.update(task.result_data)
        
        return result
