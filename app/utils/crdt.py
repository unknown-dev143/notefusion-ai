"""
app/utils/crdt.py
------------------
Conflict-free Replicated Data Type (CRDT) resolver for real-time collaboration.
Implements:
1. LWW (Last-Write-Wins) Register for simple field synchronization (e.g., note title).
2. LWW-Element-Set sequence state merger for rich/text collaborative editing.
"""

from typing import Dict, Any, List, Optional
import time

class CRDTResolver:
    @staticmethod
    def merge_titles(title_a: Dict[str, Any], title_b: Dict[str, Any]) -> Dict[str, Any]:
        """
        Merge two title register states using Last-Write-Wins logic.
        Each title dictionary contains:
            {
                "value": str,
                "timestamp": float,
                "client_id": str
            }
        """
        t_a = title_a.get("timestamp", 0.0)
        t_b = title_b.get("timestamp", 0.0)
        if t_b > t_a:
            return title_b
        elif t_b == t_a:
            if title_b.get("client_id", "") > title_a.get("client_id", ""):
                return title_b
        return title_a

    @staticmethod
    def merge_text_states(state_a: List[Dict[str, Any]], state_b: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Merge two sequence CRDT states. Each item represents a character/atom:
            {
                "id": str,          # Fractional index string for ordering (e.g., "1.5")
                "value": str,       # Character or block value
                "timestamp": float, # Time of insertion/update
                "client_id": str,   # ID of editing client
                "deleted": bool     # Tombstone indicating deletion
            }
        """
        merged: Dict[str, Dict[str, Any]] = {}

        for item in state_a + state_b:
            char_id = item.get("id")
            if not char_id:
                continue
            if char_id not in merged:
                merged[char_id] = item
            else:
                existing = merged[char_id]
                existing_t = existing.get("timestamp", 0.0)
                item_t = item.get("timestamp", 0.0)
                if item_t > existing_t:
                    merged[char_id] = item
                elif item_t == existing_t:
                    if item.get("client_id", "") > existing.get("client_id", ""):
                        merged[char_id] = item

        # Sort based on fractional index position key
        sorted_keys = sorted(merged.keys())
        return [merged[k] for k in sorted_keys]

    @staticmethod
    def state_to_text(state: List[Dict[str, Any]]) -> str:
        """Helper to compile the final text string from a list of CRDT items."""
        return "".join([item["value"] for item in state if not item.get("deleted", False)])
