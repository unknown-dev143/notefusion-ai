#!/bin/bash
set -e

# Wait for database to be ready
echo "Waiting for database..."
until pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER; do
  sleep 1
done

# Run database migrations
echo "Running migrations..."
alembic upgrade head

# Start the application
echo "Starting application..."
exec gunicorn app.main:app --worker-class uvicorn.workers.UvicornWorker --workers 4 --bind 0.0.0.0:$PORT
