import json
from pathlib import Path
from typing import Dict, Any, Optional
import numpy as np

class PersistentCache:
    def __init__(self, cache_dir: str):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)

    def get(self, key: str) -> Optional[Dict[str, Any]]:
        cache_file = self.cache_dir / f"{hash(key)}.json"
        if cache_file.exists():
            return json.loads(cache_file.read_text())
        return None

    def set(self, key: str, value: Dict[str, Any]):
        cache_file = self.cache_dir / f"{hash(key)}.json"
        cache_file.write_text(json.dumps(value))

    def clear(self):
        for file in self.cache_dir.glob("*.json"):
            file.unlink()

class BatchProcessor:
    @staticmethod
    def chunk_list(lst, chunk_size):
        """Split a list into chunks of specified size"""
        return [lst[i:i + chunk_size] for i in range(0, len(lst), chunk_size)]

    @staticmethod
    def estimate_memory(audio_duration: float) -> float:
        """Estimate memory requirements in GB for processing"""
        # Rough estimation based on audio duration
        return (audio_duration * 16000 * 2 * 2) / (1024 ** 3)  # Stereo 16-bit audio

class GPUManager:
    @staticmethod
    def get_available_memory():
        """Get available GPU memory"""
        try:
            import torch
            if torch.cuda.is_available():
                return torch.cuda.get_device_properties(0).total_memory
        except ImportError:
            return 0
        return 0

    @staticmethod
    def optimize_batch_size(total_items: int, memory_per_item: float) -> int:
        """Calculate optimal batch size based on available GPU memory"""
        available_memory = GPUManager.get_available_memory()
        if available_memory == 0:
            return 1
        
        max_items = int(available_memory / (memory_per_item * 1024 ** 3))
        return min(max_items, total_items, 10)  # Cap at 10 items per batch
