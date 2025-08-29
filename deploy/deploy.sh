#!/bin/bash

# Deployment script for NoteFusion AI
# This script will deploy the application to a production server

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Default values
DOMAIN_NAME="${1:-yourdomain.com}"
ADMIN_EMAIL="${2:-admin@${DOMAIN_NAME}}"
SSH_USER="root"
SSH_HOST="${DOMAIN_NAME}"
LOCAL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REMOTE_DIR="/var/www/notefusion"

# Check if required commands are available
for cmd in rsync ssh scp; do
    if ! command -v $cmd &> /dev/null; then
        echo -e "${RED}Error: $cmd is required but not installed.${NC}"
        exit 1
    fi
done

# Function to print status messages
status() {
    echo -e "${GREEN}[*]${NC} $1"
}

# Function to print warnings
warning() {
    echo -e "${YELLOW}[!] $1${NC}"
}

# Function to print errors and exit
error() {
    echo -e "${RED}[ERROR] $1${NC}" >&2
    exit 1
}

# Check if running with required arguments
if [ $# -lt 1 ]; then
    echo "Usage: $0 <domain> [admin-email]"
    echo "Example: $0 example.com admin@example.com"
    exit 1
fi

# Confirm deployment
read -p "This will deploy to ${SSH_HOST}. Continue? [y/N] " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Step 1: Copy deployment files to server
status "Copying deployment files to server..."
rsync -avz --exclude='.git' --exclude='node_modules' --exclude='venv' \
    -e ssh "${LOCAL_DIR}/" "${SSH_USER}@${SSH_HOST}:${REMOTE_DIR}/"

# Step 2: Run server setup script
status "Running server setup..."
ssh -t "${SSH_USER}@${SSH_HOST}" "
    cd ${REMOTE_DIR} && \
    chmod +x deploy/setup_server.sh && \
    export DOMAIN_NAME=${DOMAIN_NAME} && \
    export ADMIN_EMAIL=${ADMIN_EMAIL} && \
    sudo -E ./deploy/setup_server.sh
"

# Step 3: Restart services
status "Restarting services..."
ssh -t "${SSH_USER}@${SSH_HOST}" "
    sudo systemctl daemon-reload && \
    sudo systemctl restart notefusion && \
    sudo systemctl restart nginx && \
    sudo systemctl restart postgresql && \
    sudo systemctl restart redis-server
"

# Step 4: Run database migrations
status "Running database migrations..."
ssh -t "${SSH_USER}@${SSH_HOST}" "
    cd ${REMOTE_DIR}/backend && \
    source venv/bin/activate && \
    python -m alembic upgrade head
"

# Step 5: Build frontend
status "Building frontend..."
ssh -t "${SSH_USER}@${SSH_HOST}" "
    cd ${REMOTE_DIR}/frontend && \
    npm install && \
    npm run build
"

# Step 6: Set proper permissions
status "Setting file permissions..."
ssh -t "${SSH_USER}@${SSH_HOST}" "
    sudo chown -R ${APP_USER}:${APP_GROUP} ${REMOTE_DIR} && \
    sudo chmod -R 755 ${REMOTE_DIR} && \
    sudo chmod -R 777 ${REMOTE_DIR}/backend/static
"

# Step 7: Verify services
status "Verifying services..."
ssh -t "${SSH_USER}@${SSH_HOST}" "
    echo '\n=== Service Status ===' && \
    sudo systemctl status notefusion --no-pager && \
    echo '\n=== Nginx Status ===' && \
    sudo systemctl status nginx --no-pager && \
    echo '\n=== PostgreSQL Status ===' && \
    sudo systemctl status postgresql --no-pager && \
    echo '\n=== Redis Status ===' && \
    sudo systemctl status redis-server --no-pager
"

# Step 8: Display deployment info
status "Deployment complete!"
echo -e "\n${GREEN}Application deployed successfully!${NC}"
echo -e "\nAccess your application at: https://${DOMAIN_NAME}"
echo -e "Admin email: ${ADMIN_EMAIL}"
echo -e "\nNext steps:"
echo "1. Access the admin panel at: https://${DOMAIN_NAME}/admin"
echo "2. Change the default admin password"
echo "3. Configure your SMTP settings in the admin panel"
echo "4. Set up monitoring and alerts"

exit 0
