"""
Audio processing API endpoints.
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Body, status
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from pathlib import Path
import os
import uuid
import json
import tempfile
from typing import Optional, List, Dict, Any
from datetime import datetime
import io
import numpy as np
from pydub import AudioSegment

from app.services.audio import AudioService
from app.services.whisper_service import get_whisper_service
from app.core.security import get_current_user
from app.models.user import User
from app.core.config import settings

router = APIRouter()

# Initialize services
audio_service = AudioService()
whisper_service = get_whisper_service()

# Audio configuration
AUDIO_UPLOAD_DIR = Path(settings.UPLOAD_DIR) / "audio"
AUDIO_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Supported audio formats
SUPPORTED_AUDIO_FORMATS = {
    "wav": "wav",
    "mp3": "mp3",
    "ogg": "ogg",
    "flac": "flac",
    "m4a": "m4a"
}

def save_audio_file(file: UploadFile) -> Path:
    """Save uploaded audio file and return the path."""
    try:
        # Generate unique filename
        file_ext = Path(file.filename).suffix.lower() if file.filename else ".wav"
        if not file_ext.startswith('.'):
            file_ext = f".{file_ext}"
            
        filename = f"{uuid.uuid4()}{file_ext}"
        file_path = AUDIO_UPLOAD_DIR / filename
        
        # Save the file
        with open(file_path, "wb") as buffer:
            content = file.file.read()
            buffer.write(content)
            
        return file_path
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save audio file: {str(e)}"
        )

@router.post("/recordings/upload")
async def upload_recording(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Upload an audio recording.
    
    This endpoint accepts audio files in various formats and saves them to the server.
    """
    try:
        file_path = save_audio_file(file)
        return {
            "status": "success",
            "file_path": str(file_path),
            "file_name": file_path.name
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process audio upload: {str(e)}"
        )

@router.post("/transcribe/chunk")
async def transcribe_audio_chunk(
    chunk: UploadFile = File(...),
    language: str = "en",
    current_user: User = Depends(get_current_user)
):
    """
    Transcribe a single audio chunk.
    
    This endpoint processes a single chunk of audio and returns its transcription.
    Useful for real-time transcription of streaming audio.
    """
    try:
        # Validate file type
        file_ext = Path(chunk.filename).suffix.lower() if chunk.filename else ""
        if not file_ext or file_ext[1:] not in SUPPORTED_AUDIO_FORMATS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file format. Supported formats: {', '.join(SUPPORTED_AUDIO_FORMATS.keys())}"
            )
        
        # Read audio data
        audio_data = await chunk.read()
        
        # Transcribe the chunk
        result = whisper_service.transcribe_audio_chunk(
            audio_data=audio_data,
            language=language
        )
        
        return {
            "status": "success",
            "transcription": result
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to transcribe audio chunk: {str(e)}"
        )

@router.post("/transcribe/chunks/complete")
async def transcribe_chunked_audio_complete(
    chunk_paths: List[str] = Body(..., embed=True),
    language: str = "en",
    current_user: User = Depends(get_current_user)
):
    """
    Transcribe multiple audio chunks as a single audio stream.
    
    This endpoint takes a list of previously uploaded audio chunk paths
    and transcribes them as a single audio stream.
    """
    try:
        # Load and validate all chunks
        audio_chunks = []
        for chunk_path in chunk_paths:
            chunk_path = Path(chunk_path)
            if not chunk_path.exists():
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Audio chunk not found: {chunk_path}"
                )
            audio_chunks.append(chunk_path.read_bytes())
        
        if not audio_chunks:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No audio chunks provided"
            )
        
        # Transcribe all chunks as a single audio stream
        result = whisper_service.transcribe_chunked_audio(
            audio_chunks=audio_chunks,
            language=language
        )
        
        return {
            "status": "success",
            "transcription": result
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to transcribe audio chunks: {str(e)}"
        )

@router.post("/transcribe")
async def transcribe_audio(
    file_path: str,
    language: Optional[str] = "en-US",
    current_user: User = Depends(get_current_user)
):
    """Transcribe audio file to text."""
    try:
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found")
        
        # Transcribe the audio
        text = await audio_service.transcribe(file_path, language)
        
        return {
            "status": "success",
            "text": text,
            "language": language
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/text-to-speech")
async def text_to_speech(
    text: str,
    language: str = "en",
    current_user: User = Depends(get_current_user)
):
    """Convert text to speech."""
    try:
        audio_path = await audio_service.text_to_speech(
            text=text,
            language=language,
            save=True
        )
        
        if not os.path.exists(audio_path):
            raise HTTPException(status_code=500, detail="Failed to generate speech")
        
        return FileResponse(
            audio_path,
            media_type="audio/mpeg",
            filename=f"tts_{int(datetime.now().timestamp())}.mp3"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
