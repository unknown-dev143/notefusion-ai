# Start Celery worker and beat scheduler for NoteFusion AI

# Set environment variables
$env:PYTHONPATH = "$PWD"
$env:CELERY_BROKER_URL = "redis://localhost:6379/0"
$env:CELERY_RESULT_BACKEND = "redis://localhost:6379/0"

# Start Celery worker
Start-Process -NoNewWindow -FilePath "celery" -ArgumentList "-A app.core.celery_app worker --loglevel=info -Q video,audio,export,default --concurrency=1 -n worker1@%h"

# Start Celery beat for scheduled tasks
Start-Process -NoNewWindow -FilePath "celery" -ArgumentList "-A app.core.celery_app beat --loglevel=info"
