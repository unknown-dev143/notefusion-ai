from typing import Optional, List, Dict, Any
import openai
from pathlib import Path
import json
from moviepy.editor import (
    TextClip, ImageClip, VideoFileClip, AudioFileClip,
    CompositeVideoClip, concatenate_videoclips, ColorClip
)
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import tempfile
import os
import asyncio
from gtts import gTTS
import manim
from manim import *

class EducationalVideoService:
    def __init__(self, api_key: Optional[str] = None):
        if api_key:
            openai.api_key = api_key
        self._temp_dir = Path(tempfile.gettempdir()) / "notefusion_edu"
        self._temp_dir.mkdir(exist_ok=True)

    async def generate_educational_video(
        self,
        topic: str,
        content: Dict[str, Any],
        style: str = "engaging",
        duration: int = 300,  # 5 minutes default
        include_animations: bool = True,
        difficulty: str = "medium",
        teaching_style: Optional[str] = None,
        include_quizzes: bool = True,
        generate_learning_path: bool = True
    ) -> Dict[str, Any]:
        """
        Generate an educational video explaining a specific topic
        """
        try:
            # Generate script and storyboard using GPT-4
            script = await self._generate_script(topic, content, style, duration)
            storyboard = await self._generate_storyboard(script)
            
            # Create visual elements
            scenes = []
            for scene in storyboard["scenes"]:
                # Generate visuals based on scene type
                if scene["type"] == "concept_explanation":
                    clip = await self._create_concept_scene(scene)
                elif scene["type"] == "mathematical":
                    clip = await self._create_math_animation(scene)
                elif scene["type"] == "diagram":
                    clip = await self._create_diagram_scene(scene)
                elif scene["type"] == "summary":
                    clip = await self._create_summary_scene(scene)
                
                scenes.append(clip)

            # Generate voiceover
            audio_path = await self._generate_voiceover(script["narration"])

            # Combine everything
            final_video = await self._compose_video(scenes, audio_path, style)
            
            return {
                "video_path": final_video,
                "duration": duration,
                "script": script,
                "topics_covered": script["key_points"]
            }
        except Exception as e:
            return {"error": str(e)}

    async def _generate_script(self, topic: str, content: Dict[str, Any], style: str, duration: int) -> Dict[str, Any]:
        """Generate an educational script using GPT-4"""
        prompt = f"""Create an educational video script for topic: {topic}
Style: {style}
Duration: {duration} seconds

The script should include:
1. Clear introduction
2. Key concepts explained simply
3. Visual cues for diagrams/animations
4. Engaging examples
5. Summary of key points

Use content: {content.get('text', '')}"""

        response = await openai.ChatCompletion.acreate(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert educational content creator."},
                {"role": "user", "content": prompt}
            ]
        )

        # Parse the response into structured script
        script_text = response.choices[0].message.content
        return self._parse_script(script_text)

    async def _create_concept_scene(self, scene: Dict[str, Any]) -> VideoFileClip:
        """Create an engaging scene explaining a concept"""
        # Create background
        bg = ColorClip(size=(1920, 1080), color=[255, 255, 255])
        
        # Add title
        title = TextClip(
            scene["title"],
            fontsize=60,
            color='black',
            size=(1920, 100)
        ).set_position(('center', 100))

        # Create explanation text with animation
        text_clips = []
        y_position = 250
        for point in scene["points"]:
            clip = (TextClip(point, fontsize=40, color='black', size=(1600, None))
                   .set_position(('center', y_position))
                   .crossfaderight(duration=0.5))
            text_clips.append(clip)
            y_position += 150

        # Combine all elements
        return CompositeVideoClip(
            [bg, title] + text_clips,
            size=(1920, 1080)
        ).set_duration(scene["duration"])

    async def _create_math_animation(self, scene: Dict[str, Any]) -> VideoFileClip:
        """Create mathematical animations using Manim"""
        class MathScene(Scene):
            def construct(self):
                # Create mathematical animations based on scene content
                equation = MathTex(scene["equation"])
                self.play(Write(equation))
                
                if "steps" in scene:
                    for step in scene["steps"]:
                        next_eq = MathTex(step)
                        self.play(Transform(equation, next_eq))
                
                self.wait()

        # Render the animation
        with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as temp_file:
            scene_path = temp_file.name
            scene = MathScene()
            scene.render()
            
            return VideoFileClip(scene_path)

    async def _create_diagram_scene(self, scene: Dict[str, Any]) -> VideoFileClip:
        """Create animated diagrams"""
        # Generate diagram using DALL-E
        response = await openai.Image.acreate(
            prompt=scene["description"],
            n=1,
            size="1024x1024",
            response_format="b64_json"
        )

        # Save and load the diagram
        img_data = response.data[0].b64_json
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as temp_file:
            temp_file.write(base64.b64decode(img_data))
            
            # Create video clip from image with zoom effect
            clip = (ImageClip(temp_file.name)
                   .resize(width=1920)
                   .set_position('center')
                   .resize(lambda t: 1 + 0.1 * t))  # Slow zoom effect
            
            return clip.set_duration(scene["duration"])

    async def _generate_voiceover(self, narration: str) -> str:
        """Generate voiceover using gTTS"""
        with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as temp_file:
            tts = gTTS(text=narration, lang='en')
            tts.save(temp_file.name)
            return temp_file.name

    async def _compose_video(self, scenes: List[VideoFileClip], audio_path: str, style: str) -> str:
        """Compose the final video with all elements"""
        # Combine all scenes
        final_video = concatenate_videoclips(scenes)
        
        # Add audio
        audio = AudioFileClip(audio_path)
        final_video = final_video.set_audio(audio)
        
        # Add style effects based on style parameter
        if style == "engaging":
            final_video = self._add_engaging_effects(final_video)
        elif style == "professional":
            final_video = self._add_professional_effects(final_video)
        
        # Export the video
        output_path = self._temp_dir / f"educational_video_{hash(str(scenes))}.mp4"
        final_video.write_videofile(str(output_path), fps=24, codec='libx264')
        
        return str(output_path)

    def _parse_script(self, script_text: str) -> Dict[str, Any]:
        """Parse the GPT-generated script into structured format"""
        sections = script_text.split('\n\n')
        
        script = {
            "title": sections[0],
            "introduction": sections[1],
            "key_points": [],
            "scenes": [],
            "narration": script_text
        }

        current_section = None
        for section in sections[2:]:
            if section.startswith('Key Point:'):
                script["key_points"].append(section[10:].strip())
            elif section.startswith('Scene:'):
                current_section = {
                    "content": section[6:].strip(),
                    "duration": 15  # Default duration
                }
                script["scenes"].append(current_section)
            elif current_section:
                current_section["content"] += "\n" + section

        return script
