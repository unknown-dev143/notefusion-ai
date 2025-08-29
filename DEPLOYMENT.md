# NoteFusion AI - Deployment Guide

## Prerequisites

1. Docker and Docker Compose installed
2. At least 4GB of free RAM
3. At least 2 CPU cores

## Deployment Steps

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
