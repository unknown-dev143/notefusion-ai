# NoteFusion AI - Complete Deployment Guide

## Prerequisites

1. Node.js (v16+)
2. npm or yarn
3. Git
4. Railway CLI (`npm install -g @railway/cli`)
5. Vercel CLI (`npm install -g vercel`)

## Backend Deployment (Railway)

1. **Prepare the backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Deploy to Railway**
   ```bash
   # Run the deployment script
   .\deploy-railway.ps1
   ```
   - This will:
     - Install Railway CLI if needed
     - Log you into Railway
     - Create a new project
     - Set up PostgreSQL database
     - Configure environment variables
     - Deploy the backend

3. **Note the backend URL** shown at the end of the deployment

## Frontend Deployment (Vercel)

1. **Prepare the frontend**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment variables**
   Create `.env.production` in the frontend directory with:
   ```
   VITE_API_URL=your-railway-backend-url
   VITE_USE_MOCKS=false
   ```

3. **Deploy to Vercel**
   ```bash
   # Build the frontend
   npm run build

   # Deploy to Vercel
   vercel --prod
   ```
   - Follow the prompts to complete the deployment

## Post-Deployment

1. **Set up custom domains** (optional)
   - In Railway: Add custom domain in project settings
   - In Vercel: Add custom domain in project settings

2. **Configure SSL**
   - Both Railway and Vercel provide automatic SSL certificates

3. **Set up monitoring**
   - Railway provides built-in monitoring
   - Vercel provides analytics and performance monitoring

## Environment Variables

### Backend (Railway)
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: Secret key for JWT tokens
- `REDIS_URL`: Redis connection URL
- `OPENAI_API_KEY`: Your OpenAI API key

### Frontend (Vercel)
- `VITE_API_URL`: Your Railway backend URL
- `VITE_GA_MEASUREMENT_ID`: Google Analytics ID (optional)

## Troubleshooting

1. **Database connection issues**
   - Verify `DATABASE_URL` is correctly set
   - Check Railway logs for connection errors

2. **CORS issues**
   - Ensure `VITE_API_URL` is correctly set in the frontend
   - Check backend CORS settings in `app/core/config.py`

3. **Build failures**
   - Check the build logs in Railway/Vercel
   - Ensure all dependencies are properly installed

## Support

For additional help, please open an issue in the repository.
