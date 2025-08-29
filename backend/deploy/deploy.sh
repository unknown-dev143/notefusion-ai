#!/bin/bash

# Deployment script for NoteFusion AI backend
# Usage: ./deploy.sh [environment]

set -e  # Exit on error

# Default environment
ENV=${1:-production}
APP_NAME="notefusion-backend"
APP_USER="notefusion"
APP_DIR="/var/www/notefusion/backend"
VENV_DIR="$APP_DIR/venv"
GUNICORN_CONF="$APP_DIR/deploy/gunicorn_conf.py"
SERVICE_FILE="/etc/systemd/system/notefusion.service"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print status messages
status() {
    echo -e "${GREEN}[*]${NC} $1"
}

error() {
    echo -e "${RED}[!] Error: $1${NC}" >&2
    exit 1
}

warning() {
    echo -e "${YELLOW}[!] $1${NC}"
}

# Check if running as root
if [ "$(id -u)" -ne 0 ]; then
    error "This script must be run as root"
fi

# Install required system packages
install_dependencies() {
    status "Installing system dependencies..."
    apt-get update
    apt-get install -y \
        python3.10 \
        python3.10-venv \
        python3-pip \
        nginx \
        postgresql \
        postgresql-contrib \
        redis-server \
        supervisor \
        certbot \
        python3-certbot-nginx
}

# Create application user and directories
setup_environment() {
    status "Setting up environment..."
    
    # Create user if it doesn't exist
    if ! id "$APP_USER" &>/dev/null; then
        useradd -m -s /bin/bash "$APP_USER"
        usermod -aG www-data "$APP_USER"
    fi
    
    # Create application directories
    mkdir -p "$APP_DIR"
    chown -R "$APP_USER:www-data" "$APP_DIR"
    chmod -R 775 "$APP_DIR"
    
    # Create upload directories
    mkdir -p "$APP_DIR/uploads"
    mkdir -p "$APP_DIR/videos"
    mkdir -p "$APP_DIR/temp"
    chown -R "$APP_USER:www-data" "$APP_DIR/"{uploads,videos,temp}
    chmod -R 775 "$APP_DIR/"{uploads,videos,temp}
}

# Setup Python virtual environment
setup_python_env() {
    status "Setting up Python virtual environment..."
    
    # Create and activate virtual environment
    sudo -u "$APP_USER" python3.10 -m venv "$VENV_DIR"
    source "$VENV_DIR/bin/activate"
    
    # Install Python dependencies
    pip install --upgrade pip
    pip install -r "$APP_DIR/requirements.txt"
    pip install gunicorn uvicorn[standard] psycopg2-binary
    
    deactivate
}

# Configure PostgreSQL
database_setup() {
    status "Setting up PostgreSQL database..."
    
    # Create database and user
    sudo -u postgres psql -c "CREATE USER notefusion WITH PASSWORD 'your_secure_password';" || true
    sudo -u postgres psql -c "CREATE DATABASE notefusion_prod OWNER notefusion;" || true
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE notefusion_prod TO notefusion;"
    
    # Run migrations
    cd "$APP_DIR"
    sudo -u "$APP_USER" "$VENV_DIR/bin/python" -m alembic upgrade head
}

# Configure Gunicorn service
setup_gunicorn_service() {
    status "Configuring Gunicorn service..."
    
    cat > "$SERVICE_FILE" << EOF
[Unit]
Description=NoteFusion AI Backend
After=network.target

[Service]
User=$APP_USER
Group=www-data
WorkingDirectory=$APP_DIR
Environment="PATH=$VENV_DIR/bin"
ExecStart=$VENV_DIR/bin/gunicorn -c $GUNICORN_CONF app.main:app
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable notefusion.service
    systemctl start notefusion.service
}

# Configure Nginx
setup_nginx() {
    status "Configuring Nginx..."
    
    NGINX_CONF="/etc/nginx/sites-available/notefusion"
    
    cat > "$NGINX_CONF" << EOF
server {
    listen 80;
    server_name your_domain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /static/ {
        alias $APP_DIR/static/;
        expires 30d;
    }

    location /uploads/ {
        alias $APP_DIR/uploads/;
        expires 30d;
    }

    client_max_body_size 20M;
}
EOF

    ln -sf "$NGINX_CONF" "/etc/nginx/sites-enabled/"
    nginx -t
    systemctl restart nginx
}

# Setup SSL with Let's Encrypt
setup_ssl() {
    status "Setting up SSL with Let's Encrypt..."
    certbot --nginx -d your_domain.com --non-interactive --agree-tos --email your-email@example.com
    systemctl restart nginx
}

# Main deployment function
deploy() {
    status "Starting deployment of NoteFusion AI backend..."
    
    # Install dependencies
    install_dependencies
    
    # Setup environment
    setup_environment
    
    # Setup Python environment
    setup_python_env
    
    # Setup database
    database_setup
    
    # Setup Gunicorn service
    setup_gunicorn_service
    
    # Setup Nginx
    setup_nginx
    
    # Setup SSL (uncomment after DNS is configured)
    # setup_ssl
    
    status "Deployment completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Update the Nginx configuration with your domain name"
    echo "2. Configure SSL by uncommenting the setup_ssl line in this script"
    echo "3. Update the .env file with your production settings"
    echo "4. Restart the services: systemctl restart notefusion nginx"
}

# Run the deployment
deploy
