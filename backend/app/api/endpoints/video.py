from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status, Query
from fastapi.responses import FileResponse, StreamingResponse
from typing import Optional, Dict, Any, List
import os
import uuid
from datetime import datetime
from pathlib import Path

from sqlalchemy.orm import Session

from ...core.security import get_current_active_user
from ...models.task import TaskStatus, TaskType
from ...crud.task import create_task, update_task_status, get_task, list_tasks
from ...models.database import get_db
from ...schemas.video import (
    VideoGenerationRequest,
    VideoGenerationResponse,
    VideoStatusResponse
)
from ...services.video.service import VideoGenerationService

router = APIRouter(prefix="/video", tags=["video"])

@router.post("/generate", response_model=VideoGenerationResponse, status_code=status.HTTP_202_ACCEPTED)
async def generate_video(
    request: VideoGenerationRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Generate a video presentation from the provided content.
    
    This endpoint starts an asynchronous task to generate a video and returns a task ID
    that can be used to check the status and retrieve the result.
    
    - **title**: Title of the video
    - **description**: Optional description
    - **script**: The main content/script for the video
    - **style**: Visual style (professional, educational, casual, minimalist)
    - **voice**: Voice type for narration (male, female, neutral)
    - **duration_per_slide**: Duration in seconds for each slide (3-60)
    - **include_captions**: Whether to include captions
    - **metadata**: Additional metadata for the video generation
    """
    try:
        video_service = VideoGenerationService(db)
        response = await video_service.generate_video(request, current_user["id"])
        return response
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start video generation: {str(e)}"
        )

@router.get("/status/{task_id}", response_model=VideoStatusResponse)
async def get_video_status(
    task_id: str,
    current_user: dict = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get the status of a video generation task.
    
    - **task_id**: The ID of the task to check
    - Returns: Current status, progress, and result if available
    """
    try:
        video_service = VideoGenerationService(db)
        status_info = video_service.get_video_status(task_id, current_user["id"])
        
        if not status_info:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found or access denied"
            )
            
        return status_info
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get task status: {str(e)}"
        )

@router.get("/download/{task_id}")
async def download_video(
    task_id: str,
    current_user: dict = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Download the generated video file.
    
    - **task_id**: The ID of the completed video generation task
    - Returns: The video file as a downloadable attachment
    """
    try:
        video_service = VideoGenerationService(db)
        video_path = video_service.get_video_file(task_id, current_user["id"])
        
        if not video_path or not video_path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Video file not found or not ready"
            )
            
        return FileResponse(
            video_path,
            media_type="video/mp4",
            filename=f"video_{task_id}{video_path.suffix}",
            headers={"Content-Disposition": f"attachment; filename=video_{task_id}{video_path.suffix}"}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to download video: {str(e)}"
        )

@router.get("/list", response_model=List[Dict[str, Any]])
async def list_video_tasks(
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(10, ge=1, le=100, description="Number of items to return"),
    current_user: dict = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    List video generation tasks for the current user.
    
    - **skip**: Number of items to skip (for pagination)
    - **limit**: Maximum number of items to return (1-100)
    - Returns: List of task summaries
    """
    try:
        tasks = list_tasks(
            db=db,
            user_id=current_user["id"],
            task_type=TaskType.VIDEO_GENERATION,
            skip=skip,
            limit=limit
        )
        
        return [
            {
                "task_id": task.task_id,
                "status": task.status,
                "created_at": task.created_at.isoformat(),
                "updated_at": task.updated_at.isoformat(),
                "title": (task.input_data or {}).get("title") if task.input_data else None,
                "progress": (task.result_data or {}).get("progress") if task.result_data else None
            }
            for task in tasks
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list tasks: {str(e)}"
        )

# Background task to process video generation
# This is now handled by the VideoGenerationService._process_video_generation method
