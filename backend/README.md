# NoteFusion AI Backend

This is the backend service for the NoteFusion AI application, built with FastAPI and SQLAlchemy.

## Prerequisites

- Python 3.9+
- Redis (for background tasks)
- SQLite (for development, can be changed to PostgreSQL for production)

## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/notefusion-ai.git
   cd notefusion-ai/backend
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   Create a `.env` file in the backend directory with the following variables:
   ```
   # App
   ENV=development
   SECRET_KEY=your-secret-key
   
   # Database
   DATABASE_URL=sqlite+aiosqlite:///./notefusion.db
   
   # Authentication
   JWT_SECRET_KEY=your-jwt-secret
   JWT_ALGORITHM=HS256
   JWT_ACCESS_TOKEN_EXPIRE_MINUTES=1440  # 24 hours
   
   # OpenAI
   OPENAI_API_KEY=your-openai-api-key
   
   # Redis (for Celery)
   REDIS_URL=redis://localhost:6379/0
   ```

5. **Initialize the database**
   ```bash
   python scripts/init_db.py
   ```

## Running the Application

### Development Server
```bash
python scripts/run_dev.py
```

The API will be available at `http://localhost:8000`

### Running Migrations
To apply new migrations:
```bash
alembic upgrade head
```

To create a new migration:
```bash
alembic revision --autogenerate -m "Your migration message"
```

### Running Tests
```bash
pytest
```

## Project Structure

```
backend/
├── alembic/                 # Database migrations
├── app/
│   ├── api/                 # API endpoints
│   ├── core/                # Core functionality
│   ├── models/              # Database models
│   ├── schemas/             # Pydantic models
│   ├── services/            # Business logic
│   ├── main.py              # FastAPI application
│   └── config.py            # Application configuration
├── scripts/                 # Utility scripts
├── tests/                   # Test files
├── .env                    # Environment variables
├── .gitignore
├── alembic.ini             # Alembic configuration
├── requirements.txt         # Python dependencies
└── README.md               # This file
```

## API Documentation

Once the server is running, you can access:

- **Interactive API docs**: http://localhost:8000/docs
- **Alternative API docs**: http://localhost:8000/redoc

## Deployment

For production deployment, consider using:

1. **Gunicorn** with Uvicorn workers
2. **PostgreSQL** instead of SQLite
3. **Redis** for Celery tasks
4. **NGINX** as a reverse proxy
5. **Docker** for containerization

Example Gunicorn command:
```bash
gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
