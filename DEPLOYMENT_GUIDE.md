# NoteFusion AI - Deployment Guide

## Option 1: Docker Deployment (Recommended for Local Development)

### Prerequisites
- Docker Desktop installed and running
- Git

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/unknown-dev143/notefusion-ai.git
   cd notefusion-ai
   ```

2. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update with your configuration

3. Start the application:
   ```bash
   docker-compose up --build -d
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - pgAdmin: http://localhost:5050 (email: admin@notefusion.ai, password: admin123)

---

## Option 2: Cloud Deployment (Vercel + Railway)

### Frontend (Vercel)
1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Configure build settings:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
4. Add environment variables from your `.env` file
5. Deploy

### Backend (Railway)
1. Go to [Railway](https://railway.app)
2. New Project → Deploy from GitHub
3. Select your repository
4. Add a PostgreSQL database
5. Set environment variables from your `.env` file
6. Deploy

### Required Environment Variables
```
# Frontend (Vercel)
VITE_API_URL=your_backend_url
VITE_FIREBASE_*=(your Firebase config)

# Backend (Railway)
DATABASE_URL=postgresql://...
SECRET_KEY=your_secret_key
JWT_SECRET_KEY=your_jwt_secret
# ... other variables from .env
```

---

## Option 3: Manual Deployment

### Frontend
```bash
cd frontend
npm install
npm run build
# Serve the build directory using your preferred web server
```

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

---

## Post-Deployment
1. Set up initial admin user
2. Configure backups
3. Set up monitoring and logging
4. Configure custom domain (if needed)
5. Set up SSL certificates

## Troubleshooting
- Check logs: `docker-compose logs -f`
- Rebuild containers: `docker-compose up --build -d`
- Reset database: `docker-compose down -v` (warning: deletes data)
