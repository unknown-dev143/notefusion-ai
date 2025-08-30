# NoteFusion AI Backend

This is the backend service for the NoteFusion AI application, built with FastAPI and SQLAlchemy.

## Prerequisites

- Python 3.9+
- Redis (for background tasks)
- SQLite (for development, can be changed to PostgreSQL for production)

## Setup

1. **Clone the repository**
<<<<<<< HEAD

=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
   ```bash
   git clone https://github.com/yourusername/notefusion-ai.git
   cd notefusion-ai/backend
   ```

2. **Create a virtual environment**
<<<<<<< HEAD

=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
<<<<<<< HEAD

=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
<<<<<<< HEAD

   Create a `.env` file in the backend directory with the following variables:

   ```env
=======
   Create a `.env` file in the backend directory with the following variables:
   ```
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
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
<<<<<<< HEAD

=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
   ```bash
   python scripts/init_db.py
   ```

## Running the Application

### Development Server
<<<<<<< HEAD

=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
```bash
python scripts/run_dev.py
```

<<<<<<< HEAD
The API will be available at [http://localhost:8000](http://localhost:8000)

### Running Migrations

To apply new migrations:

=======
The API will be available at `http://localhost:8000`

### Running Migrations
To apply new migrations:
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
```bash
alembic upgrade head
```

To create a new migration:
<<<<<<< HEAD

=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
```bash
alembic revision --autogenerate -m "Your migration message"
```

### Running Tests
<<<<<<< HEAD

=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
```bash
pytest
```

## Project Structure

<<<<<<< HEAD
```text
=======
```
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
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

<<<<<<< HEAD
- **Interactive API docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Alternative API docs**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
=======
- **Interactive API docs**: http://localhost:8000/docs
- **Alternative API docs**: http://localhost:8000/redoc
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e

## Deployment

For production deployment, consider using:

1. **Gunicorn** with Uvicorn workers
2. **PostgreSQL** instead of SQLite
3. **Redis** for Celery tasks
4. **NGINX** as a reverse proxy
5. **Docker** for containerization

Example Gunicorn command:
<<<<<<< HEAD

=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
```bash
gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
