"""
FastAPI routes for audio services with rate limiting.
"""
from fastapi import APIRouter, HTTPException, Depends, status, UploadFile, File, Request
from fastapi.responses import FileResponse, StreamingResponse
from pathlib import Path
import os
from typing import Optional, Dict, Any

from app.services.audio.service import audio_service
from app.config.audio_config import audio_settings
from app.core.security import get_current_user
from app.core.rate_limiter import rate_limited, get_rate_limiter

# Get rate limiter instance
limiter = get_rate_limiter()

router = APIRouter(prefix="/audio", tags=["audio"])

@router.post("/tts")
@limiter.limit(f"{audio_settings.RATE_LIMIT_REQUESTS} per {audio_settings.RATE_LIMIT_PERIOD} seconds")
async def text_to_speech(
    request: Request,
    text: str,
    lang: Optional[str] = None,
    slow: bool = False,
    download: bool = False,
    _: str = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Convert text to speech.
    
    - **text**: The text to convert to speech
    - **lang**: Language code (e.g., 'en', 'es')
    - **slow**: Whether to speak slowly
    - **download**: Force file download instead of streaming
    """
    try:
        filepath, content_type = audio_service.text_to_speech(
            text=text,
            lang=lang or audio_settings.TTS_DEFAULT_LANG,
            slow=slow,
            save=download
        )
        
        if download:
            return FileResponse(
                filepath,
                media_type=content_type,
                filename=os.path.basename(filepath)
            )
        else:
            return StreamingResponse(
                iter([filepath]),
                media_type=content_type
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/stt")
@limiter.limit(f"{audio_settings.RATE_LIMIT_REQUESTS} per {audio_settings.RATE_LIMIT_PERIOD} seconds")
async def speech_to_text(
    request: Request,
    audio: UploadFile = File(...),
    language: Optional[str] = None,
    _: str = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Convert speech to text.
    
    - **audio**: Audio file to transcribe
    - **language**: Language code (e.g., 'en-US', 'es-ES')
    """
    try:
        # Read the uploaded file
        contents = await audio.read()
        
        # Convert to text
        text = audio_service.speech_to_text(
            audio_source=contents,
            language=language or audio_settings.STT_DEFAULT_LANG
        )
        
        return {"text": text}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/languages")
@limiter.exempt  # No rate limiting for language list
async def get_supported_languages() -> Dict[str, Any]:
    """Get supported languages for TTS and STT."""
    return {
        "tts": ["en", "es", "fr", "de", "it", "pt", "ru", "zh-CN", "ja", "ko"],
        "stt": ["en-US", "es-ES", "fr-FR", "de-DE", "it-IT", "pt-BR", "ru-RU", "zh-CN", "ja-JP", "ko-KR"]
    }
