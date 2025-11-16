"""
API endpoints for audio note summarization.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models
from app.api import deps
from app.schemas.audio_summary import AudioSummaryRequest, AudioSummaryResponse
from app.services.audio_summarizer import audio_summarizer

router = APIRouter()

@router.post("/summarize", response_model=AudioSummaryResponse)
async def summarize_audio_note(
    request: AudioSummaryRequest,
    current_user: models.User = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db),
):
    """
    Generate a summary for an audio note.
    
    This endpoint generates different types of summaries (concise, detailed, bullet points)
    from the transcription of an audio note.
    """
    try:
        return await audio_summarizer.generate_summary(db, request, current_user)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating summary: {str(e)}"
        )

@router.post("/{note_id}/summarize", response_model=AudioSummaryResponse)
async def summarize_audio_note_by_id(
    note_id: int,
    style: str = "concise",
    max_length: int = 250,
    current_user: models.User = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db),
):
    """
    Generate a summary for a specific audio note by ID.
    
    This is a convenience endpoint that wraps the main summarize endpoint.
    """
    request = AudioSummaryRequest(
        note_id=note_id,
        style=style,
        max_length=max_length
    )
    return await summarize_audio_note(request, current_user, db)
