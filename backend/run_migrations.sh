#!/bin/bash

# Initialize alembic if not already done
if [ ! -d "alembic/versions" ]; then
    echo "Initializing alembic..."
    alembic init alembic
    
    # Update alembic.ini with the correct database URL
    sed -i "s|sqlalchemy.url = .*|sqlalchemy.url = ${DATABASE_URL}|g" alembic.ini
    
    # Update env.py to use the correct models
    echo "from app.models.base import Base" > alembic/env.py.tmp
    echo "target_metadata = Base.metadata" >> alembic/env.py.tmp
    cat alembic/env.py >> alembic/env.py.tmp
    mv alembic/env.py.tmp alembic/env.py
    
    # Create initial migration
    alembic revision --autogenerate -m "Initial migration"
fi

# Run migrations
alembic upgrade head

echo "Database migrations completed successfully!"
