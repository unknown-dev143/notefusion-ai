import logging
from typing import Dict, Any, Optional
from datetime import datetime, timedelta

class RecallEngine:
    """
    Job: Fight forgetting.
    Memory Trainer Role: Spaced repetition logic (SRS).
    """
    def __init__(self):
        pass

    def calculate_next_review(self, current_interval: int, ease_factor: float, quality: int, decay_factor: float = 1.0) -> Dict[str, Any]:
        """
        Calculates intervals based on SM-2 + Cognitive Decay.
        quality: 1 (Forgot) to 5 (Perfect)
        """
        # Weighted decay from user's cognitive profile
        weighted_decay = 1.0 / decay_factor

        if quality < 3: # Forgot (0-2)
            new_interval = 1
            new_ease = max(1.3, ease_factor - 0.2)
        else: # Recalled (3-5)
            if current_interval == 0:
                new_interval = 1
            elif current_interval == 1:
                new_interval = 6
            else:
                new_interval = round(current_interval * ease_factor * weighted_decay)
            
            # Adjust ease factor
            new_ease = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
            
        return {
            "interval": new_interval,
            "ease_factor": round(new_ease, 2),
            "next_review": datetime.now() + timedelta(days=new_interval)
        }
