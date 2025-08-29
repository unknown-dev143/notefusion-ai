from typing import Optional, List, Dict, Any, Union
import openai
import base64
from pathlib import Path
import json
import asyncio
from concurrent.futures import ThreadPoolExecutor
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from ...utils.presentation import PresentationTemplate, BrandingManager, ExportManager
from ...utils.processing import BatchProcessor, GPUManager
import tempfile
from moviepy.editor import TextClip, ImageClip, CompositeVideoClip, concatenate_videoclips
from pydub import AudioSegment, effects
import io

class VisualGenerationService:
    def __init__(self, api_key: Optional[str] = None):
        if api_key:
            openai.api_key = api_key
        
        # Set up directories
        self._base_dir = Path.home() / ".notefusion"
        self._temp_dir = self._base_dir / "temp"
        self._cache_dir = self._base_dir / "cache"
        self._export_dir = self._base_dir / "exports"
        
        for directory in [self._temp_dir, self._cache_dir, self._export_dir]:
            directory.mkdir(parents=True, exist_ok=True)
        
        # Load templates and branding
        template_dir = Path(__file__).parent / "templates"
        self._presentation_templates = PresentationTemplate(template_dir)
        with open(template_dir / "branding_config.json") as f:
            self._branding_manager = BrandingManager(json.load(f))
        
        # Initialize processing helpers
        self._executor = ThreadPoolExecutor(max_workers=4)
        self._gpu_manager = GPUManager()

    async def generate_diagram(self, description: str, style: str = "technical") -> Dict[str, Any]:
        """
        Generate a diagram using DALL-E based on text description
        styles: technical, hand-drawn, minimalist, detailed
        """
        try:
            # Enhance the prompt based on style
            style_prompts = {
                "technical": "Create a clear, colorful, easy-to-understand technical diagram with labels showing ",
                "hand-drawn": "Create a colorful, hand-drawn style sketch that is easy to understand, illustrating ",
                "minimalist": "Create a minimal, clean, colorful line diagram that is easy to understand, of ",
                "detailed": "Create a detailed, professional, colorful illustration that is easy to understand, of "
            }
            
            prompt = f"{style_prompts.get(style, style_prompts['technical'])}{description}"
            
            response = await openai.Image.acreate(
                prompt=prompt,
                n=1,
                size="1024x1024",
                response_format="b64_json"
            )

            # Save the image
            image_data = base64.b64decode(response.data[0].b64_json)
            image_path = self._temp_dir / f"diagram_{hash(description)}.png"
            
            with open(image_path, "wb") as f:
                f.write(image_data)

            return {
                "path": str(image_path),
                "description": description,
                "style": style
            }
        except Exception as e:
            return {"error": str(e)}

    async def generate_presentation(
        self,
        notes: Dict[str, Any],
        include_diagrams: bool = True,
        duration_per_slide: int = 5,
        voice: str = None,
        style: str = None,
        diagrams: list = None
    ) -> Dict[str, Any]:
        """
        Generate a video presentation from notes and diagrams
        """
        try:
            print('[VideoGen] Starting video generation')
            clips = []
            
            # If diagrams are provided directly, use them as slides
            diagrams_to_use = diagrams if diagrams is not None else notes.get("diagrams") if include_diagrams else []
            
            import tempfile
            import pyttsx3
            from moviepy.editor import AudioFileClip
            from gtts import gTTS
            import random

            # Map style to colors
            style_map = {
                "Dark": {"bg": "black", "text": "white"},
                "Minimal": {"bg": "white", "text": "black"},
                "Colorful": {"bg": "#2563eb", "text": "#fde047"},
                "Default": {"bg": "black", "text": "white"},
            }
            style_key = (style or "Default").capitalize()
            colors = style_map.get(style_key, style_map["Default"])

            narration_audio_paths = []
            # Create slides from sections
            diagram_idx = 0
            n_diagrams = len(diagrams_to_use) if diagrams_to_use else 0
            for i, segment in enumerate(notes.get("segments", [])):
                text = segment.get("text", "")
                speaker = segment.get("speaker", "Speaker 1")
                slide_text = f"{speaker}:\n{text}"

                # --- Audio Preprocessing: Clean up text for TTS, or preprocess audio after TTS ---
                def preprocess_audio(audio_path):
                    # Load audio, apply normalization and noise reduction (simple)
                    try:
                        audio = AudioSegment.from_file(audio_path)
                        audio = effects.normalize(audio)
                        # Optional: noise reduction (simple gate)
                        # For advanced noise reduction, use noisereduce or librosa
                        cleaned_path = audio_path.replace('.mp3', '_cleaned.mp3')
                        audio.export(cleaned_path, format='mp3')
                        return cleaned_path
                    except Exception as e:
                        print(f'[AudioPreprocess] Failed: {e}')
                        return audio_path

                # Insert diagram before or after segment if diagrams are provided
                if diagrams_to_use and diagram_idx < n_diagrams:
                    diagram = diagrams_to_use[diagram_idx]
                    if "diagram_data" in diagram:
                        # Assume diagram_data is a base64-encoded PNG or SVG
                        import base64, tempfile
                        try:
                            img_bytes = base64.b64decode(diagram["diagram_data"])
                            tmp_img = tempfile.NamedTemporaryFile(delete=False, suffix='.png')
                            tmp_img.write(img_bytes)
                            tmp_img.close()
                            img_clip = ImageClip(tmp_img.name)
                            img_clip = img_clip.resize(width=1920)
                            img_clip = img_clip.set_duration(duration_per_slide)
                            clips.append(img_clip)
                            diagram_idx += 1
                            print(f'[VideoGen] Added diagram slide {diagram_idx}')
                        except Exception as e:
                            print(f'[VideoGen] Failed to process diagram: {e}')
                            return {"error": f"Diagram processing failed: {e}"}

                # --- Generate narration audio for this segment ---
                narration_path = None
                try:
                    tts_text = text
                    if voice and voice.lower() == "robot":
                        # Use gTTS with 'en' and slow for robotic effect
                        tts = gTTS(tts_text, lang='en', slow=True)
                        tmp_audio = tempfile.NamedTemporaryFile(delete=False, suffix='.mp3')
                        tts.save(tmp_audio.name)
                        narration_path = tmp_audio.name
                    elif voice and voice.lower() in ["male", "female", "default"]:
                        engine = pyttsx3.init()
                        voices = engine.getProperty('voices')
                        # Try to select male/female voice
                        selected_voice = None
                        for v in voices:
                            if voice.lower() == "male" and "male" in v.name.lower():
                                selected_voice = v.id
                            elif voice.lower() == "female" and "female" in v.name.lower():
                                selected_voice = v.id
                        if selected_voice:
                            engine.setProperty('voice', selected_voice)
                        tmp_audio = tempfile.NamedTemporaryFile(delete=False, suffix='.mp3')
                        engine.save_to_file(tts_text, tmp_audio.name)
                        engine.runAndWait()
                        narration_path = tmp_audio.name
                    else:
                        # Default TTS
                        engine = pyttsx3.init()
                        tmp_audio = tempfile.NamedTemporaryFile(delete=False, suffix='.mp3')
                        engine.save_to_file(tts_text, tmp_audio.name)
                        engine.runAndWait()
                        narration_path = tmp_audio.name
                except Exception as e:
                    narration_path = None
                narration_audio_paths.append(narration_path)

                # --- Create slide ---
                text_clip = TextClip(
                    slide_text,
                    fontsize=24,
                    color=colors["text"],
                    bg_color=colors["bg"],
                    size=(1920, 1080)
                )
                text_clip = text_clip.set_duration(duration_per_slide)
                clips.append(text_clip)

                # Add diagram if available and requested
                if include_diagrams and "diagrams" in notes:
                    for diagram in notes["diagrams"]:
                        if diagram["section"] == segment.get("section"):
                            img_clip = ImageClip(diagram["path"])
                            img_clip = img_clip.resize(width=1920)
                            img_clip = img_clip.set_duration(duration_per_slide)
                            clips.append(img_clip)

            # Combine all clips
            if not clips:
                print('[VideoGen] No slides to render')
                return {"error": "No slides to render (no notes or diagrams)"}
            final_clip = concatenate_videoclips(clips, method="compose")
            print(f'[VideoGen] Concatenated {len(clips)} slides')

            # Combine narration audio if available
            try:
                valid_audio_paths = [p for p in narration_audio_paths if p]
                if valid_audio_paths:
                    # Concatenate audio files
                    audio_clips = [AudioFileClip(p).set_duration(duration_per_slide) for p in valid_audio_paths]
                    from moviepy.editor import concatenate_audioclips
                    audio = concatenate_audioclips(audio_clips)
                    final_clip = final_clip.set_audio(audio)
            except Exception as e:
                pass

            # Export the video
            output_path = self._temp_dir / f"presentation_{hash(json.dumps(notes))}.mp4"
            try:
                final_clip.write_videofile(
                    str(output_path),
                    fps=24,
                    codec='libx264',
                    audio_codec='aac'
                )
                print(f'[VideoGen] Video written to {output_path}')
            except Exception as e:
                print(f'[VideoGen] Failed to write video: {e}')
                return {"error": f"Video export failed: {e}"}
            
            return {
                "path": str(output_path),
                "duration": final_clip.duration,
                "n_slides": len(clips)
            }
        except Exception as e:
            print(f'[VideoGen] Fatal error: {e}')
            return {"error": str(e)}

    async def generate_mermaid_diagram(self, content: str, type: str = "flowchart") -> Dict[str, Any]:
        """
        Generate a Mermaid.js diagram from text description with enhanced error handling and validation.
        
        Args:
            content: Natural language description of the diagram
            type: Type of Mermaid diagram (flowchart, sequence, class, er, gantt)
            
        Returns:
            Dict containing the Mermaid code and diagram type, or an error message
            
        Example:
            {
                "code": "graph TD\n    A[Start] --> B{Is it?}\n    B -->|Yes| C[OK]\n    B -->|No| D[Not OK]",
                "type": "flowchart"
            }
        """
        # Input validation
        valid_types = ["flowchart", "sequence", "class", "er", "gantt"]
        if type not in valid_types:
            return {
                "error": f"Invalid diagram type. Must be one of: {', '.join(valid_types)}",
                "code": "",
                "type": type
            }
            
        if not content or not isinstance(content, str) or len(content.strip()) < 10:
            return {
                "error": "Content must be a non-empty string with at least 10 characters",
                "code": "",
                "type": type
            }
            
        try:
            # Generate system prompt with Mermaid syntax guidelines
            system_prompt = (
                f"Convert the following description into a Mermaid.js {type} diagram syntax. "
                "Follow these rules:\n"
                "1. Use proper Mermaid syntax for the specified diagram type\n"
                "2. Keep the diagram simple and focused on the main concepts\n"
                "3. Use clear, concise labels\n"
                "4. Ensure the diagram is valid Mermaid syntax\n"
                "5. Only output the Mermaid code block, no additional text\n"
                f"Diagram type: {type}"
            )
            
            # Make API call with timeout and retry logic
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    response = await asyncio.wait_for(
                        openai.ChatCompletion.acreate(
                            model="gpt-4",
                            messages=[
                                {"role": "system", "content": system_prompt},
                                {"role": "user", "content": content}
                            ],
                            temperature=0.3,  # Lower temperature for more deterministic output
                            max_tokens=1000
                        ),
                        timeout=30.0  # 30 second timeout
                    )
                    break
                except asyncio.TimeoutError:
                    if attempt == max_retries - 1:
                        raise
                    await asyncio.sleep(1)  # Wait before retry
            
            # Extract and clean the Mermaid code
            mermaid_code = response.choices[0].message.content.strip()
            
            # Remove markdown code block markers if present
            if mermaid_code.startswith('```mermaid'):
                mermaid_code = mermaid_code[10:].lstrip()
            if mermaid_code.startswith('```'):
                mermaid_code = mermaid_code[3:].lstrip()
            if mermaid_code.endswith('```'):
                mermaid_code = mermaid_code[:-3].rstrip()
            
            # Basic validation of the generated code
            if not mermaid_code:
                raise ValueError("Generated Mermaid code is empty")
                
            # Check if it's a valid Mermaid diagram type
            first_line = mermaid_code.split('\n', 1)[0].strip().lower()
            if not any(first_line.startswith(t) for t in valid_types):
                # Try to fix by prepending the diagram type
                mermaid_code = f"{type} {mermaid_code}"
            
            return {
                "code": mermaid_code,
                "type": type,
                "status": "success"
            }
            
        except asyncio.TimeoutError:
            return {
                "error": "Request timed out while generating diagram",
                "code": "",
                "type": type,
                "status": "error"
            }
        except Exception as e:
            return {
                "error": f"Failed to generate diagram: {str(e)}",
                "code": "",
                "type": type,
                "status": "error"
            }
