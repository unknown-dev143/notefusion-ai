"""Text-to-speech functionality for video generation."""
import os
import logging
import tempfile
from pathlib import Path
from typing import Optional, Dict, Any, Union, List
from dataclasses import dataclass
import json

import httpx
from pydub import AudioSegment

from .config import video_settings

logger = logging.getLogger(__name__)

@dataclass
class Voice:
    """Represents a TTS voice configuration."""
    name: str
    language_code: str
    gender: str  # 'MALE', 'FEMALE', 'NEUTRAL'
    provider: str = 'google'  # 'google', 'aws', 'azure', etc.
    engine: Optional[str] = None  # e.g., 'neural' for AWS Polly
    
    def __str__(self) -> str:
        return f"{self.name} ({self.language_code}, {self.gender.lower()})"

class TTSClient:
    """Base class for TTS clients."""
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        self.voices = self._load_voices()
    
    def _load_voices(self) -> Dict[str, Voice]:
        """Load available voices."""
        raise NotImplementedError
    
    async def synthesize_speech(
        self,
        text: str,
        voice_name: str,
        output_path: Optional[Union[str, Path]] = None,
        **kwargs
    ) -> Path:
        """
        Convert text to speech and save to a file.
        
        Args:
            text: The text to convert to speech
            voice_name: Name of the voice to use
            output_path: Path to save the audio file (optional)
            **kwargs: Additional parameters for the TTS service
            
        Returns:
            Path to the generated audio file
        """
        raise NotImplementedError

class GoogleTTSClient(TTSClient):
    """Google Cloud Text-to-Speech client."""
    def __init__(self, api_key: Optional[str] = None):
        super().__init__(api_key)
        self.base_url = "https://texttospeech.googleapis.com/v1"
    
    def _load_voices(self) -> Dict[str, Voice]:
        """Load available Google TTS voices."""
        return {
            'en-US-Wavenet-A': Voice('en-US-Wavenet-A', 'en-US', 'MALE'),
            'en-US-Wavenet-B': Voice('en-US-Wavenet-B', 'en-US', 'MALE'),
            'en-US-Wavenet-C': Voice('en-US-Wavenet-C', 'en-US', 'FEMALE'),
            'en-US-Wavenet-D': Voice('en-US-Wavenet-D', 'en-US', 'MALE'),
            'en-US-Wavenet-E': Voice('en-US-Wavenet-E', 'en-US', 'FEMALE'),
            'en-US-Wavenet-F': Voice('en-US-Wavenet-F', 'en-US', 'FEMALE'),
            'en-US-Standard-A': Voice('en-US-Standard-A', 'en-US', 'MALE'),
            'en-US-Standard-B': Voice('en-US-Standard-B', 'en-US', 'MALE'),
            'en-US-Standard-C': Voice('en-US-Standard-C', 'en-US', 'FEMALE'),
            'en-US-Standard-D': Voice('en-US-Standard-D', 'en-US', 'MALE'),
            'en-US-Standard-E': Voice('en-US-Standard-E', 'en-US', 'FEMALE'),
            'en-US-Standard-F': Voice('en-US-Standard-F', 'en-US', 'FEMALE'),
            'en-US-Standard-G': Voice('en-US-Standard-G', 'en-US', 'FEMALE'),
            'en-US-Standard-H': Voice('en-US-Standard-H', 'en-US', 'FEMALE'),
            'en-US-Standard-I': Voice('en-US-Standard-I', 'en-US', 'MALE'),
            'en-US-Standard-J': Voice('en-US-Standard-J', 'en-US', 'MALE'),
        }
    
    async def synthesize_speech(
        self,
        text: str,
        voice_name: str,
        output_path: Optional[Union[str, Path]] = None,
        **kwargs
    ) -> Path:
        """Convert text to speech using Google Cloud TTS."""
        if not self.api_key:
            raise ValueError("Google Cloud API key is required")
        
        if voice_name not in self.voices:
            logger.warning(f"Voice {voice_name} not found, using default voice")
            voice_name = video_settings.default_voice
        
        voice = self.voices[voice_name]
        
        # Prepare request data
        data = {
            'input': {'text': text},
            'voice': {
                'languageCode': voice.language_code,
                'name': voice_name,
            },
            'audioConfig': {
                'audioEncoding': 'MP3',  # or 'LINEAR16' for WAV
                'speakingRate': kwargs.get('speaking_rate', 1.0),
                'pitch': kwargs.get('pitch', 0.0),
                'volumeGainDb': kwargs.get('volume_gain_db', 0.0),
            },
        }
        
        # Add effects profile if using a Wavenet voice
        if 'Wavenet' in voice_name:
            data['audioConfig']['effectsProfileId'] = ['headphone-class-device']
        
        # Create output directory if it doesn't exist
        if output_path is None:
            output_dir = Path(video_settings.temp_dir) / 'tts'
            output_dir.mkdir(parents=True, exist_ok=True)
            output_path = output_dir / f"tts_{hash(text) & 0xFFFFFFFF}.mp3"
        else:
            output_path = Path(output_path)
            output_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Make API request
        url = f"{self.base_url}/text:synthesize?key={self.api_key}"
        headers = {"Content-Type": "application/json; charset=utf-8"}
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                headers=headers,
                json=data,
                timeout=30.0
            )
            
            if response.status_code != 200:
                error_msg = f"TTS API error: {response.status_code} - {response.text}"
                logger.error(error_msg)
                raise RuntimeError(error_msg)
            
            result = response.json()
            audio_content = result['audioContent']
        
        # Save the audio content to a file
        with open(output_path, 'wb') as out:
            out.write(audio_content.encode('latin1'))
        
        return output_path

class MockTTSClient(TTSClient):
    """Mock TTS client for testing and development."""
    def _load_voices(self) -> Dict[str, Voice]:
        """Return a mock set of voices."""
        return {
            'mock-voice-1': Voice('mock-voice-1', 'en-US', 'MALE'),
            'mock-voice-2': Voice('mock-voice-2', 'en-US', 'FEMALE'),
        }
    
    async def synthesize_speech(
        self,
        text: str,
        voice_name: str,
        output_path: Optional[Union[str, Path]] = None,
        **kwargs
    ) -> Path:
        """Generate a silent audio file with the given duration."""
        if output_path is None:
            output_dir = Path(video_settings.temp_dir) / 'tts'
            output_dir.mkdir(parents=True, exist_ok=True)
            output_path = output_dir / f"mock_tts_{hash(text) & 0xFFFFFFFF}.wav"
        else:
            output_path = Path(output_path)
            output_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Create a silent audio segment with the estimated duration
        words = len(text.split())
        duration_ms = int((words / 150) * 60000)  # 150 WPM
        silence = AudioSegment.silent(duration=max(1000, duration_ms))
        
        # Save as WAV
        silence.export(output_path, format='wav')
        
        return output_path

def get_tts_client(provider: str = 'google', api_key: Optional[str] = None) -> TTSClient:
    """Factory function to get a TTS client for the specified provider."""
    if provider == 'google':
        return GoogleTTSClient(api_key=api_key or os.getenv('GOOGLE_TTS_API_KEY'))
    elif provider == 'mock':
        return MockTTSClient()
    else:
        raise ValueError(f"Unsupported TTS provider: {provider}")

# Default TTS client
try:
    tts_client = get_tts_client('google')
except Exception as e:
    logger.warning(f"Failed to initialize Google TTS client: {e}. Using mock client.")
    tts_client = get_tts_client('mock')
