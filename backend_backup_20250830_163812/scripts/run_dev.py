#!/usr/bin/env python3
"""Run the development server."""
import uvicorn
import os
from pathlib import Path

if __name__ == "__main__":
    # Set up environment
    os.environ["ENV"] = "development"
    
    # Run the FastAPI app with auto-reload
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_dirs=["app"],
        reload_excludes=["*.pyc", "*.pyo", "*__pycache__*"],
        log_level="info"
    )
