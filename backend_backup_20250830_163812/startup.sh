#!/bin/sh

# Wait for PostgreSQL to be ready
until PGPASSWORD=$POSTGRES_PASSWORD psql -h "db" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

# Run database migrations
echo "Running database migrations..."
alembic upgrade head

# Start the application
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
