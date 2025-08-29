"""
API routes package for NoteFusion AI.

This module imports and includes all API route modules.
"""

# Import all route modules here
from .endpoints import audio_upload, audio_to_notes, video_jobs, ai_models, video
from .endpoints.ai_settings import router as ai_settings_router
from .routes import audio as audio_routes

# List of all routers to be included in the main FastAPI app
routers = [
    audio_upload.router,
    audio_to_notes.router,
    video_jobs.router,
    ai_models.router,
    ai_settings_router,
    video.router,  # Add video generation endpoints
    audio_routes.router,  # Add audio processing endpoints
]