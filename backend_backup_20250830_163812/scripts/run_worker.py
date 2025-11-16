#!/usr/bin/env python3
"""Run Celery worker for background tasks."""
import os
import sys
from pathlib import Path

# Add the app directory to the Python path
sys.path.append(str(Path(__file__).parent.parent))

# Set environment variables
os.environ["ENV"] = "development"

# Import Celery app
from app.worker import celery_app

def run_worker():
    """Run Celery worker."""
    # Start Celery worker
    celery_app.worker_main([
        "worker",
        "--loglevel=info",
        "--concurrency=4",
        "--hostname=worker1@%h",
        "--queues=default,high_priority,low_priority"
    ])

if __name__ == "__main__":
    run_worker()
