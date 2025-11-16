# NoteFusion AI - Deployment Guide

## Deployment Options

### Option 1: Railway.app (Recommended for Production)

#### Prerequisites
1. GitHub account
2. Railway.app account (free tier available)
3. Railway CLI (optional)

#### Deployment Steps

1. **Fork the Repository**
   - Fork the repository to your GitHub account

2. **Deploy to Railway**
   - Go to [Railway.app](https://railway.app/)
   - Click "New Project" and select "Deploy from GitHub repo"
   - Select your forked repository
   - Railway will automatically detect the project type and start building

3. **Configure Environment Variables**
   - Go to the "Variables" tab in your Railway project
   - Add all variables from `railway.template.env`
   - Set `ENVIRONMENT=production`
   - Add your database credentials and other secrets

4. **Set Up Database**
   - In the Railway dashboard, go to the "Database" tab
   - Click "Create PostgreSQL"
   - The `DATABASE_URL` will be automatically added to your environment variables

5. **Configure Domains**
   - Go to the "Settings" tab
   - Under "Custom Domains", add your domain or use the provided railway.app domain
   - SSL will be automatically configured

6. **Deploy**
   - Push any changes to your GitHub repository to trigger a new deployment
   - Monitor the deployment in the Railway dashboard

### Option 2: Local Development with Docker

#### Prerequisites
1. Docker and Docker Compose installed
2. At least 4GB of free RAM
3. At least 2 CPU cores

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/notefusion-ai.git
cd notefusion-ai
```

### 2. Set Up Environment Variables

Create a `.env` file in the project root with the following content:

```env
# Database
POSTGRES_USER=notefusion
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=notefusion

# Backend
SECRET_KEY=your_secret_key_here
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

### 3. Start the Services

Run the deployment script:

#### On Windows (PowerShell):
```powershell
.\deploy.ps1
```

#### On Linux/macOS:
```bash
chmod +x deploy.sh
./deploy.sh
```

### 4. Verify the Deployment

After the deployment script completes, you can access:

- **API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Backend Health Check**: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

### 5. Configure Frontend

Update your frontend configuration to point to the backend API:

```env
REACT_APP_API_URL=http://localhost:8000/api/v1
```

## Updating the Deployment

To update to the latest version:

```bash
git pull
docker-compose down
docker-compose up -d --build
docker-compose exec backend alembic upgrade head
```

## Troubleshooting

### Common Issues

1. **Port Conflicts**: 
   - Check if ports 8000, 5432, or 6379 are already in use
   - Update the ports in `docker-compose.yml` if needed

2. **Database Issues**:
   - Run database migrations manually:
     ```bash
     docker-compose exec backend alembic upgrade head
     ```

3. **Container Logs**:
   ```bash
   docker-compose logs -f
   ```

## Production Considerations

1. **SSL/TLS**

   - Set up Nginx as a reverse proxy with Let's Encrypt
   - Update `CORS_ORIGINS` to only allow your frontend domain

2. **Backups**

   - Regularly backup the database volume
   - Example command:

     ```bash
     docker exec -t your_postgres_container pg_dump -U notefusion > backup.sql
     ```

3. **Monitoring**

   - Set up monitoring for the containers
   - Consider using Prometheus and Grafana

## Support

For additional support, please open an issue on GitHub or contact the development team.
