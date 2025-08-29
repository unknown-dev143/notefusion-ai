from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST, CollectorRegistry, Gauge, Counter, Histogram
import psutil
import os
from typing import Dict, Any, Optional
import logging
import time

logger = logging.getLogger(__name__)

# Create a registry for Prometheus metrics
registry = CollectorRegistry()

# Define metrics
REQUEST_COUNT = Counter(
    'http_requests_total',
    'Total number of HTTP requests',
    ['method', 'endpoint', 'status_code'],
    registry=registry
)

REQUEST_LATENCY = Histogram(
    'http_request_duration_seconds',
    'HTTP request latency in seconds',
    ['method', 'endpoint'],
    registry=registry
)

DB_QUERIES_TOTAL = Counter(
    'db_queries_total',
    'Total number of database queries',
    ['operation', 'table'],
    registry=registry
)

DB_QUERY_DURATION = Histogram(
    'db_query_duration_seconds',
    'Database query duration in seconds',
    ['operation', 'table'],
    registry=registry
)

SYSTEM_CPU_USAGE = Gauge(
    'system_cpu_usage_percent',
    'System CPU usage percentage',
    registry=registry
)

SYSTEM_MEMORY_USAGE = Gauge(
    'system_memory_usage_bytes',
    'System memory usage in bytes',
    registry=registry
)

APP_MEMORY_USAGE = Gauge(
    'app_memory_usage_bytes',
    'Application memory usage in bytes',
    registry=registry
)

class HealthCheck:
    """Health check service"""
    
    def __init__(self):
        self.startup_time = time.time()
        self.checks = {
            'database': self.check_database,
            'redis': self.check_redis,
            'storage': self.check_storage,
        }
    
    async def check_database(self) -> Dict[str, Any]:
        """Check database connection"""
        try:
            # Add your database check logic here
            # Example: await database.execute("SELECT 1")
            return {"status": "healthy"}
        except Exception as e:
            logger.error(f"Database health check failed: {str(e)}", exc_info=True)
            return {
                "status": "unhealthy",
                "error": str(e)
            }
    
    async def check_redis(self) -> Dict[str, Any]:
        """Check Redis connection"""
        try:
            # Add your Redis check logic here
            # Example: await redis.ping()
            return {"status": "healthy"}
        except Exception as e:
            logger.error(f"Redis health check failed: {str(e)}", exc_info=True)
            return {
                "status": "unhealthy",
                "error": str(e)
            }
    
    async def check_storage(self) -> Dict[str, Any]:
        """Check storage (local/S3)"""
        try:
            # Add your storage check logic here
            return {"status": "healthy"}
        except Exception as e:
            logger.error(f"Storage health check failed: {str(e)}", exc_info=True)
            return {
                "status": "unhealthy",
                "error": str(e)
            }
    
    async def get_system_metrics(self) -> Dict[str, Any]:
        """Get system metrics"""
        process = psutil.Process()
        with process.oneshot():
            memory_info = process.memory_info()
            
            return {
                "cpu_percent": process.cpu_percent(),
                "memory_rss": memory_info.rss,  # in bytes
                "memory_vms": memory_info.vms,  # in bytes
                "memory_percent": process.memory_percent(),
                "threads": process.num_threads(),
                "fds": process.num_fds() if hasattr(process, 'num_fds') else None,
                "cpu_count": psutil.cpu_count(),
                "boot_time": psutil.boot_time(),
                "uptime": time.time() - psutil.boot_time(),
                "app_uptime": time.time() - self.startup_time,
            }

# Initialize health check service
health_check = HealthCheck()

# Create router
router = APIRouter(tags=["Monitoring"])

@router.get("/health", summary="Health check endpoint")
async def health():
    """
    Health check endpoint that verifies all required services are operational.
    Returns 200 if all services are healthy, 503 otherwise.
    """
    results = {}
    all_healthy = True
    
    # Run all health checks
    for name, check in health_check.checks.items():
        try:
            results[name] = await check()
            if results[name].get("status") != "healthy":
                all_healthy = False
        except Exception as e:
            logger.error(f"Health check {name} failed: {str(e)}", exc_info=True)
            results[name] = {"status": "error", "error": str(e)}
            all_healthy = False
    
    # Add system metrics
    try:
        results["system"] = await health_check.get_system_metrics()
    except Exception as e:
        logger.error(f"Failed to get system metrics: {str(e)}", exc_info=True)
        results["system"] = {"status": "error", "error": str(e)}
    
    # Update Prometheus metrics
    SYSTEM_CPU_USAGE.set(psutil.cpu_percent())
    SYSTEM_MEMORY_USAGE.set(psutil.virtual_memory().used)
    
    process = psutil.Process()
    APP_MEMORY_USAGE.set(process.memory_info().rss)
    
    # Return appropriate status code
    if all_healthy:
        return {"status": "healthy", "services": results}
    else:
        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", "services": results}
        )

@router.get("/metrics", summary="Prometheus metrics endpoint")
async def metrics():
    """
    Prometheus metrics endpoint that exposes application metrics in Prometheus format.
    """
    # Update system metrics before returning
    SYSTEM_CPU_USAGE.set(psutil.cpu_percent())
    SYSTEM_MEMORY_USAGE.set(psutil.virtual_memory().used)
    
    process = psutil.Process()
    APP_MEMORY_USAGE.set(process.memory_info().rss)
    
    return Response(
        content=generate_latest(registry),
        media_type=CONTENT_TYPE_LATEST
    )

@router.get("/status", summary="Application status")
async def status():
    """
    Basic application status endpoint that returns version and uptime.
    """
    return {
        "status": "running",
        "version": os.getenv("APP_VERSION", "0.1.0"),
        "environment": os.getenv("ENV", "development"),
        "uptime": time.time() - health_check.startup_time,
    }
