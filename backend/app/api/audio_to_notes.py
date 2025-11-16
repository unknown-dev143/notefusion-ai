from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import os
import tempfile
from pydub import AudioSegment, effects

# Import local modules
from ..services.whisper_service import WhisperTranscriber
from ..services.fusion_service import FusionService

router = APIRouter()
transcriber = WhisperTranscriber()
fusion_service = FusionService()

def preprocess_audio(audio_path: str) -> str:
    try:
        audio = AudioSegment.from_file(audio_path)
        audio = effects.normalize(audio)
        cleaned_path = audio_path.replace('.mp3', '_cleaned.mp3')
        audio.export(cleaned_path, format='mp3')
        return cleaned_path
    except Exception as e:
        print(f'[AudioPreprocess] Failed: {e}')
        return audio_path

@router.post("/api/audio-to-notes")
async def audio_to_notes(file: UploadFile = File(...)):
    try:
        suffix = os.path.splitext(file.filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp:
            contents = await file.read()
            temp.write(contents)
            temp.flush()
            temp_path = temp.name
        cleaned_path = preprocess_audio(temp_path)
        transcript = transcriber.transcribe(cleaned_path)
        # Use your AI note generation (FusionService) to create notes from transcript
        notes = fusion_service.generate_notes_from_text(transcript)
        os.remove(temp_path)
        if cleaned_path != temp_path:
            os.remove(cleaned_path)
        return JSONResponse({"transcript": transcript, "notes": notes})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio-to-notes failed: {str(e)}")
