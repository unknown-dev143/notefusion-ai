"""
Audio processing module combining TTS and STT functionality.
"""
from pathlib import Path
from typing import Optional, Union, BinaryIO, Tuple

# Import the services
from app.services.tts.service import TTSService
from app.services.stt.service import STTService


class AudioService:
    """Unified service for audio processing (TTS and STT)."""
    
    def __init__(self, tts_output_dir: Optional[str] = None, default_language: str = "en-US"):
        """Initialize the audio service.
        
        Args:
            tts_output_dir: Directory to save TTS audio files
            default_language: Default language for both TTS and STT (e.g., 'en-US')
        """
        self.tts_service = TTSService(output_dir=tts_output_dir)
        self.stt_service = STTService(language=default_language)
        self.default_language = default_language
    
    def text_to_speech(
        self,
        text: str,
        lang: Optional[str] = None,
        slow: bool = False,
        save_path: Optional[str] = None
    ) -> str:
        """Convert text to speech and save as an audio file.
        
        Args:
            text: The text to convert to speech
            lang: Language code (e.g., 'en', 'es'). If None, uses default_language.
            slow: Whether to speak slowly
            save_path: Optional custom path to save the audio file
            
        Returns:
            Path to the generated audio file
        """
        # Use default language if not specified
        if lang is None:
            # Convert 'en-US' to 'en' for gTTS
            lang = self.default_language.split('-')[0]
            
        return self.tts_service.text_to_speech(
            text=text,
            lang=lang,
            slow=slow,
            save_path=save_path
        )
    
    # STT Methods
    def speech_to_text(
        self,
        audio_file: Union[str, Path, BinaryIO],
        language: Optional[str] = None
    ) -> str:
        """Convert speech from an audio file to text.
        
        Args:
            audio_file: Path to audio file or file-like object
            language: Optional language code (e.g., 'en-US'). If None, uses default_language.
            
        Returns:
            The transcribed text
        """
        lang = language or self.default_language
        return self.stt_service.audio_file_to_text(audio_file, language=lang)
    
    def transcribe_audio(
        self, 
        audio_file: Union[str, Path, BinaryIO],
        language: Optional[str] = None
    ) -> Tuple[str, float]:
        """Transcribe audio with confidence score.
        
        Args:
            audio_file: Path to audio file or file-like object
            language: Optional language code (e.g., 'en-US'). If None, uses default_language.
            
        Returns:
            A tuple of (transcribed_text, confidence_score)
        """
        lang = language or self.default_language
        return self.stt_service.transcribe_audio(audio_file, language=lang)

# Create a default instance for easy importing
default_audio_service = AudioService()
