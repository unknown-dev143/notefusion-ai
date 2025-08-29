"""
Configuration settings for the audio service.
"""
from pathlib import Path
from pydantic import Field
from pydantic_settings import BaseSettings

class AudioSettings(BaseSettings):
    """Audio service configuration settings."""
    
    # Base directory for audio files
    AUDIO_BASE_DIR: Path = Path("data/audio")
    
    # TTS Settings
    TTS_DEFAULT_LANG: str = "en"
    TTS_DEFAULT_SLOW: bool = False
    TTS_DEFAULT_ENGINE: str = "gtts"  # Options: gtts, pyttsx3, etc.
    
    # STT Settings
    STT_DEFAULT_LANG: str = "en-US"
    
    # Audio format settings
    DEFAULT_AUDIO_FORMAT: str = "mp3"
    SUPPORTED_AUDIO_FORMATS: list[str] = ["mp3", "wav", "ogg"]
    
    # Rate limiting
    RATE_LIMIT_REQUESTS: int = 100  # Max requests
    RATE_LIMIT_PERIOD: int = 3600   # Per hour
    
    # Caching
    ENABLE_AUDIO_CACHE: bool = True
    CACHE_TTL: int = 86400  # 24 hours in seconds
    
    class Config:
        env_prefix = "AUDIO_"
        case_sensitive = False

# Create settings instance
audio_settings = AudioSettings()
