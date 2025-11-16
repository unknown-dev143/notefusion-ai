"""
Speech-to-Text (STT) Service using SpeechRecognition with Google Web Speech API
"""
import os
import tempfile
from pathlib import Path
from typing import Optional, Union, BinaryIO, Tuple
import speech_recognition as sr

class STTService:
    """Service for converting speech to text using Google's Web Speech API."""
    
    def __init__(self, language: str = "en-US"):
        """Initialize the STT service.
        
        Args:
            language: Language code for speech recognition (e.g., 'en-US', 'es-ES')
        """
        self.language = language
        self.recognizer = sr.Recognizer()
    
    def audio_file_to_text(
        self, 
        audio_file: Union[str, Path, BinaryIO],
        language: Optional[str] = None
    ) -> str:
        """Convert an audio file to text.
        
        Args:
            audio_file: Path to audio file or file-like object
            language: Optional language code (overrides default)
            
        Returns:
            The transcribed text
            
        Raises:
            ValueError: If audio cannot be processed
            RuntimeError: If speech recognition fails
        """
        lang = language or self.language
        
        # Handle file path or file-like object
        if isinstance(audio_file, (str, Path)):
            with sr.AudioFile(str(audio_file)) as source:
                audio_data = self.recognizer.record(source)
        else:
            # For file-like objects, we need to save to a temporary file first
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
                tmp.write(audio_file.read())
                tmp_path = tmp.name
            
            try:
                with sr.AudioFile(tmp_path) as source:
                    audio_data = self.recognizer.record(source)
            finally:
                # Clean up temporary file
                os.unlink(tmp_path)
        
        try:
            # Use Google Web Speech API
            text = self.recognizer.recognize_google(audio_data, language=lang)
            return text
        except sr.UnknownValueError:
            raise ValueError("Could not understand audio")
        except sr.RequestError as e:
            raise RuntimeError(f"Could not request results from Google Web Speech API; {e}")
    
    def transcribe_audio(
        self, 
        audio_file: Union[str, Path, BinaryIO],
        language: Optional[str] = None
    ) -> Tuple[str, float]:
        """Transcribe audio with confidence score.
        
        Args:
            audio_file: Path to audio file or file-like object
            language: Optional language code
            
        Returns:
            A tuple of (transcribed_text, confidence_score)
        """
        # Note: Google's API doesn't provide confidence scores in the free tier
        # This is a placeholder for future implementation with other APIs
        try:
            text = self.audio_file_to_text(audio_file, language)
            return text, 1.0  # Default confidence
        except Exception as e:
            return "", 0.0

# Example usage
if __name__ == "__main__":
    stt = STTService(language="en-US")
    
    # Example with file path
    test_audio = "test_audio.wav"
    if os.path.exists(test_audio):
        try:
            text, confidence = stt.transcribe_audio(test_audio)
            print(f"Transcribed text: {text}")
            print(f"Confidence: {confidence:.2f}")
        except Exception as e:
            print(f"Error: {e}")
    else:
        print(f"Test audio file not found: {test_audio}")
