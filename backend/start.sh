#!/bin/bash

# Exit on error
set -e

# Set environment (default: development)
ENV=${1:-development}
echo "Starting NoteFusion AI Backend in $ENV mode..."

# Activate virtual environment if it exists
if [ -d "venv" ] && [ "$ENV" != "docker" ]; then
    echo "Activating virtual environment..."
    source venv/bin/activate
fi

# Install dependencies if not in Docker
if [ "$ENV" != "docker" ]; then
    echo "Installing dependencies..."
    pip install -r requirements.txt
    
    # Install development dependencies if in development
    if [ "$ENV" = "development" ] && [ -f "requirements-dev.txt" ]; then
        pip install -r requirements-dev.txt
    fi
    
    # Run database migrations
    echo "Running database migrations..."
    alembic upgrade head
fi

# Create uploads directory if it doesn't exist
mkdir -p uploads

# Start the application based on the environment
if [ "$ENV" = "production" ]; then
    echo "Starting Gunicorn server..."
    exec gunicorn -k uvicorn.workers.UvicornWorker -w 4 -t 120 --log-level info --bind 0.0.0.0:8000 app.main:app
elif [ "$ENV" = "development" ]; then
    echo "Starting Uvicorn development server..."
    exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --log-level debug
else
    echo "Starting Uvicorn server..."
    exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --log-level info
fi
