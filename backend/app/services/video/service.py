<<<<<<< HEAD
"""Video generation service for NoteFusion AI."""
import os
import uuid
import logging
from pathlib import Path
from typing import Dict, Any, Optional, List, Callable
=======
import os
import uuid
import logging
import subprocess
from datetime import datetime
from typing import Dict, Any, Optional, List, Tuple
from pathlib import Path
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e

from sqlalchemy.orm import Session

from ...schemas.video import VideoGenerationRequest, VideoStyle, VideoVoice
from ...models.task import Task, TaskStatus, TaskType
from ...crud.task import create_task, update_task_status, get_task
from ...core.config import settings

<<<<<<< HEAD
from .ffmpeg_service import FFmpegVideoService
from .tts import tts_client

=======
# Import the FFmpeg video service
from .ffmpeg_service import FFmpegVideoService

# Configure logging
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
logger = logging.getLogger(__name__)

class VideoGenerationService:
    """Service for generating videos from text content."""
    
    def __init__(self, db: Session):
        self.db = db
<<<<<<< HEAD
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
=======
        self.output_dir = Path(settings.VIDEO_OUTPUT_DIR) if hasattr(settings, 'VIDEO_OUTPUT_DIR') else Path("data/videos")
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize FFmpeg service
        self.ffmpeg_service = FFmpegVideoService(output_dir=str(self.output_dir))
    
    async def generate_video(self, request: VideoGenerationRequest, user_id: str) -> Dict[str, Any]:
        """
        Start a video generation task.
        
        Args:
            request: Video generation request details
            user_id: ID of the user making the request
            
        Returns:
            Dictionary containing task information
        """
        try:
            # Create a unique task ID
            task_id = str(uuid.uuid4())
            
            # Create task record in the database
            task = create_task(
                db=self.db,
                task_id=task_id,
                user_id=user_id,
                task_type=TaskType.VIDEO_GENERATION,
                status=TaskStatus.PENDING,
                input_data={
                    "title": request.title,
                    "description": request.description,
                    "style": request.style,
                    "voice": request.voice,
                    "duration_per_slide": request.duration_per_slide,
                    "include_captions": request.include_captions,
                    "metadata": request.metadata or {}
                }
            )
            
            # In a real implementation, you would start a background task here
            # For now, we'll just update the task status
            self._process_video_generation(task_id, request, user_id)
            
            return {
                "task_id": task_id,
                "status": TaskStatus.PENDING,
                "message": "Video generation task has been queued",
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
                "created_at": task.created_at.isoformat()
            }
            
        except Exception as e:
