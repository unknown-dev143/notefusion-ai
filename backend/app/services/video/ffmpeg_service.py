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
            if not output_filename.lower().endswith('.mp4'):
                output_filename += '.mp4'
            
            output_path = self.output_dir / output_filename
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
