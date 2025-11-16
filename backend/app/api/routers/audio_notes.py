"""
API router for audio notes and related functionality.
"""
from fastapi import APIRouter
from app.api.endpoints import audio_notes, audio_summary

router = APIRouter()

# Include the audio notes endpoints
router.include_router(
    audio_notes.router,
    prefix="/audio/notes",
    tags=["audio-notes"]
)

# Include the audio summarization endpoints
router.include_router(
    audio_summary.router,
    prefix="/audio/notes",
    tags=["audio-summaries"]
)
