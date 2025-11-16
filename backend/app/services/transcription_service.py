<<<<<<< HEAD
import asyncio
import json
from datetime import datetime
from typing import Optional, Dict, Any, List
import os

# Try to import whisper, but provide fallback if not available
try:
    import whisper
    WHISPER_AVAILABLE = True
except ImportError:
    WHISPER_AVAILABLE = False
    print("Warning: Whisper not available. Transcription will use fallback methods.")

class TranscriptionService:
    def __init__(self):
        self.model = None
        self.whisper_available = WHISPER_AVAILABLE
        if self.whisper_available:
            try:
                # Load whisper model (this might take time on first run)
                self.model = whisper.load_model("base")
            except Exception as e:
                print(f"Warning: Could not load Whisper model: {e}")
                self.whisper_available = False
    
    async def transcribe_audio(self, file_path: str) -> str:
        """Transcribe audio file to text"""
        if not self.whisper_available:
            # Fallback: return placeholder text
            return f"[Transcription placeholder for {file_path}] - Whisper not available. Please install openai-whisper package."
        
        try:
            # Use whisper for transcription
            result = self.model.transcribe(file_path)
            return result["text"]
        except Exception as e:
            print(f"Error transcribing {file_path}: {e}")
            return f"[Transcription error: {str(e)}]"
    
    async def transcribe_with_timestamps(self, file_path: str) -> Dict[str, Any]:
        """Transcribe audio with timestamps"""
        if not self.whisper_available:
            return {
                "text": f"[Transcription placeholder for {file_path}]",
                "segments": [],
                "language": "en"
            }
        
        try:
            result = self.model.transcribe(file_path, word_timestamps=True)
            return result
        except Exception as e:
            print(f"Error transcribing with timestamps {file_path}: {e}")
            return {
                "text": f"[Transcription error: {str(e)}]",
                "segments": [],
                "language": "en"
            }
    
    async def transcribe_chunk(self, audio_chunk: bytes) -> str:
        """Transcribe a chunk of audio data (for live recording)"""
        if not self.whisper_available:
            return "[Live transcription not available - Whisper not installed]"
        
        try:
            # Save chunk to temporary file
            temp_path = f"temp_chunk_{datetime.now().timestamp()}.wav"
            with open(temp_path, "wb") as f:
                f.write(audio_chunk)
            
            # Transcribe
            result = self.model.transcribe(temp_path)
            
            # Clean up
            os.remove(temp_path)
            
            return result["text"]
        except Exception as e:
            print(f"Error transcribing chunk: {e}")
            return f"[Chunk transcription error: {str(e)}]"
    
    async def get_speaker_diarization(self, file_path: str) -> List[Dict[str, Any]]:
        """Get speaker diarization (placeholder implementation)"""
        return [
            {
                "speaker": "Speaker 1",
                "start": 0.0,
                "end": 10.0,
                "text": "Sample speaker diarization not implemented yet."
            }
        ]
    
    async def estimate_reading_time(self, text: str) -> int:
        """Estimate reading time in minutes (average 200 words per minute)"""
        word_count = len(text.split())
        return max(1, word_count // 200)
    
    async def process_live_stream(self, audio_data: bytes) -> str:
        """Process live audio stream for real-time transcription"""
=======
import asyncio
import json
from datetime import datetime
from typing import Optional, Dict, Any, List
import os

# Try to import whisper, but provide fallback if not available
try:
    import whisper
    WHISPER_AVAILABLE = True
except ImportError:
    WHISPER_AVAILABLE = False
    print("Warning: Whisper not available. Transcription will use fallback methods.")

class TranscriptionService:
    def __init__(self):
        self.model = None
        self.whisper_available = WHISPER_AVAILABLE
        if self.whisper_available:
            try:
                # Load whisper model (this might take time on first run)
                self.model = whisper.load_model("base")
            except Exception as e:
                print(f"Warning: Could not load Whisper model: {e}")
                self.whisper_available = False
    
    async def transcribe_audio(self, file_path: str) -> str:
        """Transcribe audio file to text"""
        if not self.whisper_available:
            # Fallback: return placeholder text
            return f"[Transcription placeholder for {file_path}] - Whisper not available. Please install openai-whisper package."
        
        try:
            # Use whisper for transcription
            result = self.model.transcribe(file_path)
            return result["text"]
        except Exception as e:
            print(f"Error transcribing {file_path}: {e}")
            return f"[Transcription error: {str(e)}]"
    
    async def transcribe_with_timestamps(self, file_path: str) -> Dict[str, Any]:
        """Transcribe audio with timestamps"""
        if not self.whisper_available:
            return {
                "text": f"[Transcription placeholder for {file_path}]",
                "segments": [],
                "language": "en"
            }
        
        try:
            result = self.model.transcribe(file_path, word_timestamps=True)
            return result
        except Exception as e:
            print(f"Error transcribing with timestamps {file_path}: {e}")
            return {
                "text": f"[Transcription error: {str(e)}]",
                "segments": [],
                "language": "en"
            }
    
    async def transcribe_chunk(self, audio_chunk: bytes) -> str:
        """Transcribe a chunk of audio data (for live recording)"""
        if not self.whisper_available:
            return "[Live transcription not available - Whisper not installed]"
        
        try:
            # Save chunk to temporary file
            temp_path = f"temp_chunk_{datetime.now().timestamp()}.wav"
            with open(temp_path, "wb") as f:
                f.write(audio_chunk)
            
            # Transcribe
            result = self.model.transcribe(temp_path)
            
            # Clean up
            os.remove(temp_path)
            
            return result["text"]
        except Exception as e:
            print(f"Error transcribing chunk: {e}")
            return f"[Chunk transcription error: {str(e)}]"
    
    async def get_speaker_diarization(self, file_path: str) -> List[Dict[str, Any]]:
        """Get speaker diarization (placeholder implementation)"""
        return [
            {
                "speaker": "Speaker 1",
                "start": 0.0,
                "end": 10.0,
                "text": "Sample speaker diarization not implemented yet."
            }
        ]
    
    async def estimate_reading_time(self, text: str) -> int:
        """Estimate reading time in minutes (average 200 words per minute)"""
        word_count = len(text.split())
        return max(1, word_count // 200)
    
    async def process_live_stream(self, audio_data: bytes) -> str:
        """Process live audio stream for real-time transcription"""
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
        return await self.transcribe_chunk(audio_data) 