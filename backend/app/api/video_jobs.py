from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse, FileResponse
from typing import Optional
import os
from ..services.visual.video_tasks import generate_presentation_task

router = APIRouter()

@router.post("/api/video/job")
def submit_video_job(
    notes: dict,
    diagrams: Optional[list] = None,
    voice: Optional[str] = None,
    style: Optional[str] = None,
    duration_per_slide: int = 5
):
    """Submit a background job to generate a video presentation."""
    try:
        task = generate_presentation_task.apply_async(
            args=[notes, diagrams, voice, style, duration_per_slide]
        )
        return {"job_id": task.id, "status": "PENDING"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit video job: {str(e)}")

@router.get("/api/video/job/{job_id}")
def get_video_job_status(job_id: str):
    """Check the status/result of a video generation job."""
    task = generate_presentation_task.AsyncResult(job_id)
    if task.state == "PENDING":
        return {"status": "PENDING"}
    elif task.state == "STARTED":
        return {"status": "STARTED"}
    elif task.state == "SUCCESS":
        result = task.result
        if result.get("status") == "SUCCESS":
            video_path = result.get("video_path")
            filename = os.path.basename(video_path)
            return {"status": "SUCCESS", "video_path": video_path, "filename": filename}
        else:
            return {"status": "FAILURE", "error": result.get("error")}
    elif task.state == "FAILURE":
        return {"status": "FAILURE", "error": str(task.info)}
    else:
        return {"status": task.state}

@router.get("/api/video/job/{job_id}/download")
def download_video_result(job_id: str):
    task = generate_presentation_task.AsyncResult(job_id)
    if task.state != "SUCCESS":
        raise HTTPException(status_code=400, detail="Video not ready or job failed.")
    result = task.result
    video_path = result.get("video_path")
    if not video_path or not os.path.exists(video_path):
        raise HTTPException(status_code=404, detail="Video file not found.")
    filename = os.path.basename(video_path)
    return FileResponse(path=video_path, filename=filename, media_type="video/mp4")
