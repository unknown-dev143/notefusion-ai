<<<<<<< HEAD
# Build stage
FROM python:3.9-slim as builder
=======
FROM python:3.9-slim
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
<<<<<<< HEAD
COPY requirements-prod.txt .
RUN pip install --user --no-cache-dir -r requirements-prod.txt

# Runtime stage
FROM python:3.9-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libsndfile1 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Copy Python dependencies from builder
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH
=======
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e

# Copy application code
COPY . .

<<<<<<< HEAD
# Create non-root user
RUN groupadd -r notefusion && useradd -r -g notefusion notefusion \
    && mkdir -p /app/uploads \
    && chown -R notefusion:notefusion /app

# Set environment variables
ENV PYTHONPATH=/app \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000 \
    ENV=production

# Switch to non-root user
USER notefusion

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/v1/health || exit 1

# Copy startup script
COPY startup.sh /app/startup.sh
RUN chmod +x /app/startup.sh

# Command to run the application
CMD ["/app/startup.sh"]
=======
# Set environment variables
ENV PYTHONPATH=/app
ENV PORT=8080

# Command to run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
