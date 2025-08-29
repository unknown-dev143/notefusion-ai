<<<<<<< HEAD
from typing import List, Dict, Any
import torch

class DiarizationService:
    def __init__(self):
        self._pipeline = None
        try:
            from pyannote.audio import Pipeline
            self._pipeline = Pipeline.from_pretrained(
                "pyannote/speaker-diarization",
                use_auth_token="your_huggingface_token"  # Replace with actual token
            )
        except Exception as e:
            print(f"Warning: Diarization pipeline not available: {e}")

    def diarize(self, audio_path: str) -> List[Dict[str, Any]]:
        """
        Perform speaker diarization on audio file
        Returns a list of segments with speaker labels and timestamps
        """
        if not self._pipeline:
            return []

        try:
            # Run the diarization pipeline
            diarization = self._pipeline(audio_path)
            
            # Convert the diarization result into a list of segments
            segments = []
            for turn, _, speaker in diarization.itertracks(yield_label=True):
                segments.append({
                    "speaker": speaker,
                    "start": turn.start,
                    "end": turn.end
                })
            
            return segments
        except Exception as e:
            print(f"Diarization error: {e}")
            return []
=======
from typing import List, Dict, Any
import torch

class DiarizationService:
    def __init__(self):
        self._pipeline = None
        try:
            from pyannote.audio import Pipeline
            self._pipeline = Pipeline.from_pretrained(
                "pyannote/speaker-diarization",
                use_auth_token="your_huggingface_token"  # Replace with actual token
            )
        except Exception as e:
            print(f"Warning: Diarization pipeline not available: {e}")

    def diarize(self, audio_path: str) -> List[Dict[str, Any]]:
        """
        Perform speaker diarization on audio file
        Returns a list of segments with speaker labels and timestamps
        """
        if not self._pipeline:
            return []

        try:
            # Run the diarization pipeline
            diarization = self._pipeline(audio_path)
            
            # Convert the diarization result into a list of segments
            segments = []
            for turn, _, speaker in diarization.itertracks(yield_label=True):
                segments.append({
                    "speaker": speaker,
                    "start": turn.start,
                    "end": turn.end
                })
            
            return segments
        except Exception as e:
            print(f"Diarization error: {e}")
            return []
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
