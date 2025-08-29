"""
Text-to-Speech (TTS) Service using gTTS (Google Text-to-Speech)
"""
import os
from pathlib import Path
from typing import Optional
from gtts import gTTS
import tempfile

class TTSService:
    """Service for converting text to speech using gTTS."""
    
    def __init__(self, output_dir: Optional[str] = None):
        """Initialize the TTS service.
        
        Args:
            output_dir: Directory to save audio files. If None, uses system temp directory.
        """
        self.output_dir = output_dir or os.path.join(tempfile.gettempdir(), "tts_audio")
        os.makedirs(self.output_dir, exist_ok=True)
    
    def text_to_speech(
        self,
        text: str,
        lang: str = "en",
        slow: bool = False,
        save_path: Optional[str] = None
    ) -> str:
        """Convert text to speech and save as an audio file.
        
        Args:
            text: The text to convert to speech
            lang: Language code (e.g., 'en' for English, 'es' for Spanish)
            slow: Whether to speak slowly
            save_path: Optional custom path to save the audio file
            
        Returns:
            Path to the generated audio file
        """
        # Generate speech
        tts = gTTS(text=text, lang=lang, slow=slow)
        
        # Generate output filename if not provided
        if not save_path:
            import hashlib
            import time
            
            # Create a unique filename based on text content and timestamp
            text_hash = hashlib.md5(text.encode()).hexdigest()[:8]
            timestamp = int(time.time())
            filename = f"tts_{timestamp}_{text_hash}.mp3"
            save_path = os.path.join(self.output_dir, filename)
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        
        # Save the audio file
        tts.save(save_path)
        
        return save_path

# Example usage
if __name__ == "__main__":
    tts = TTSService()
    audio_file = tts.text_to_speech(
        "Hello, this is a test of the text to speech service.",
        lang="en"
    )
    print(f"Audio file saved to: {audio_file}")
