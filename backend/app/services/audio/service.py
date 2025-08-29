"""
Audio Service
------------
Provides comprehensive audio processing functionality including:
- Text-to-speech (TTS)
- Speech-to-text (STT)
- Audio recording management
- Transcription services
- Audio processing utilities
"""
import os
import wave
import time
import json
import uuid
import hashlib
import io
import logging
from pathlib import Path
from typing import Optional, Union, BinaryIO, Tuple, Dict, Any, List
import tempfile

import speech_recognition as sr
from gtts import gTTS
from pydub import AudioSegment

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AudioService:
    """Service for handling all audio-related operations."""
    
    def __init__(self, output_dir: str = "data/audio"):
        """
        Initialize the audio service with required directories.
        
        Args:
            output_dir: Base directory for storing all audio files
        """
        self.output_dir = Path(output_dir)
        self.recordings_dir = self.output_dir / "recordings"
        self.tts_dir = self.output_dir / "tts"
        self.transcripts_dir = self.output_dir / "transcripts"
        
        # Create necessary directories
        for directory in [self.recordings_dir, self.tts_dir, self.transcripts_dir]:
            directory.mkdir(parents=True, exist_ok=True)
            
        # Initialize speech recognizer
        self.recognizer = sr.Recognizer()
    
    async def text_to_speech(
        self,
        text: str,
        lang: str = 'en',
        slow: bool = False,
        filename: Optional[str] = None,
        save: bool = True
    ) -> Tuple[Union[str, bytes], str]:
        """
        Convert text to speech.
        
        Args:
            text: The text to convert to speech
            lang: Language code (e.g., 'en', 'es', 'fr')
            slow: Whether to speak slowly
            filename: Optional custom filename (without extension)
            save: Whether to save to file or return bytes
            
        Returns:
            Tuple of (filepath or audio data, content_type)
        """
        try:
            # Generate speech
            tts = gTTS(text=text, lang=lang, slow=slow)
            
            if save:
                # Generate filename if not provided
                if not filename:
                    filename = f"tts_{int(time.time())}_{hashlib.md5(text.encode()).hexdigest()[:8]}"
                
                # Save to file
                filepath = self.tts_dir / f"{filename}.mp3"
                tts.save(str(filepath))
                return str(filepath), 'audio/mp3'
            else:
                # Return audio data as bytes
                audio_bytes = io.BytesIO()
                tts.write_to_fp(audio_bytes)
                return audio_bytes.getvalue(), 'audio/mp3'
                
        except Exception as e:
            logger.error(f"TTS conversion failed: {e}")
            raise RuntimeError(f"TTS conversion failed: {str(e)}")
    
    async def transcribe(
        self,
        audio_path: str,
        language: str = 'en-US'
    ) -> str:
        """
        Transcribe audio file to text.
        
        Args:
            audio_path: Path to audio file
            language: Language code (e.g., 'en-US', 'es-ES')
            
        Returns:
            Transcribed text
        """
        try:
            # Load audio file
            with sr.AudioFile(audio_path) as source:
                audio_data = self.recognizer.record(source)
                
            # Recognize speech using Google Web Speech API
            text = self.recognizer.recognize_google(audio_data, language=language)
            
            # Save transcript
            transcript_id = str(uuid.uuid4())
            transcript_path = self.transcripts_dir / f"{transcript_id}.txt"
            with open(transcript_path, 'w', encoding='utf-8') as f:
                f.write(text)
                
            return text
            
        except Exception as e:
            logger.error(f"Transcription failed: {e}")
            raise RuntimeError(f"Transcription failed: {str(e)}")
    
    async def process_audio_note(
        self,
        audio_file: Union[str, BinaryIO],
        language: str = 'en-US',
        save_audio: bool = True
    ) -> Dict[str, Any]:
        """
        Process an audio note (recorded or uploaded).
        
        Args:
            audio_file: Path to audio file or file-like object
            language: Language code for transcription
            save_audio: Whether to save the audio file
            
        Returns:
            Dictionary containing processing results
        """
        try:
            # Save the audio file if needed
            if save_audio and isinstance(audio_file, (str, Path)):
                audio_path = Path(audio_file)
            else:
                # Save uploaded file
                audio_path = self.recordings_dir / f"{uuid.uuid4()}.wav"
                with open(audio_path, 'wb') as f:
                    if hasattr(audio_file, 'read'):
                        f.write(audio_file.read())
                    else:
                        f.write(audio_file)
            
            # Transcribe the audio
            text = await self.transcribe(str(audio_path), language)
            
            # Get audio duration
            duration = self._get_audio_duration(audio_path)
            
            return {
                'status': 'success',
                'audio_path': str(audio_path) if save_audio else None,
                'transcription': text,
                'duration': duration,
                'language': language,
                'timestamp': time.time()
            }
            
        except Exception as e:
            logger.error(f"Audio note processing failed: {e}")
            return {
                'status': 'error',
                'message': str(e)
            }
    
    def _get_audio_duration(self, audio_path: Union[str, Path]) -> float:
        """
        Get the duration of an audio file in seconds.
        
        Args:
            audio_path: Path to the audio file
            
        Returns:
            Duration in seconds (0 if unable to determine)
        """
        try:
            audio = AudioSegment.from_file(audio_path)
            return len(audio) / 1000.0  # Convert to seconds
        except Exception as e:
            logger.warning(f"Could not get audio duration: {e}")
            return 0.0
    
    async def generate_audio_flashcards(
        self,
        text: str,
        language: str = 'en'
    ) -> List[Dict[str, Any]]:
        """
        Generate audio flashcards from text.
        
        Args:
            text: Input text to generate flashcards from
            language: Language code for TTS
            
        Returns:
            List of flashcards with audio and text
        """
        # Simple implementation - split text into sentences
        # In a real app, you'd use NLP to identify key concepts
        sentences = [s.strip() for s in text.split('.') if s.strip()]
        
        flashcards = []
        for i, sentence in enumerate(sentences[:10]):  # Limit to 10 flashcards
            if not sentence:
                continue
                
            try:
                audio_path = await self.text_to_speech(
                    text=sentence,
                    lang=language,
                    filename=f"flashcard_{i+1}",
                    save=True
                )
                
                flashcards.append({
                    'id': str(uuid.uuid4()),
                    'text': sentence,
                    'audio_path': audio_path[0],
                    'language': language
                })
            except Exception as e:
                logger.error(f"Error generating flashcard {i+1}: {e}")
        
        return flashcards
        """
        Convert speech to text.
        
        Args:
            audio_source: Path to audio file or file-like object
            language: Language code (e.g., 'en-US', 'es-ES')
            
        Returns:
            The transcribed text
            
        Raises:
            RuntimeError: If speech recognition fails
        """
        try:
            import speech_recognition as sr
            
            recognizer = sr.Recognizer()
            
            # Handle both file paths and file-like objects
            if isinstance(audio_source, (str, Path)):
                with sr.AudioFile(str(audio_source)) as source:
                    audio_data = recognizer.record(source)
            else:
                # For file-like objects, we need to save to a temporary file first
                import tempfile
                with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp:
                    tmp.write(audio_source.read())
                    tmp_path = tmp.name
                
                try:
                    with sr.AudioFile(tmp_path) as source:
                        audio_data = recognizer.record(source)
                finally:
                    os.unlink(tmp_path)
            
            # Perform speech recognition
            return recognizer.recognize_google(audio_data, language=language)
            
        except sr.UnknownValueError:
            raise RuntimeError("Could not understand audio")
        except sr.RequestError as e:
            raise RuntimeError(f"Speech recognition service error: {str(e)}")
        except Exception as e:
            raise RuntimeError(f"Speech recognition failed: {str(e)}")

# Create a default instance for easy importing
audio_service = AudioService()
