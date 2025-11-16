"""Main application module for NoteFusion AI backend."""
import logging
from fastapi import FastAPI

# Import core components
from app.core.app_factory import create_app
from app.core.logging_config import setup_logging

# Import routers
from app.api.v1.api import api_router

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)

# Create the FastAPI application
app = create_app()

# Include API router
app.include_router(api_router, prefix="/api/v1")
