"""Transcription service using Whisper for speech-to-text with additional features."""
from typing import Optional, List, Dict, Any, Generator, Tuple
import whisper
import tempfile
import os
import openai
from .diarization import DiarizationService
from ..visual.service import VisualGenerationService
from ..educational.service import EducationalVideoService
import numpy as np
from pydub import AudioSegment
import math
import re
from datetime import timedelta
from dotenv import load_dotenv
import torch
import asyncio

# Load environment variables
load_dotenv()

# Create test directory if it doesn't exist
test_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'test_files')
os.makedirs(test_dir, exist_ok=True)

class TranscriptionService:
    """Service for transcribing audio with additional features like diarization and diagram generation."""
    
    def __init__(self, model_size: str = "base", device: str = "cpu", openai_api_key: Optional[str] = None):
        """Initialize the transcription service.
        
        Args:
            model_size: Size of the Whisper model to use (tiny, base, small, medium, large)
            device: Device to run the model on (cpu or cuda)
            openai_api_key: Optional OpenAI API key for additional features
        """
        self._model = None
        self._diarizer = DiarizationService()
        api_key = openai_api_key or os.getenv('OPENAI_API_KEY')
        self._visual_generator = VisualGenerationService(api_key=api_key)
        self._educational_generator = EducationalVideoService(api_key=api_key)
        self._cache = {}
        self._device = device
        
        # Configure OpenAI API
        if openai_api_key:
            openai.api_key = openai_api_key
        
        try:
            self._model = whisper.load_model(model_size, device=device)
        except Exception as e:
            print(f"Warning: Whisper model not available: {e}")
            print("Make sure you have installed whisper: pip install openai-whisper")

    def _split_audio(self, audio_path: str, chunk_duration: int = 1800) -> Generator[Tuple[AudioSegment, float], None, None]:
        """Split audio into chunks for processing.
        
        Args:
            audio_path: Path to the audio file
            chunk_duration: Duration of each chunk in seconds (default: 1800s = 30 minutes)
            
        Yields:
            Tuple of (audio_segment, progress)
        """
        try:
            audio = AudioSegment.from_file(audio_path)
            duration_ms = len(audio)
            chunk_size = chunk_duration * 1000  # Convert to milliseconds
            
            for i in range(0, duration_ms, chunk_size):
                chunk = audio[i:i + chunk_size]
                progress = min(1.0, (i + len(chunk)) / duration_ms)
                yield chunk, progress
                
        except Exception as e:
            print(f"Error splitting audio: {e}")
            yield AudioSegment.silent(duration=1000), 1.0  # Return empty audio on error

    async def _extract_main_topics(self, text: str) -> List[Dict[str, str]]:
        """Extract main topics from transcribed text.
        
        Args:
            text: The transcribed text
            
        Returns:
            List of topics with title and content
        """
        # Simple implementation - can be enhanced with more sophisticated NLP
        sentences = [s.strip() for s in re.split(r'[.!?]', text) if s.strip()]
        
        # Group sentences into topics (simple approach)
        topics = []
        current_topic = ""
        
        for sentence in sentences:
            if len(current_topic) + len(sentence) < 500:  # Roughly group into topics
                current_topic += " " + sentence
            else:
                if current_topic.strip():
                    topics.append({
                        "title": current_topic[:50] + "...",
                        "content": current_topic
                    })
                current_topic = sentence
                
        if current_topic.strip():
            topics.append({
                "title": current_topic[:50] + "...",
                "content": current_topic
            })
            
        return topics

    async def _extract_diagram_descriptions(self, text: str) -> List[Dict[str, str]]:
        """Extract potential diagram descriptions from text.
        
        Args:
            text: The transcribed text
            
        Returns:
            List of diagram descriptions with type and content
        """
        # Simple implementation - look for common diagram-related phrases
        diagrams = []
        
        # Look for potential diagram descriptions
        diagram_phrases = [
            ("flowchart", "flowchart"),
            ("architecture diagram", "architecture"),
            ("sequence diagram", "sequence"),
            ("process flow", "process"),
            ("system design", "system")
        ]
        
        for phrase, diagram_type in diagram_phrases:
            if phrase in text.lower():
                # Extract context around the phrase
                start = max(0, text.lower().find(phrase) - 100)
                end = min(len(text), text.lower().find(phrase) + 100)
                context = text[start:end].strip()
                
                diagrams.append({
                    "type": diagram_type,
                    "description": f"{phrase.upper()}: {context}"
                })
        
        return diagrams

    async def transcribe_audio(self, audio_path: str, diarize: bool = False, 
                             generate_diagrams: bool = True) -> Dict[str, Any]:
        """Transcribe audio file with optional speaker diarization and diagram generation.
        
        Args:
            audio_path: Path to the audio file
            diarize: Whether to perform speaker diarization
            generate_diagrams: Whether to generate diagrams from the transcription
            
        Returns:
            Dictionary containing transcription results and additional data
        """
        if not self._model:
            return {"error": "Whisper model not available", "fallback": True, "text": ""}

        try:
            all_segments = []
            full_text = []
            current_offset = 0.0
            
            # Process audio in chunks
            for chunk, progress in self._split_audio(audio_path):
                # Save chunk to temporary file
                with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
                    chunk_path = temp_file.name
                    chunk.export(chunk_path, format='wav')
                
                try:
                    # Transcribe chunk
                    chunk_result = self._model.transcribe(chunk_path)
                    
                    # Adjust timestamps for segments
                    if "segments" in chunk_result:
                        for segment in chunk_result["segments"]:
                            segment["start"] += current_offset
                            segment["end"] += current_offset
                            all_segments.append(segment)
                    
                    full_text.append(chunk_result["text"])
                    
                    # Update progress
                    print(f"Transcription progress: {progress*100:.1f}%")
                    
                finally:
                    # Clean up temporary file
                    if os.path.exists(chunk_path):
                        os.unlink(chunk_path)
                
                current_offset += len(chunk) / 1000  # Update offset in seconds
            
            # Combine results
            result = {
                "text": " ".join(full_text),
                "segments": all_segments,
                "duration": current_offset
            }
            
            if diarize:
                # Perform speaker diarization on the full audio
                segments = self._diarizer.diarize(audio_path)
                
                # Merge transcription with speaker information
                if segments:
                    result["segments"] = self._merge_diarization(result["segments"], segments)
                    result["speakers"] = list(set(seg["speaker"] for seg in segments))
                else:
                    result["speakers"] = ["Speaker 1"]
            
            # Add human-readable duration
            result["duration_formatted"] = str(timedelta(seconds=int(current_offset)))
            
            # Generate diagrams if requested
            if generate_diagrams:
                diagram_descriptions = await self._extract_diagram_descriptions(result["text"])
                diagrams = []
                
                for desc in diagram_descriptions:
                    diagram = await self._visual_generator.generate_diagram(
                        desc["description"],
                        style=desc["type"]
                    )
                    if "error" not in diagram:
                        diagrams.append(diagram)
                
                result["diagrams"] = diagrams
                
                # Generate Mermaid diagrams for technical sections
                for segment in result.get("segments", []):
                    if any(term in segment["text"].lower() 
                          for term in ["flowchart", "sequence", "architecture", "process"]):
                        mermaid = await self._visual_generator.generate_mermaid_diagram(
                            segment["text"],
                            type="flowchart" if "flowchart" in segment["text"].lower() else "sequence"
                        )
                        if "error" not in mermaid:
                            if "mermaid_diagrams" not in result:
                                result["mermaid_diagrams"] = []
                            result["mermaid_diagrams"].append(mermaid)
            
            # Generate presentation if there's enough content
            if len(result.get("segments", [])) > 5:
                presentation = await self._visual_generator.generate_presentation(
                    result,
                    include_diagrams=generate_diagrams
                )
                if "error" not in presentation:
                    result["presentation"] = presentation
            
            # Extract main topics and generate educational videos
            topics = await self._extract_main_topics(result["text"])
            educational_videos = []
            
            for topic in topics:
                video = await self._educational_generator.generate_educational_video(
                    topic["title"],
                    {
                        "text": topic["content"],
                        "diagrams": result.get("diagrams", []),
                        "mermaid_diagrams": result.get("mermaid_diagrams", [])
                    },
                    style="engaging",
                    duration=300  # 5 minutes per topic
                )
                if "error" not in video:
                    educational_videos.append({
                        "topic": topic["title"],
                        "video": video
                    })
            
            if educational_videos:
                result["educational_videos"] = educational_videos
            
            self._cache[audio_path] = result
            return result
            
        except Exception as e:
            return {"error": str(e), "fallback": True, "text": ""}

    def _merge_diarization(self, whisper_segments: List[Dict[str, Any]], 
                         diarization_segments: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Merge Whisper transcription segments with speaker diarization segments.
        
        Args:
            whisper_segments: List of segments from Whisper
            diarization_segments: List of segments from diarization
            
        Returns:
            List of merged segments with speaker information
        """
        merged_segments = []
        
        for whisper_seg in whisper_segments:
            # Find overlapping diarization segments
            start_time = whisper_seg["start"]
            end_time = whisper_seg["end"]
            
            # Find the diarization segment that overlaps the most with this transcription segment
            max_overlap = 0
            assigned_speaker = "Speaker 1"
            
            for diar_seg in diarization_segments:
                overlap_start = max(start_time, diar_seg["start"])
                overlap_end = min(end_time, diar_seg["end"])
                
                if overlap_end > overlap_start:
                    overlap_duration = overlap_end - overlap_start
                    if overlap_duration > max_overlap:
                        max_overlap = overlap_duration
                        assigned_speaker = diar_seg["speaker"]
            
            # Add the speaker information to the segment
            segment = whisper_seg.copy()
            segment["speaker"] = assigned_speaker
            merged_segments.append(segment)
        
        return merged_segments

    async def transcribe_chunk(self, audio_chunk: bytes, diarize: bool = False) -> Dict[str, Any]:
        """Transcribe live audio chunk with optional diarization.
        
        Args:
            audio_chunk: Audio data as bytes
            diarize: Whether to perform speaker diarization
            
        Returns:
            Dictionary containing transcription results
        """
        if not self._model:
            return {"error": "Whisper model not available", "fallback": True, "text": ""}

        temp_file_path = None
        try:
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
                temp_file.write(audio_chunk)
                temp_file_path = temp_file.name

            result = self._model.transcribe(temp_file_path)

            if diarize and len(result.get("text", "").strip()) > 0:
                # Only attempt diarization if there's actual speech
                segments = self._diarizer.diarize(temp_file_path)
                if segments:
                    result["segments"] = self._merge_diarization(
                        result.get("segments", []), 
                        segments
                    )
                    result["speakers"] = list(set(seg["speaker"] for seg in segments))
                else:
                    result["speakers"] = ["Speaker 1"]

            return result
            
        except Exception as e:
            return {"error": str(e), "fallback": True, "text": ""}
            
        finally:
            if temp_file_path and os.path.exists(temp_file_path):
                try:
                    os.unlink(temp_file_path)
                except Exception as e:
                    print(f"Warning: Could not delete temporary file {temp_file_path}: {e}")


async def main():
    """Example usage of the TranscriptionService."""
    service = TranscriptionService(
        model_size="base",
        device="cuda" if torch.cuda.is_available() else "cpu"
    )

    result = await service.transcribe_audio(
        "path/to/audio.mp3",
        diarize=True,
        generate_diagrams=True
    )
    print(result)


if __name__ == "__main__":
    asyncio.run(main())
