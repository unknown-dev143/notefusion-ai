"""Celery configuration for NoteFusion AI."""
import os
from datetime import timedelta
from kombu import Queue, Exchange

# Broker settings
broker_url = os.getenv('CELERY_BROKER_URL', 'redis://localhost:6379/0')
result_backend = os.getenv('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0')

# Task settings
task_serializer = 'json'
result_serializer = 'json'
accept_content = ['json']
timezone = 'UTC'
enable_utc = True

# Task result settings
result_expires = 3600  # 1 hour
result_persistent = True

# Worker settings
worker_prefetch_multiplier = 1  # Process one task at a time
worker_concurrency = 1  # Number of concurrent workers
worker_max_tasks_per_child = 100  # Restart worker after processing 100 tasks
worker_disable_rate_limits = True

# Task timeouts
task_time_limit = 3600  # 1 hour
task_soft_time_limit = 3500  # 58 minutes
task_acks_late = True  # Acknowledge task after it's executed
task_reject_on_worker_lost = True  # Requeue task if worker is lost

# Task queues
task_queues = (
    Queue('default', Exchange('default'), routing_key='default'),
    Queue('video', Exchange('video'), routing_key='video.high'),
    Queue('audio', Exchange('audio'), routing_key='audio.medium'),
    Queue('export', Exchange('export'), routing_key='export.low'),
)

task_routes = {
    'app.tasks.video_tasks.*': {'queue': 'video', 'routing_key': 'video.high'},
    'app.tasks.audio_tasks.*': {'queue': 'audio', 'routing_key': 'audio.medium'},
    'app.tasks.export_tasks.*': {'queue': 'export', 'routing_key': 'export.low'},
}

# Beat settings for periodic tasks
beat_schedule = {
    'cleanup-temp-files': {
        'task': 'app.tasks.cleanup.cleanup_temp_files',
        'schedule': timedelta(hours=24),  # Run daily
        'options': {'queue': 'export'},
    },
}

# Task error handling
task_annotations = {
    'app.tasks.video_tasks.process_video_generation': {
        'rate_limit': '1/m',  # 1 task per minute per worker
        'time_limit': 3600,   # 1 hour time limit
        'soft_time_limit': 3500,
        'max_retries': 3,
        'default_retry_delay': 300,  # 5 minutes
    },
    'app.tasks.audio_tasks.*': {
        'time_limit': 1800,  # 30 minutes
        'soft_time_limit': 1700,
    },
    'app.tasks.export_tasks.*': {
        'time_limit': 7200,  # 2 hours
        'soft_time_limit': 7000,
    },
}

# Import task modules
task_modules = [
    'app.tasks.video_tasks',
    'app.tasks.audio_tasks',
    'app.tasks.export_tasks',
    'app.tasks.cleanup',
]
