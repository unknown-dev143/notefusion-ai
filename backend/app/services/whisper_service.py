<<<<<<< HEAD
import os
import tempfile
from typing import Dict, List, Optional, Union, BinaryIO
import numpy as np
import whisper
from pydub import AudioSegment

class WhisperService:
    def __init__(self, model_name: str = "base"):
        """
        Initialize the Whisper transcription service.
        
        Args:
            model_name: Name of the Whisper model to use (tiny, base, small, medium, large)
        """
        self.model_name = model_name
        self.model = None
        self._load_model()
    
    def _load_model(self):
        """Load the Whisper model."""
        try:
            self.model = whisper.load_model(self.model_name)
        except Exception as e:
            raise RuntimeError(f"Failed to load Whisper model: {str(e)}")
    
    def transcribe_audio_file(
        self,
        audio_path: str,
        language: Optional[str] = None,
        initial_prompt: Optional[str] = None,
        temperature: float = 0.0,
    ) -> Dict:
        """
        Transcribe an audio file using Whisper.
        
        Args:
            audio_path: Path to the audio file
            language: Language code (e.g., 'en' for English)
            initial_prompt: Optional initial prompt for the model
            temperature: Sampling temperature (0-1, lower is more deterministic)
            
        Returns:
            Dictionary containing the transcription result
        """
        if not os.path.exists(audio_path):
            raise FileNotFoundError(f"Audio file not found: {audio_path}")
            
        try:
            result = self.model.transcribe(
                audio_path,
                language=language,
                initial_prompt=initial_prompt,
                temperature=temperature,
                fp16=False  # Disable FP16 for better compatibility
            )
            return {
                "text": result["text"].strip(),
                "language": result.get("language", language),
                "segments": [
                    {
                        "start": segment["start"],
                        "end": segment["end"],
                        "text": segment["text"].strip(),
                        "no_speech_prob": segment.get("no_speech_prob", 0.0),
                    }
                    for segment in result.get("segments", [])
                ]
            }
        except Exception as e:
            raise RuntimeError(f"Transcription failed: {str(e)}")
    
    def transcribe_audio_chunk(
        self,
        audio_data: Union[bytes, BinaryIO, np.ndarray],
        sample_rate: int = 16000,
        **kwargs
    ) -> Dict:
        """
        Transcribe a chunk of audio data.
        
        Args:
            audio_data: Audio data as bytes, file-like object, or numpy array
            sample_rate: Sample rate of the audio data
            **kwargs: Additional arguments for transcribe_audio_file
            
        Returns:
            Dictionary containing the transcription result
        """
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
            try:
                if isinstance(audio_data, bytes):
                    temp_file.write(audio_data)
                elif hasattr(audio_data, 'read'):
                    temp_file.write(audio_data.read())
                elif isinstance(audio_data, np.ndarray):
                    import soundfile as sf
                    sf.write(temp_file.name, audio_data, sample_rate)
                else:
                    raise ValueError("Unsupported audio data format")
                
                temp_file.flush()
                return self.transcribe_audio_file(temp_file.name, **kwargs)
            finally:
                try:
                    os.unlink(temp_file.name)
                except:
                    pass
    
    def transcribe_chunked_audio(
        self,
        audio_chunks: List[Union[bytes, BinaryIO, np.ndarray]],
        sample_rate: int = 16000,
        **kwargs
    ) -> Dict:
        """
        Transcribe multiple audio chunks as a single audio stream.
        
        Args:
            audio_chunks: List of audio chunks
            sample_rate: Sample rate of the audio data
            **kwargs: Additional arguments for transcribe_audio_file
            
        Returns:
            Dictionary containing the combined transcription result
        """
        if not audio_chunks:
            return {"text": "", "segments": []}
            
        # Combine chunks into a single audio file
        combined = None
        
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
            try:
                for chunk in audio_chunks:
                    if isinstance(chunk, bytes):
                        with tempfile.NamedTemporaryFile(delete=False) as chunk_file:
                            chunk_file.write(chunk)
                            chunk_file.flush()
                            audio = AudioSegment.from_file(chunk_file.name)
                    elif hasattr(chunk, 'read'):
                        with tempfile.NamedTemporaryFile(delete=False) as chunk_file:
                            chunk_file.write(chunk.read())
                            chunk_file.flush()
                            audio = AudioSegment.from_file(chunk_file.name)
                    elif isinstance(chunk, np.ndarray):
                        import soundfile as sf
                        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as chunk_file:
                            sf.write(chunk_file.name, chunk, sample_rate)
                            audio = AudioSegment.from_wav(chunk_file.name)
                    else:
                        raise ValueError("Unsupported audio chunk format")
                    
                    if combined is None:
                        combined = audio
                    else:
                        combined += audio
                
                # Export combined audio
                combined.export(temp_file.name, format="wav")
                
                # Transcribe the combined audio
                return self.transcribe_audio_file(temp_file.name, **kwargs)
                
            finally:
                try:
                    os.unlink(temp_file.name)
                except:
                    pass

# Singleton instance
whisper_service = WhisperService()

def get_whisper_service() -> WhisperService:
    """Get the shared Whisper service instance."""
    return whisper_service

if __name__ == "__main__":
    import sys
    import json
    from pathlib import Path
    
    if len(sys.argv) < 2:
        print("Usage: python whisper_service.py <audio_file_path> [output_json]")
        sys.exit(1)
    
    audio_path = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else None
    
    try:
        service = WhisperService()
        print(f"Transcribing: {audio_path}")
        result = service.transcribe_audio_file(audio_path)
        
        if output_path:
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(result, f, ensure_ascii=False, indent=2)
            print(f"Transcription saved to: {output_path}")
        else:
            print("Transcription result:")
            print(json.dumps(result, ensure_ascii=False, indent=2))
            
    except Exception as e:
        print(f"Error during transcription: {e}", file=sys.stderr)
        sys.exit(1)
=======
import whisper

class WhisperTranscriber:
    def __init__(self, model_name="base"):
        self.model = whisper.load_model(model_name)

    def transcribe(self, audio_path: str) -> str:
        result = self.model.transcribe(audio_path)
        return result["text"]

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python whisper_service.py <audio_file_path>")
        sys.exit(1)
    audio_path = sys.argv[1]
    transcriber = WhisperTranscriber()
    print(f"Transcribing: {audio_path}")
    try:
        text = transcriber.transcribe(audio_path)
        print("Transcription:")
        print(text)
    except Exception as e:
        print(f"Error during transcription: {e}")
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
