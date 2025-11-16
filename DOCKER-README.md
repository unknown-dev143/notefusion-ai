# NoteFusion AI - Docker Setup

This guide will help you set up and run the NoteFusion AI application using Docker Compose.

## Prerequisites

- Docker Engine 20.10.0+
- Docker Compose 2.0.0+
- Git

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/notefusion-ai.git
   cd notefusion-ai
   ```

2. **Set up environment variables**
   ```bash
   cp docker.env .env
   # Edit .env file with your configuration
   ```

3. **Start the application**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs
   - PGAdmin: http://localhost:5050
   - Redis Commander: http://localhost:8081
   - MailHog: http://localhost:8025

## Development Workflow

### Start development environment
```bash
docker-compose up -d
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

### Run database migrations
```bash
docker-compose exec backend alembic upgrade head
```

### Run tests
```bash
docker-compose exec backend pytest
```

### Stop the application
```bash
docker-compose down
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | React development server |
| Backend | 8000 | FastAPI application |
| PostgreSQL | 5432 | Database |
| Redis | 6379 | Caching and message broker |
| PGAdmin | 5050 | PostgreSQL web interface |
| Redis Commander | 8081 | Redis web interface |
| MailHog | 8025 | Email testing interface |

## Environment Variables

Create a `.env` file based on `docker.env` and update the following variables:

- `POSTGRES_USER`: PostgreSQL username
- `POSTGRES_PASSWORD`: PostgreSQL password
- `POSTGRES_DB`: PostgreSQL database name
- `REDIS_PASSWORD`: Redis password
- `SECRET_KEY`: Application secret key
- `JWT_SECRET_KEY`: JWT signing key
- `SMTP_*`: Email server configuration

## Production Deployment

For production, you should:

1. Set `ENVIRONMENT=production` in `.env`
2. Configure proper SSL certificates
3. Set up proper database backups
4. Configure monitoring and logging
5. Use a reverse proxy like Traefik or Nginx

## Troubleshooting

### Port conflicts
If you encounter port conflicts, update the ports in `docker-compose.yml` and `.env` files.

### Database issues
If the database doesn't initialize properly:
```bash
docker-compose down -v  # Warning: This will delete all data
docker-compose up -d
```

### Rebuild containers
To rebuild containers with code changes:
```bash
docker-compose up -d --build
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
