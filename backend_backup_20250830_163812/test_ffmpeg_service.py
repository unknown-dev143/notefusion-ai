import sys
import os
from pathlib import Path

# Add the current directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

# Now import the FFmpeg service
from app.services.video.ffmpeg_service import test_ffmpeg_service

if __name__ == "__main__":
    test_ffmpeg_service()
