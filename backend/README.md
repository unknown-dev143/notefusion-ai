# NoteFusion AI - Backend

This is the backend service for NoteFusion AI, a modern note-taking application with AI-powered features.

## Features

- RESTful API with FastAPI
- JWT Authentication
- File uploads with support for various file types
- Database migrations with Alembic
- Rate limiting and security headers
- Health check endpoints
- CORS support
- Structured logging
- Docker support

## Prerequisites

- Python 3.10+
- PostgreSQL 13+
- Redis (for rate limiting and caching)
- Docker and Docker Compose (optional)

## Local Development

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/notefusion-ai.git
   cd notefusion-ai/backend
   ```

2. Create and activate a virtual environment:
   ```bash
   # On Windows
   python -m venv venv
   .\venv\Scripts\activate
   
   # On macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   pip install -r requirements-dev.txt
   ```

4. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your configuration.

5. Run database migrations:
   ```bash
   alembic upgrade head
   ```

### Running the Application

#### Development Mode
```bash
./start.sh development
```

#### Production Mode
```bash
./start.sh production
```

The API will be available at `http://localhost:8000`

## API Documentation

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- OpenAPI Schema: `http://localhost:8000/openapi.json`

## Docker

### Build and Run with Docker Compose

```bash
docker-compose up --build
```

### Run Tests

```bash
# Run all tests
pytest

# Run tests with coverage
pytest --cov=app --cov-report=term-missing
```

## Deployment

### Railway

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Deploy:
   ```bash
   railway up
   ```

### Manual Deployment

1. Set up a production server with Python 3.10+
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set up a PostgreSQL database and update the `DATABASE_URL` in your `.env` file
4. Run migrations:
   ```bash
   alembic upgrade head
   ```
5. Start the application:
   ```bash
   gunicorn -k uvicorn.workers.UvicornWorker -w 4 -t 120 --log-level info --bind 0.0.0.0:8000 app.main:app
   ```

## Environment Variables

See `.env.example` for all available environment variables.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
