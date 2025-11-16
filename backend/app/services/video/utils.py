"""Utility functions for video generation service."""
import os
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
from enum import Enum
from dataclasses import dataclass

logger = logging.getLogger(__name__)

class SlideType(str, Enum):
    """Types of slides that can be generated."""
    TITLE = "title"
    SECTION_HEADER = "section_header"
    BULLET_POINTS = "bullet_points"
    IMAGE = "image"
    QUOTE = "quote"
    CODE = "code"
    COMPARISON = "comparison"

@dataclass
class Slide:
    """Represents a single slide in a video presentation."""
    slide_type: SlideType
    content: str
    duration: float  # in seconds
    style: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None

def split_into_slides(text: str, max_slide_length: int = 300) -> List[Dict[str, Any]]:
    """
    Split text into slides based on content structure.
    
    Args:
        text: The input text to split into slides
        max_slide_length: Maximum number of characters per slide
        
    Returns:
        List of slide dictionaries
    """
    # Simple implementation - split by double newlines
    paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
    
    slides = []
    current_slide = []
    current_length = 0
    
    for paragraph in paragraphs:
        # If adding this paragraph would exceed the max length, start a new slide
        if current_length + len(paragraph) > max_slide_length and current_slide:
            slides.append({
                'type': SlideType.BULLET_POINTS,
                'content': '\n'.join(current_slide),
                'duration': min(5 + len(current_slide) * 2, 20)  # 5-20 seconds per slide
            })
            current_slide = []
            current_length = 0
            
        current_slide.append(paragraph)
        current_length += len(paragraph)
    
    # Add the last slide if there's any content left
    if current_slide:
        slides.append({
            'type': SlideType.BULLET_POINTS,
            'content': '\n'.join(current_slide),
            'duration': min(5 + len(current_slide) * 2, 20)
        })
    
    return slides

def estimate_slide_duration(text: str, wpm: int = 150) -> float:
    """
    Estimate the duration a slide should be displayed based on its content.
    
    Args:
        text: The slide text content
        wpm: Words per minute for reading speed
        
    Returns:
        Duration in seconds
    """
    word_count = len(text.split())
    min_duration = 5.0  # Minimum 5 seconds per slide
    max_duration = 30.0  # Maximum 30 seconds per slide
    
    # Calculate based on reading speed (words per minute)
    duration = (word_count / wpm) * 60
    
    # Apply min/max bounds
    return min(max(duration, min_duration), max_duration)

def generate_slide_style(style_name: str) -> Dict[str, Any]:
    """
    Generate style configuration for a slide based on style name.
    
    Args:
        style_name: Name of the style (e.g., 'professional', 'educational')
        
    Returns:
        Dictionary with style configuration
    """
    styles = {
        'professional': {
            'background_color': '#1e293b',  # Dark blue-gray
            'text_color': '#ffffff',
            'font_family': 'Arial',
            'font_size': 36,
            'padding': 60,
            'transition': 'fade',
        },
        'educational': {
            'background_color': '#f8fafc',  # Light gray
            'text_color': '#1e293b',
            'font_family': 'Arial',
            'font_size': 32,
            'padding': 50,
            'transition': 'slide',
        },
        'casual': {
            'background_color': '#ffffff',
            'text_color': '#1e293b',
            'font_family': 'Comic Sans MS',
            'font_size': 34,
            'padding': 40,
            'transition': 'zoom',
        },
        'minimalist': {
            'background_color': '#ffffff',
            'text_color': '#000000',
            'font_family': 'Helvetica',
            'font_size': 36,
            'padding': 80,
            'transition': 'none',
        },
    }
    
    return styles.get(style_name.lower(), styles['professional'])

def sanitize_filename(filename: str) -> str:
    """
    Sanitize a filename to be safe for the filesystem.
    
    Args:
        filename: The original filename
        
    Returns:
        Sanitized filename
    """
    # Replace invalid characters with underscores
    invalid_chars = '<>:"/\\|?*\0'
    for char in invalid_chars:
        filename = filename.replace(char, '_')
    
    # Remove control characters
    filename = ''.join(char for char in filename if ord(char) >= 32)
    
    # Limit length
    max_length = 255
    if len(filename) > max_length:
        name, ext = os.path.splitext(filename)
        ext = ext[:10]  # Limit extension length
        name = name[:(max_length - len(ext) - 1)]
        filename = f"{name}{ext}"
    
    return filename

def format_timestamp(seconds: float) -> str:
    """
    Format a duration in seconds as a timestamp string (HH:MM:SS.mmm).
    
    Args:
        seconds: Duration in seconds
        
    Returns:
        Formatted timestamp string
    """
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    seconds = seconds % 60
    
    if hours > 0:
        return f"{hours:02d}:{minutes:02d}:{seconds:06.3f}"
    else:
        return f"{minutes:02d}:{seconds:06.3f}"
