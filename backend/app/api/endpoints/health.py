"""Health check endpoints for monitoring the application status."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any
import logging
import redis
import json

from app.db.session import get_db
from app.core.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/health", response_model=Dict[str, Any])
async def health_check() -> Dict[str, Any]:
    """Basic health check endpoint."""
    return {
        "status": "ok",
        "service": "NoteFusion AI API",
        "version": "1.0.0"
    }

@router.get("/health/db", response_model=Dict[str, Any])
async def db_health_check(db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    """Database health check endpoint."""
    try:
        # Test database connection
        result = await db.execute("SELECT 1")
        result.scalar()
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        raise HTTPException(
            status_code=503,
            detail={"status": "error", "database": "connection failed", "error": str(e)}
        )

@router.get("/health/redis", response_model=Dict[str, Any])
async def redis_health_check() -> Dict[str, Any]:
    """Redis health check endpoint."""
    try:
        # Test Redis connection
        r = redis.Redis.from_url(settings.REDIS_URL)
        r.ping()
        return {"status": "ok", "redis": "connected"}
    except Exception as e:
        logger.error(f"Redis health check failed: {str(e)}")
        raise HTTPException(
            status_code=503,
            detail={"status": "error", "redis": "connection failed", "error": str(e)}
        )

@router.get("/health/full", response_model=Dict[str, Any])
async def full_health_check(
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """Comprehensive health check including all dependencies."""
    checks = {
        "api": {"status": "ok"},
        "database": {"status": "ok"},
        "redis": {"status": "ok"},
        "storage": {"status": "ok"},
    }
    
    # Check database
    try:
        result = await db.execute("SELECT 1")
        result.scalar()
    except Exception as e:
        checks["database"].update({
            "status": "error",
            "error": str(e)
        })
    
    # Check Redis
    try:
        r = redis.Redis.from_url(settings.REDIS_URL)
        r.ping()
    except Exception as e:
        checks["redis"].update({
            "status": "error",
            "error": str(e)
        })
    
    # Check storage
    try:
        import os
        test_file = os.path.join(settings.UPLOAD_FOLDER, ".test")
        with open(test_file, "w") as f:
            f.write("test")
        os.remove(test_file)
    except Exception as e:
        checks["storage"].update({
            "status": "error",
            "error": str(e)
        })
    
    # Determine overall status
    status = "ok"
    for check in checks.values():
        if check["status"] != "ok":
            status = "error"
            break
    
    return {
        "status": status,
        "checks": checks
    }
