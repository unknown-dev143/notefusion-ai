#!/usr/bin/env python3
"""Run Celery beat for scheduled tasks."""
import os
import sys
from pathlib import Path

# Add the app directory to the Python path
sys.path.append(str(Path(__file__).parent.parent))

# Set environment variables
os.environ["ENV"] = "development"

# Import Celery app
from app.worker import celery_app

def run_beat():
    """Run Celery beat."""
    # Start Celery beat
    celery_app.Beat(
        loglevel="info",
        schedule=os.path.join(os.getcwd(), "celerybeat-schedule")
    ).run()

if __name__ == "__main__":
    run_beat()
