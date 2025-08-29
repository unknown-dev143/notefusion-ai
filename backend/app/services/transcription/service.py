<<<<<<< HEAD
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

# Load environment variables at the top of your file
load_dotenv()

class TranscriptionService:
    def __init__(self, model_size: str = "base", device: str = "cpu", openai_api_key: Optional[str] = None):
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
        """
        Split long audio/video file into chunks
        chunk_duration: duration of each chunk in seconds (default 30 minutes)
        """
        try:
            audio = AudioSegment.from_file(audio_path)
            total_duration = len(audio) / 1000  # Convert to seconds
            chunks = math.ceil(total_duration / chunk_duration)
            
            for i in range(chunks):
                start_time = i * chunk_duration * 1000  # Convert to milliseconds
                end_time = min((i + 1) * chunk_duration * 1000, len(audio))
                chunk = audio[start_time:end_time]
                progress = (i + 1) / chunks
                yield chunk, progress
                
        except Exception as e:
            print(f"Error splitting audio: {e}")
            yield AudioSegment.from_file(audio_path), 1.0

    async def _extract_main_topics(self, text: str) -> List[Dict[str, str]]:
        """Extract main topics from the transcribed text using GPT-4"""
        try:
            response = await openai.ChatCompletion.acreate(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "Extract the main educational topics from this text. Each topic should be a concept that would benefit from a detailed explanation."},
                    {"role": "user", "content": text}
                ]
            )
            
            topics_text = response.choices[0].message.content
            topics = []
            
            # Parse the GPT response into structured topics
            current_topic = None
            for line in topics_text.split('\n'):
                if line.strip():
                    if line.startswith('Topic:'):
                        if current_topic:
                            topics.append(current_topic)
                        current_topic = {
                            "title": line[6:].strip(),
                            "content": ""
                        }
                    elif current_topic:
                        current_topic["content"] += line.strip() + "\n"
            
            if current_topic:
                topics.append(current_topic)
            
            return topics
        except Exception as e:
            print(f"Error extracting topics: {e}")
            return []

    async def _extract_diagram_descriptions(self, text: str) -> List[Dict[str, str]]:
        """Extract potential diagram descriptions from text"""
        diagram_markers = [
            r"diagram shows",
            r"illustration of",
            r"figure depicts",
            r"visual representation of",
            r"flowchart of",
            r"structure of",
            r"architecture of",
            r"layout of"
        ]
        
        descriptions = []
        for marker in diagram_markers:
            matches = re.finditer(rf"{marker}\s+([^\.]+)", text, re.IGNORECASE)
            for match in matches:
                descriptions.append({
                    "description": match.group(1).strip(),
                    "type": "technical" if any(word in match.group().lower() 
                           for word in ["flowchart", "architecture", "structure"]) 
                           else "detailed"
                })
        return descriptions

    async def transcribe_audio(self, audio_path: str, diarize: bool = False, 
                             generate_diagrams: bool = True) -> dict:
        """Transcribe audio file with optional speaker diarization and diagram generation"""
        if audio_path in self._cache:
            return self._cache[audio_path]

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

    def _merge_diarization(self, whisper_segments: List[Dict[str, Any]], diarization_segments: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Merge Whisper transcription segments with speaker diarization segments
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

    async def transcribe_chunk(self, audio_chunk: bytes, diarize: bool = False) -> dict:
        """Transcribe live audio chunk with optional diarization"""
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
                    result["segments"] = self._merge_diarization(result.get("segments", []), segments)
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

# Example usage
import asyncio

async def main():
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

# Run the async main function
if __name__ == "__main__":
    asyncio.run(main())

# Create test directory
os.makedirs(r"c:\Users\User\notefusion-ai\notefusion-ai\test_files", exist_ok=True)
=======
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

# Load environment variables at the top of your file
load_dotenv()

class TranscriptionService:
    def __init__(self, model_size: str = "base", device: str = "cpu", openai_api_key: Optional[str] = None):
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
        """
        Split long audio/video file into chunks
        chunk_duration: duration of each chunk in seconds (default 30 minutes)
        """
        try:
            audio = AudioSegment.from_file(audio_path)
            total_duration = len(audio) / 1000  # Convert to seconds
            chunks = math.ceil(total_duration / chunk_duration)
            
            for i in range(chunks):
                start_time = i * chunk_duration * 1000  # Convert to milliseconds
                end_time = min((i + 1) * chunk_duration * 1000, len(audio))
                chunk = audio[start_time:end_time]
                progress = (i + 1) / chunks
                yield chunk, progress
                
        except Exception as e:
            print(f"Error splitting audio: {e}")
            yield AudioSegment.from_file(audio_path), 1.0

    async def _extract_main_topics(self, text: str) -> List[Dict[str, str]]:
        """Extract main topics from the transcribed text using GPT-4"""
        try:
            response = await openai.ChatCompletion.acreate(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "Extract the main educational topics from this text. Each topic should be a concept that would benefit from a detailed explanation."},
                    {"role": "user", "content": text}
                ]
            )
            
            topics_text = response.choices[0].message.content
            topics = []
            
            # Parse the GPT response into structured topics
            current_topic = None
            for line in topics_text.split('\n'):
                if line.strip():
                    if line.startswith('Topic:'):
                        if current_topic:
                            topics.append(current_topic)
                        current_topic = {
                            "title": line[6:].strip(),
                            "content": ""
                        }
                    elif current_topic:
                        current_topic["content"] += line.strip() + "\n"
            
            if current_topic:
                topics.append(current_topic)
            
            return topics
        except Exception as e:
            print(f"Error extracting topics: {e}")
            return []

    async def _extract_diagram_descriptions(self, text: str) -> List[Dict[str, str]]:
        """Extract potential diagram descriptions from text"""
        diagram_markers = [
            r"diagram shows",
            r"illustration of",
            r"figure depicts",
            r"visual representation of",
            r"flowchart of",
            r"structure of",
            r"architecture of",
            r"layout of"
        ]
        
        descriptions = []
        for marker in diagram_markers:
            matches = re.finditer(rf"{marker}\s+([^\.]+)", text, re.IGNORECASE)
            for match in matches:
                descriptions.append({
                    "description": match.group(1).strip(),
                    "type": "technical" if any(word in match.group().lower() 
                           for word in ["flowchart", "architecture", "structure"]) 
                           else "detailed"
                })
        return descriptions

    async def transcribe_audio(self, audio_path: str, diarize: bool = False, 
                             generate_diagrams: bool = True) -> dict:
        """Transcribe audio file with optional speaker diarization and diagram generation"""
        if audio_path in self._cache:
            return self._cache[audio_path]

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

    def _merge_diarization(self, whisper_segments: List[Dict[str, Any]], diarization_segments: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Merge Whisper transcription segments with speaker diarization segments
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

    async def transcribe_chunk(self, audio_chunk: bytes, diarize: bool = False) -> dict:
        """Transcribe live audio chunk with optional diarization"""
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
                    result["segments"] = self._merge_diarization(result.get("segments", []), segments)
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

# Example usage
import asyncio

async def main():
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

# Run the async main function
if __name__ == "__main__":
    asyncio.run(main())

# Create test directory
os.makedirs(r"c:\Users\User\notefusion-ai\notefusion-ai\test_files", exist_ok=True)
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
