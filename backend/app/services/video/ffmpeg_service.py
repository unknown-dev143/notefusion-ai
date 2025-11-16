<<<<<<< HEAD
"""FFmpeg video generation service for NoteFusion AI."""
import os
import subprocess
import tempfile
import shutil
import logging
import uuid
from pathlib import Path
from typing import List, Dict, Any, Optional, Union, Callable
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)

class FFmpegVideoService:
    """Service for generating videos using FFmpeg with advanced features."""
    
    def __init__(self, output_dir: str = "generated_videos"):
        self.ffmpeg_path = self._find_ffmpeg()
        if not self.ffmpeg_path:
            raise RuntimeError("FFmpeg not found. Please install FFmpeg and add it to PATH.")
        
        self.output_dir = Path(output_dir).resolve()
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.thread_pool = ThreadPoolExecutor(max_workers=min(4, (os.cpu_count() or 2) * 2))
    
    def _find_ffmpeg(self) -> str:
        """Find FFmpeg executable in common locations."""
        ffmpeg_names = ["ffmpeg", "ffmpeg.exe"]
        for name in ffmpeg_names:
            try:
                result = subprocess.run(
                    [name, "-version"],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True
                )
                if result.returncode == 0 and "ffmpeg version" in result.stderr:
                    return name
            except (FileNotFoundError, subprocess.SubprocessError):
                continue
        return ""
    
    def _run_ffmpeg(self, cmd: List[str], error_msg: str = "FFmpeg command failed") -> None:
        """Run an FFmpeg command and handle errors."""
        try:
            return subprocess.run(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                check=True
            )
        except subprocess.CalledProcessError as e:
            error_details = f"{error_msg}: {e}"
            if e.stderr:
                error_details += f"\nError output:\n{e.stderr}"
            logger.error(error_details)
            raise RuntimeError(error_details) from e
    
    def _generate_slide_video(
        self,
        slide: Dict[str, Any],
        output_path: Path,
        width: int,
        height: int,
        fps: int
    ) -> None:
        """Generate a video for a single slide."""
        temp_text_file = output_path.with_suffix('.txt')
        try:
            with open(temp_text_file, 'w', encoding='utf-8') as f:
                f.write(slide.get('content', ''))
            
            style = slide.get('style', {})
            cmd = [
                self.ffmpeg_path, '-y',
                '-f', 'lavfi',
                '-i', f'color=c={style.get("background_color", "#000000")}:'
                      f's={width}x{height}:d={slide.get("duration", 5)}:r={fps}',
                '-vf', (
                    f'drawtext=textfile={temp_text_file}:'
                    f'fontcolor={style.get("font_color", "#FFFFFF")}:'
                    f'fontsize={style.get("font_size", 40)}:'
                    'x=(w-text_w)/2:y=(h-text_h)/2:'
                    'fontfile=arial.ttf:box=1:boxcolor=black@0.5:boxborderw=10'
                ),
                '-c:v', 'libx264',
                '-pix_fmt', 'yuv420p',
                str(output_path)
            ]
            self._run_ffmpeg(cmd, f"Failed to generate slide: {output_path}")
        finally:
            if temp_text_file.exists():
                temp_text_file.unlink()
    
    def generate_video(
        self,
        slides: List[Dict[str, Any]],
        output_filename: Optional[str] = None,
        width: int = 1280,
        height: int = 720,
        fps: int = 30,
        **kwargs
    ) -> Optional[Path]:
        """Generate a video with multiple slides."""
        try:
            output_filename = output_filename or f"video_{uuid.uuid4().hex}.mp4"
=======
import os
import subprocess
from pathlib import Path
from typing import Optional
import uuid

class FFmpegVideoService:
    """A service for generating videos using FFmpeg directly."""
    
    def __init__(self, output_dir: str = "generated_videos"):
        """Initialize the FFmpeg video service.
        
        Args:
            output_dir: Directory to save generated videos
        """
        # Set the path to FFmpeg
        self.ffmpeg_path = r"C:\Users\User\ffmpeg\ffmpeg-master-latest-win64-gpl\bin\ffmpeg.exe"
        
        # Set up output directory
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def generate_video(
        self,
        text: str,
        output_filename: Optional[str] = None,
        width: int = 1280,
        height: int = 720,
        duration: int = 5,
        background_color: str = "blue",
        font_color: str = "white",
        font_size: int = 40
    ) -> Optional[Path]:
        """Generate a simple video with text using FFmpeg.
        
        Args:
            text: Text to display in the video
            output_filename: Output filename (without extension)
            width: Video width in pixels
            height: Video height in pixels
            duration: Video duration in seconds
            background_color: Background color (FFmpeg color name or hex code)
            font_color: Text color (FFmpeg color name or hex code)
            font_size: Font size in points
            
        Returns:
            Path to the generated video file, or None if generation failed
        """
        try:
            # Generate a unique filename if none provided
            if not output_filename:
                output_filename = f"video_{uuid.uuid4().hex}"
            
            # Ensure the output filename has the .mp4 extension
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
            if not output_filename.lower().endswith('.mp4'):
                output_filename += '.mp4'
            
            output_path = self.output_dir / output_filename
