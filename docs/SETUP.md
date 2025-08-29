# Notefusion AI - Setup Guide

## Prerequisites

- Node.js 16+ and npm 8+
- Python 3.9+
- PostgreSQL (for production)
- Redis (for background tasks)

## Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory with the following variables:

   ```env
   VITE_API_URL=http://localhost:8000
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

## Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables in `.env`:

   ```env
   DATABASE_URL=sqlite:///./notefusion.db
   SECRET_KEY=your-secret-key
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   ```

5. Initialize the database:

   ```bash
   python init_db.py
   ```

6. Start the development server:

   ```bash
   uvicorn app.main:app --reload
   ```

## Running Tests

### Frontend Tests

```bash
cd frontend
npm test
```

### Backend Tests

```bash
cd backend
pytest
```

## Production Deployment

### Frontend

1. Build the production bundle:

   ```bash
   cd frontend
   npm run build
   ```

2. Deploy the `dist` directory to your hosting service.

### Backend

1. Update the `.env` file with production settings.

2. Use a production ASGI server like Gunicorn with Uvicorn workers:

   ```bash
   gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app
   ```

## Common Issues

- **Database Connection Issues**: Ensure the database URL in `.env` is correct.
- **Missing Dependencies**: Run `npm install` or `pip install -r requirements.txt`.
- **Port Conflicts**: Check if ports 3000 (frontend) and 8000 (backend) are available.
