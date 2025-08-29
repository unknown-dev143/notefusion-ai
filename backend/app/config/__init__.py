"""Configuration package for NoteFusion AI."""
import os
from pathlib import Path
from typing import List

# Determine the environment
ENV = os.getenv("ENV", "development").lower()

# Import the appropriate settings based on the environment
if ENV == "production":
    from .production import settings
else:
    from .development import settings

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_FOLDER, exist_ok=True)

__all__ = ["settings"]
__all__ = ["settings"]