<<<<<<< HEAD
            temp_dir = Path(tempfile.mkdtemp(prefix="ffmpeg_temp_"))
            
            try:
                # Generate individual slide videos
                slide_videos = []
                for i, slide in enumerate(slides):
                    slide_path = temp_dir / f"slide_{i:03d}.mp4"
                    self._generate_slide_video(slide, slide_path, width, height, fps)
                    slide_videos.append(slide_path)
                
                # Combine slides
                concat_file = temp_dir / "concat_list.txt"
                with open(concat_file, 'w', encoding='utf-8') as f:
                    for video in slide_videos:
                        f.write(f"file '{video.absolute()}'\n")
                
                cmd = [
                    self.ffmpeg_path, '-y',
                    '-f', 'concat',
                    '-safe', '0',
                    '-i', str(concat_file),
                    '-c', 'copy',
                    str(output_path)
                ]
                
                self._run_ffmpeg(cmd, "Failed to combine slides")
                return output_path
                
            finally:
                if not kwargs.get('keep_temp_files', False):
                    shutil.rmtree(temp_dir, ignore_errors=True)
                    
        except Exception as e:
            logger.error(f"Video generation failed: {str(e)}", exc_info=True)
            if 'output_path' in locals() and output_path.exists():
                output_path.unlink()
            raise
=======
            
            # Create a temporary text file for the drawtext filter
            temp_text_file = self.output_dir / f"temp_{uuid.uuid4().hex}.txt"
            try:
                with open(temp_text_file, 'w', encoding='utf-8') as f:
                    f.write(text)
                
                # Build the FFmpeg command
                cmd = [
                    self.ffmpeg_path,
                    "-y",  # Overwrite output file if it exists
                    "-f", "lavfi",
                    "-i", f"color=c={background_color}:s={width}x{height}:d={duration}",
                    "-vf", f"drawtext=textfile={temp_text_file}:fontcolor={font_color}:"
                           f"fontsize={font_size}:x=(w-text_w)/2:y=(h-text_h)/2:"
                           f"fontfile=arial.ttf:box=1:boxcolor=black@0.5:boxborderw=10",
                    "-c:v", "libx264",
                    "-t", str(duration),
                    str(output_path)
                ]
                
                # Run FFmpeg
                result = subprocess.run(
                    cmd,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                    check=True
                )
                
                # Verify the output file was created
                if output_path.exists() and output_path.stat().st_size > 0:
                    return output_path
                else:
                    print(f"Error: Output file was not created or is empty")
                    if result.stderr:
                        print("FFmpeg error output:")
                        print(result.stderr)
                    return None
                    
            finally:
                # Clean up temporary files
                if temp_text_file.exists():
                    temp_text_file.unlink()
                    
        except subprocess.CalledProcessError as e:
            print(f"FFmpeg command failed with return code {e.returncode}")
            if e.stdout:
                print("FFmpeg stdout:")
                print(e.stdout)
            if e.stderr:
                print("FFmpeg stderr:")
                print(e.stderr)
            return None
            
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
            import traceback
            traceback.print_exc()
            return None

def test_ffmpeg_service():
    """Test the FFmpeg video service."""
    print("Testing FFmpeg Video Service")
    print("=" * 50)
    
    service = FFmpegVideoService()
    
    print("\nGenerating a test video...")
    video_path = service.generate_video(
        text="Hello, NoteFusion AI!\nThis is a test video.",
        output_filename="test_output.mp4",
        width=1280,
        height=720,
        duration=5,
        background_color="navy",
        font_color="white",
        font_size=50
    )
    
    if video_path:
        print(f"✅ Video created successfully at: {video_path.absolute()}")
        print(f"File size: {video_path.stat().st_size / (1024 * 1024):.2f} MB")
    else:
        print("❌ Failed to create video")

if __name__ == "__main__":
    test_ffmpeg_service()
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
