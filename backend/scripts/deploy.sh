#!/bin/bash

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Starting deployment process...${NC}"

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from template...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env file. Please update it with your configuration.${NC}"
    exit 1
fi

# Load environment variables
echo -e "${YELLOW}🔧 Loading environment variables...${NC}"
source .env

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "❌ Python 3 is required but not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check Python version
PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:3])))' | cut -d. -f1-2)
if [ "$(printf '%s\n' "3.8" "$PYTHON_VERSION" | sort -V | head -n1)" != "3.8" ]; then
    echo -e "❌ Python 3.8 or higher is required. Found Python $PYTHON_VERSION"
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}🔧 Creating virtual environment...${NC}"
    python3 -m venv venv
    source venv/bin/activate
    
    # Upgrade pip
    echo -e "${YELLOW}⬆️  Upgrading pip...${NC}"
    pip install --upgrade pip
    
    # Install dependencies
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    pip install -r requirements.txt
    
    # Install development dependencies if in development mode
    if [ "$ENVIRONMENT" = "development" ]; then
        echo -e "${YELLOW}📦 Installing development dependencies...${NC}"
        pip install -r requirements-dev.txt
    fi
else
    source venv/bin/activate
fi

# Run database migrations
echo -e "${YELLOW}🔄 Running database migrations...${NC}"
alembic upgrade head

# Collect static files
echo -e "${YELLOW}📁 Collecting static files...${NC}"
mkdir -p static
python -c "from app.core.static_files import setup_static_files; from fastapi import FastAPI; app = FastAPI(); setup_static_files(app)"

# Start the application
echo -e "${GREEN}🚀 Starting application...${NC}"
if [ "$ENVIRONMENT" = "production" ]; then
    # Use Gunicorn in production
    if ! command -v gunicorn &> /dev/null; then
        echo -e "${YELLOW}⚠️  Gunicorn not found. Installing...${NC}"
        pip install gunicorn
    fi
    
    # Create logs directory if it doesn't exist
    mkdir -p logs
    
    # Start Gunicorn
    echo -e "${GREEN}🌐 Starting Gunicorn server...${NC}"
    gunicorn -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000 app.main:app \
        --access-logfile logs/access.log \
        --error-logfile logs/error.log \
        --log-level info \
        --timeout 120 \
        --keep-alive 5 \
        --worker-connections 1000 \
        --max-requests 1000 \
        --max-requests-jitter 50 \
        --preload
else
    # Use Uvicorn in development
    echo -e "${GREEN}🚀 Starting Uvicorn server in development mode...${NC}"
    uvicorn app.main:app \
        --host 0.0.0.0 \
        --port 8000 \
        --reload \
        --log-level info \
        --use-colors \
        --reload-dir app \
        --reload-dir config \
        --reload-include "*.py" \
        --reload-include "*.yaml" \
        --reload-include "*.json"
fi