<<<<<<< HEAD
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
=======
            logger.error(f"Error creating video generation task: {str(e)}")
            raise
    
    def _process_video_generation(self, task_id: str, request: VideoGenerationRequest, user_id: str):
        """
        Process video generation in the background.
        
        In a production environment, this would be run in a separate process/worker.
        """
        try:
            # Update task status to processing
            update_task_status(
                db=self.db,
                task_id=task_id,
                status=TaskStatus.PROCESSING,
                result_data={"progress": 0}
            )
            
            # Generate a unique filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_filename = f"video_{timestamp}_{task_id[:8]}.mp4"
            
            # Map style to FFmpeg parameters
            style_config = self._get_style_config(request.style)
            
            # Update progress
            update_task_status(
                db=self.db,
                task_id=task_id,
                status=TaskStatus.PROCESSING,
                result_data={"progress": 25}
            )
            
            # Generate the video using FFmpeg
            video_path = self.ffmpeg_service.generate_video(
                text=request.content,
                output_filename=output_filename,
                width=style_config["width"],
                height=style_config["height"],
                duration=request.duration_seconds or 10,  # Default to 10 seconds if not specified
                background_color=style_config["background_color"],
                font_color=style_config["font_color"],
                font_size=style_config["font_size"]
            )
            
            if not video_path or not video_path.exists():
                raise Exception("Failed to generate video file")
            
            # Update progress
            update_task_status(
                db=self.db,
                task_id=task_id,
                status=TaskStatus.PROCESSING,
                result_data={"progress": 90}
            )
            
            # Prepare result data
            result_data = {
                "progress": 100,
                "video_path": str(video_path.relative_to(self.output_dir)),
                "file_size": video_path.stat().st_size,
                "duration": request.duration_seconds or 10,
                "video_url": f"/api/videos/download/{task_id}"
            }
            
            # Update task with final result
            update_task_status(
                db=self.db,
                task_id=task_id,
                status=TaskStatus.COMPLETED,
                result=result_data,
                result_data=result_data
            )
            
        except subprocess.CalledProcessError as e:
            error_msg = f"FFmpeg command failed with return code {e.returncode}"
            if e.stderr:
                error_msg += f"\nError: {e.stderr.decode('utf-8')}"
            logger.error(error_msg)
            update_task_status(
                db=self.db,
                task_id=task_id,
                status=TaskStatus.FAILED,
                error_message=error_msg
            )
            
        except Exception as e:
            error_msg = f"Error generating video: {str(e)}"
            logger.error(error_msg, exc_info=True)
            update_task_status(
                db=self.db,
                task_id=task_id,
                status=TaskStatus.FAILED,
                error_message=error_msg
            )
    
    def _get_style_config(self, style: VideoStyle) -> Dict[str, Any]:
        """Get FFmpeg parameters based on video style."""
        styles = {
            VideoStyle.DEFAULT: {
                "width": 1280,
                "height": 720,
                "background_color": "navy",
                "font_color": "white",
                "font_size": 40
            },
            VideoStyle.PRESENTATION: {
                "width": 1280,
                "height": 720,
                "background_color": "#1a237e",  # Dark blue
                "font_color": "white",
                "font_size": 42
            },
            VideoStyle.TUTORIAL: {
                "width": 1280,
                "height": 720,
                "background_color": "#0d47a1",  # Blue
                "font_color": "white",
                "font_size": 38
            },
            VideoStyle.EXPLAINER: {
                "width": 1080,
                "height": 1920,  # Vertical for mobile
                "background_color": "#1e88e5",  # Light blue
                "font_color": "white",
                "font_size": 44
            },
            VideoStyle.PODCAST: {
                "width": 1920,
                "height": 1080,
                "background_color": "black",
                "font_color": "white",
                "font_size": 48
            }
        }
        
        return styles.get(style, styles[VideoStyle.DEFAULT])
    
    def get_video_status(self, task_id: str, user_id: str) -> Dict[str, Any]:
        """
        Get the status of a video generation task.
        
        Args:
            task_id: ID of the task to check
            user_id: ID of the user making the request
            
        Returns:
            Dictionary containing task status and details
        """
        task = get_task(self.db, task_id=task_id, user_id=user_id)
        if not task:
            return None
        
        response = {
            "task_id": task.task_id,
            "status": task.status,
            "message": f"Video generation is {task.status}",
            "created_at": task.created_at.isoformat(),
            "updated_at": task.updated_at.isoformat() if task.updated_at else None,
            "completed_at": task.completed_at.isoformat() if task.completed_at else None,
            "error": task.error_message
        }
        
        # Add additional data from result_data if available
        if task.result_data:
            response.update(task.result_data)
            
        return response
    
    def get_video_file(self, task_id: str, user_id: str) -> Optional[Path]:
        """
        Get the path to a generated video file.
        
        Args:
            task_id: ID of the task
            user_id: ID of the user making the request
            
        Returns:
            Path to the video file if it exists, None otherwise
        """
        task = get_task(self.db, task_id=task_id, user_id=user_id)
        if not task or task.status != TaskStatus.COMPLETED or not task.result_data:
            return None
            
        video_path = task.result_data.get("video_path")
        if not video_path or not os.path.exists(video_path):
            return None
            
        return Path(video_path)
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
