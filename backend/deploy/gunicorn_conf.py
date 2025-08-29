"""
Gunicorn configuration for NoteFusion AI production environment.

This configuration is optimized for:
- Security: Secure headers, request limits, and timeouts
- Performance: Worker management, connection handling
- Reliability: Graceful shutdowns, worker timeouts
- Monitoring: Detailed logging and metrics
"""
import multiprocessing
import os
import sys
import json
import logging
from pathlib import Path
from datetime import datetime

# Add project to path
project_root = str(Path(__file__).parent.parent)
if project_root not in sys.path:
    sys.path.append(project_root)

# Environment
ENV = os.getenv("ENV", "production")
IS_PRODUCTION = ENV == "production"

# Logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "info").upper()
LOG_FORMAT = "%(asctime)s [%(process)d] [%(levelname)s] %(message)s"
LOG_DATE_FORMAT = "[%Y-%m-%d %H:%M:%S %z]"

# Ensure log directory exists
LOG_DIR = "/var/log/notefusion"
os.makedirs(LOG_DIR, exist_ok=True)

# Configure logging
logging.basicConfig(
    level=LOG_LEVEL,
    format=LOG_FORMAT,
    datefmt=LOG_DATE_FORMAT,
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(f"{LOG_DIR}/gunicorn.log"),
    ],
)
logger = logging.getLogger("gunicorn.error")

# Server Socket
bind = "0.0.0.0:8000"
backlog = 2048  # Maximum number of pending connections

# Worker Processes
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "uvicorn.workers.UvicornWorker"
worker_connections = 1000
max_requests = 1000
max_requests_jitter = 50  # Randomize max_requests to prevent all workers restarting at once

# Timeouts
timeout = 30  # Workers silent for more than this many seconds are killed and restarted
graceful_timeout = 30  # Timeout for graceful workers restart
keepalive = 2  # Seconds to wait for requests on a Keep-Alive connection

# Security
# Prevent client from messing with headers
limit_request_line = 4094  # Max size of HTTP request line
limit_request_fields = 100  # Limit number of HTTP headers
limit_request_field_size = 8190  # Limit size of each request header

# Security Headers
def post_fork(server, worker):
    """Set security headers after worker fork."""
    from gunicorn.http import RESPONSE_CODES
    
    # Override send_headers to add security headers to all responses
    original_send_headers = worker.http_parser.send_headers
    
    def send_headers(status, headers, *args, **kwargs):
        security_headers = [
            ("X-Content-Type-Options", "nosniff"),
            ("X-Frame-Options", "DENY"),
            ("X-XSS-Protection", "1; mode=block"),
            ("Referrer-Policy", "strict-origin-when-cross-origin"),
            ("Content-Security-Policy", "default-src 'self'"),
            ("Permissions-Policy", "geolocation=(), microphone=(), camera=()"),
        ]
        
        # Add security headers
        for name, value in security_headers:
            headers.append((name, value))
            
        return original_send_headers(status, headers, *args, **kwargs)
    
    worker.http_parser.send_headers = send_headers

# Debugging & Development
debug = False
reload = False  # Don't use auto-reload in production
reload_engine = "auto"
reload_extra_files = []  # List of extra files to watch for reload

# Server Mechanics
preload_app = True  # Load application code before forking workers
reuse_port = True  # Allow binding to an already-bound port

# Worker Class Configuration
# Uvicorn worker specific settings
worker_tmp_dir = "/dev/shm"  # Use shared memory for worker temp files

# Server Hooks
def on_starting(server):
    """Run when the server starts."""
    server.log.info(f"Starting NoteFusion AI server in {ENV} environment")

def on_reload(server):
    """Run when the server reloads."""
    server.log.info("Server reloading...")

def when_ready(server):
    """Run when the server is ready to accept connections."""
    server.log.info("Server is ready to handle connections")

# Error Handling
def worker_abort(worker):
    """Run when a worker receives the SIGABRT signal."""
    worker.log.warning("Worker received SIGABRT signal")

def worker_exit(server, worker):
    """Run when a worker is about to exit."""
    worker.log.info("Worker exiting (pid: %s)", worker.pid)

# Monitoring
def child_exit(server, worker):
    """Called when a worker exits."""
    server.log.warning("Worker %s (pid: %s) exited with status %s",
                      worker.name, worker.pid, worker.exitcode)

# StatsD Integration (if configured)
if os.getenv("STATSD_HOST"):
    statsd_host = os.getenv("STATSD_HOST")
    statsd_port = int(os.getenv("STATSD_PORT", 8125))
    statsd_prefix = os.getenv("STATSD_PREFIX", "notefusion.gunicorn")
    
    # Enable statsd
    statsd_host = f"{statsd_host}:{statsd_port}"

def post_fork(server, worker):
    server.log.info("Worker spawned (pid: %s)", worker.pid)

def worker_int(worker):
    worker.log.info("Worker received INT or QUIT signal")
    # Get traceback info
    import threading, sys, traceback
    id2name = {th.ident: th.name for th in threading.enumerate()}
    code = []
    for threadId, stack in sys._current_frames().items():
        code.append("\n# Thread: %s(%d)" % (id2name.get(threadId, ""), threadId))
        for filename, lineno, name, line in traceback.extract_stack(stack):
            code.append('File: "%s", line %d, in %s' % (filename, lineno, name))
            if line:
                code.append("  %s" % (line.strip()))
    worker.log.debug("\n".join(code))

def worker_abort(worker):
    worker.log.info("Worker received SIGABRT signal")
