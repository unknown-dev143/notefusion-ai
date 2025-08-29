"""Configuration for the video generation service."""
import os
from pathlib import Path
from typing import Dict, Any, Optional
from enum import Enum
from pydantic import BaseModel, Field, validator
from ...core.config import settings

class VideoQuality(str, Enum):
    LOW = "360p"
    MEDIUM = "720p"
    HIGH = "1080p"
    ULTRA = "4k"

class VideoCodec(str, Enum):
    H264 = "libx264"
    HEVC = "libx265"
    VP9 = "libvpx-vp9"
    AV1 = "libaom-av1"

class AudioCodec(str, Enum):
    AAC = "aac"
    OPUS = "libopus"
    MP3 = "libmp3lame"
    VORBIS = "libvorbis"

class VideoSettings(BaseModel):
    """Video generation settings."""
    # Output settings
    output_dir: Path = Field(
        default=Path("data/videos"),
        description="Directory to save generated videos"
    )
    temp_dir: Path = Field(
        default=Path("data/temp"),
        description="Directory for temporary files"
    )
    
    # Video quality settings
    default_quality: VideoQuality = Field(
        default=VideoQuality.HIGH,
        description="Default output quality"
    )
    video_codec: VideoCodec = Field(
        default=VideoCodec.H264,
        description="Video codec to use for encoding"
    )
    audio_codec: AudioCodec = Field(
        default=AudioCodec.AAC,
        description="Audio codec to use for encoding"
    )
    framerate: int = Field(
        default=30,
        ge=24,
        le=60,
        description="Frames per second"
    )
    bitrate: Optional[str] = Field(
        default=None,
        description="Video bitrate (e.g., '5000k' for 5Mbps)"
    )
    
    # Performance settings
    max_concurrent_tasks: int = Field(
        default=2,
        ge=1,
        le=8,
        description="Maximum number of concurrent video generation tasks"
    )
    use_gpu: bool = Field(
        default=False,
        description="Enable GPU acceleration if available"
    )
    
    # Default slide settings
    default_slide_duration: float = Field(
        default=5.0,
        gt=0,
        description="Default slide duration in seconds"
    )
    min_slide_duration: float = Field(
        default=3.0,
        gt=0,
        description="Minimum slide duration in seconds"
    )
    max_slide_duration: float = Field(
        default=30.0,
        gt=0,
        description="Maximum slide duration in seconds"
    )
    
    # Text-to-speech settings
    default_voice: str = Field(
        default="en-US-Wavenet-D",
        description="Default voice for text-to-speech"
    )
    tts_speed: float = Field(
        default=1.0,
        gt=0.5,
        le=3.0,
        description="Speech rate multiplier"
    )
    
    # Advanced settings
    keep_temp_files: bool = Field(
        default=False,
        description="Keep temporary files after generation"
    )
    log_level: str = Field(
        default="INFO",
        description="Logging level"
    )
    
    class Config:
        use_enum_values = True
        extra = "ignore"
    
    @validator('output_dir', 'temp_dir', pre=True)
    def ensure_path(cls, v):
        if isinstance(v, str):
            return Path(v)
        return v
    
    @validator('output_dir', 'temp_dir')
    def create_dirs(cls, v):
        v.mkdir(parents=True, exist_ok=True)
        return v

def load_video_settings() -> VideoSettings:
    """Load video settings from environment variables."""
    # Get settings from environment with defaults
    settings_kwargs = {
        'output_dir': os.getenv('VIDEO_OUTPUT_DIR', 'data/videos'),
        'temp_dir': os.getenv('VIDEO_TEMP_DIR', 'data/temp'),
        'default_quality': os.getenv('VIDEO_QUALITY', 'high'),
        'video_codec': os.getenv('VIDEO_CODEC', 'libx264'),
        'audio_codec': os.getenv('AUDIO_CODEC', 'aac'),
        'framerate': int(os.getenv('VIDEO_FRAMERATE', '30')),
        'bitrate': os.getenv('VIDEO_BITRATE'),
        'max_concurrent_tasks': int(os.getenv('MAX_CONCURRENT_TASKS', '2')),
        'use_gpu': os.getenv('USE_GPU', 'false').lower() == 'true',
        'default_slide_duration': float(os.getenv('DEFAULT_SLIDE_DURATION', '5.0')),
        'min_slide_duration': float(os.getenv('MIN_SLIDE_DURATION', '3.0')),
        'max_slide_duration': float(os.getenv('MAX_SLIDE_DURATION', '30.0')),
        'default_voice': os.getenv('DEFAULT_VOICE', 'en-US-Wavenet-D'),
        'tts_speed': float(os.getenv('TTS_SPEED', '1.0')),
        'keep_temp_files': os.getenv('KEEP_TEMP_FILES', 'false').lower() == 'true',
        'log_level': os.getenv('LOG_LEVEL', 'INFO').upper(),
    }
    
    # Filter out None values to use defaults
    settings_kwargs = {k: v for k, v in settings_kwargs.items() if v is not None}
    
    return VideoSettings(**settings_kwargs)

# Global settings instance
video_settings = load_video_settings()
