#!/bin/bash

# Server setup script for NoteFusion AI
# Run this as root on a fresh Ubuntu 22.04 server
#
# Features:
# - System updates and security hardening
# - Required package installation
# - Database setup (PostgreSQL + Redis)
# - Application environment setup
# - Nginx + Gunicorn configuration
# - SSL setup with Let's Encrypt
# - Systemd service configuration
# - Logging and monitoring setup

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Application settings
APP_USER="notefusion"
APP_GROUP="www-data"
APP_DIR="/var/www/notefusion"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"
LOG_DIR="/var/log/notefusion"
VENV_DIR="$BACKEND_DIR/venv"

# Database settings
DB_NAME="notefusion_prod"
DB_USER="notefusion"
DB_PASSWORD=$(openssl rand -base64 32)

# Domain settings - These will be set from environment variables
DOMAIN_NAME="${DOMAIN_NAME:-yourdomain.com}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@${DOMAIN_NAME}}"

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
    echo -e "${RED}[!] Error: $1${NC}" >&2
    exit 1
}

# Check if running as root
if [ "$(id -u)" -ne 0 ]; then
    error "This script must be run as root"
fi

# Check if running as root
if [ "$(id -u)" -ne 0 ]; then
    echo -e "${RED}Error: This script must be run as root${NC}" >&2
    exit 1
fi

# Update system and install base packages
update_system() {
    status "Updating system packages..."
    
    # Update package lists and upgrade all packages
    apt-get update
    DEBIAN_FRONTEND=noninteractive apt-get -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" upgrade
    
    # Install required system packages
    apt-get install -y \
        software-properties-common \
        apt-transport-https \
        ca-certificates \
        gnupg \
        lsb-release \
        ufw \
        fail2ban \
        unattended-upgrades \
        logrotate \
        htop \
        curl \
        wget \
        git \
        unzip \
        jq
        
    # Configure automatic security updates
    dpkg-reconfigure -plow unattended-upgrades
    
    # Configure timezone
    timedatectl set-timezone UTC
    
    # Configure hostname
    hostnamectl set-hostname ${DOMAIN_NAME}
    
    # Disable root login over SSH
    sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
    systemctl restart sshd
}

# Install required packages
install_packages() {
    status "Installing required packages..."
    
    # Add NodeSource repository for Node.js 18 LTS
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    
    # Add PostgreSQL repository
    sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
    wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
    
    # Update package lists
    apt-get update
    
    # Install Python and development tools
    apt-get install -y \
        python3.10 \
        python3.10-dev \
        python3.10-venv \
        python3-pip \
        python3-wheel \
        build-essential \
        libssl-dev \
        libffi-dev \
        libpq-dev \
        python3-dev
    
    # Install database and web server
    apt-get install -y \
        postgresql-14 \
        postgresql-contrib \
        postgresql-server-dev-14 \
        nginx \
        redis-server \
        supervisor \
        certbot \
        python3-certbot-nginx
    
    # Install Node.js and npm
    apt-get install -y nodejs
    
    # Install global npm packages
    npm install -g npm@latest
    npm install -g pm2
    
    # Install Docker (for potential containerization)
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    usermod -aG docker $APP_USER
    rm get-docker.sh
    
    # Install Docker Compose
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
}

# Configure firewall and security
setup_security() {
    status "Configuring firewall and security..."
    
    # Enable and configure UFW
    ufw --force reset
    ufw default deny incoming
    ufw default allow outgoing
    
    # Allow necessary ports
    ufw allow ssh
    ufw allow http
    ufw allow https
    
    # Rate limiting for SSH
    ufw limit ssh/tcp
    
    # Enable UFW
    echo "y" | ufw enable
    ufw status verbose
    
    # Configure fail2ban
    cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
    
    # Configure SSH settings
    sed -i 's/#Port 22/Port 2222/' /etc/ssh/sshd_config
    sed -i 's/#LoginGraceTime 2m/LoginGraceTime 1m/' /etc/ssh/sshd_config
    sed -i 's/#MaxAuthTries 6/MaxAuthTries 3/' /etc/ssh/sshd_config
    
    # Restart SSH service
    systemctl restart sshd
    
    # Configure automatic security updates
    apt-get install -y unattended-upgrades
    dpkg-reconfigure -plow unattended-upgrades
    
    # Set up log rotation
    cat > /etc/logrotate.d/notefusion << EOL
$LOG_DIR/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 $APP_USER $APP_GROUP
    sharedscripts
    postrotate
        [ -f /var/run/notefusion.pid ] && kill -USR1 $(cat /var/run/notefusion.pid)
    endscript
}
EOL
}

# Create application user and directories
setup_environment() {
    echo -e "${GREEN}[*] Setting up application environment...${NC}"
    
    # Create user if it doesn't exist
    if ! id "$APP_USER" &>/dev/null; then
        useradd -m -s /bin/bash "$APP_USER"
        usermod -aG www-data "$APP_USER"
    fi
    
    # Create application directories
    mkdir -p "$BACKEND_DIR"
    mkdir -p "$FRONTEND_DIR"
    chown -R "$APP_USER:www-data" "$APP_DIR"
    chmod -R 775 "$APP_DIR"
    
    # Create required directories
    mkdir -p "$BACKEND_DIR/logs"
    mkdir -p "$BACKEND_DIR/uploads"
    mkdir -p "$BACKEND_DIR/videos"
    mkdir -p "$BACKEND_DIR/temp"
    
    # Set permissions
    chown -R "$APP_USER:www-data" "$BACKEND_DIR/"{logs,uploads,videos,temp}
    chmod -R 775 "$BACKEND_DIR/"{logs,uploads,videos,temp}
}

# Configure PostgreSQL
setup_postgresql() {
    echo -e "${GREEN}[*] Configuring PostgreSQL...${NC}"
    
    # Create database and user
    sudo -u postgres psql -c "CREATE USER notefusion WITH PASSWORD 'your_secure_password';" || true
    sudo -u postgres psql -c "CREATE DATABASE notefusion_prod OWNER notefusion;" || true
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE notefusion_prod TO notefusion;"
    
    # Configure PostgreSQL for better performance
    PG_CONF="/etc/postgresql/14/main/postgresql.conf"
    sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" "$PG_CONF"
    
    # Update pg_hba.conf to allow connections from app server
    echo "host    notefusion_prod     notefusion       127.0.0.1/32            md5" | tee -a /etc/postgresql/14/main/pg_hba.conf
    
    # Restart PostgreSQL
    systemctl restart postgresql
}

# Configure Redis
setup_redis() {
    status "Configuring Redis..."
    
    # Configure Redis for better performance
    REDIS_CONF="/etc/redis/redis.conf"
    
    # Update Redis configuration
    sed -i 's/supervised no/supervised systemd/' $REDIS_CONF
    sed -i 's/# maxmemory <bytes>/maxmemory 1gb/' $REDIS_CONF
    sed -i 's/# maxmemory-policy noeviction/maxmemory-policy allkeys-lru/' $REDIS_CONF
    
    # Enable Redis persistence
    sed -i 's/save 900 1/save 900 1\nsave 300 10\nsave 60 10000/' $REDIS_CONF
    
    # Restart Redis
    systemctl restart redis-server
    
    # Test Redis connection
    if ! redis-cli ping; then
        error "Failed to start Redis"
    fi
    
    # Export Redis URL for the application
    echo "REDIS_URL=redis://localhost:6379/0" >> $BACKEND_DIR/.env
}

# Set up Python virtual environment
setup_python_env() {
    status "Setting up Python virtual environment..."
    
    # Create virtual environment
    sudo -u $APP_USER python3.10 -m venv $VENV_DIR
    
    # Activate virtual environment and install dependencies
    sudo -u $APP_USER $VENV_DIR/bin/pip install --upgrade pip
    sudo -u $APP_USER $VENV_DIR/bin/pip install -r $BACKEND_DIR/requirements.txt
    sudo -u $APP_USER $VENV_DIR/bin/pip install gunicorn uvicorn[standard] psycopg2-binary
    
    # Install additional Python packages if needed
    # sudo -u $APP_USER $VENV_DIR/bin/pip install package1 package2
}

# Set up Node.js and frontend dependencies
setup_nodejs() {
    status "Setting up Node.js and frontend dependencies..."
    
    # Install Node.js if not already installed
    if ! command -v node &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        apt-get install -y nodejs
    fi
    
    # Install Yarn
    curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
    apt-get update && apt-get install -y yarn
    
    # Install frontend dependencies
    cd $FRONTEND_DIR
    sudo -u $APP_USER npm install
    
    # Build frontend for production
    sudo -u $APP_USER npm run build
    
    # Set permissions
    chown -R $APP_USER:$APP_GROUP $FRONTEND_DIR
}

# Configure Nginx
setup_nginx() {
    status "Configuring Nginx..."
    
    # Create Nginx configuration
    cat > /etc/nginx/sites-available/notefusion << EOL
server {
    listen 80;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;
    
    # Redirect www to non-www
    if (\$host = www.\$server_name) {
        return 301 \$scheme://\$server_name\$request_uri;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: https:;" always;
    
    # Frontend
    location / {
        root $FRONTEND_DIR/build;
        try_files \$uri /index.html;
    }
    
    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
    }
    
    # Static files
    location /static/ {
        alias $BACKEND_DIR/static/;
        expires 30d;
        access_log off;
    }
    
    # Media files
    location /media/ {
        alias $BACKEND_DIR/uploads/;
        expires 30d;
        access_log off;
    }
    
    # Security settings
    client_max_body_size 20M;
    client_body_buffer_size 128k;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
EOL
    
    # Enable the site
    ln -sf /etc/nginx/sites-available/notefusion /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    # Test Nginx configuration
    nginx -t
    
    # Restart Nginx
    systemctl restart nginx
}

# Set up SSL with Let's Encrypt
setup_ssl() {
    status "Setting up SSL with Let's Encrypt..."
    
    # Stop Nginx temporarily
    systemctl stop nginx
    
    # Obtain SSL certificate
    certbot certonly --standalone \
        --non-interactive \
        --agree-tos \
        --email $ADMIN_EMAIL \
        --domains $DOMAIN_NAME,www.$DOMAIN_NAME \
        --preferred-challenges http \
        --redirect \
        --hsts \
        --staple-ocsp
    
    # Configure Nginx to use SSL
    sed -i 's/listen 80;/listen 443 ssl http2;/' /etc/nginx/sites-available/notefusion
    sed -i 's/# SSL configuration/    ssl_certificate \/etc\/letsencrypt\/live\/'$DOMAIN_NAME'\/fullchain.pem;\n    ssl_certificate_key \/etc\/letsencrypt\/live\/'$DOMAIN_NAME'\/privkey.pem;\n    ssl_trusted_certificate \/etc\/letsencrypt\/live\/'$DOMAIN_NAME'\/chain.pem;\n    ssl_session_timeout 1d;\n    ssl_session_cache shared:SSL:50m;\n    ssl_session_tickets off;\n    ssl_protocols TLSv1.2 TLSv1.3;\n    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;\n    ssl_prefer_server_ciphers off;\n    ssl_stapling on;\n    ssl_stapling_verify on;\n    resolver 8.8.8.8 8.8.4.4 valid=300s;\n    resolver_timeout 5s;\n    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;/' /etc/nginx/sites-available/notefusion
    
    # Redirect HTTP to HTTPS
    sed -i '1i\n# Redirect HTTP to HTTPS\nserver {\n    listen 80;\n    server_name '$DOMAIN_NAME' www.'$DOMAIN_NAME';\n    return 301 https://'$DOMAIN_NAME'\$request_uri;\n}\n' /etc/nginx/sites-available/notefusion
    
    # Test Nginx configuration
    nginx -t
    
    # Restart Nginx
    systemctl restart nginx
    
    # Set up automatic certificate renewal
    (crontab -l 2>/dev/null; echo "0 0,12 * * * root python3 -c 'import random; import time; time.sleep(random.random() * 3600)' && certbot renew --quiet --deploy-hook 'systemctl reload nginx'") | crontab -
}

# Set up systemd service
setup_systemd() {
    status "Setting up systemd service..."
    
    # Create systemd service file
    cat > /etc/systemd/system/notefusion.service << EOL
[Unit]
Description=NoteFusion AI Application
After=network.target postgresql.service redis-server.service

[Service]
User=$APP_USER
Group=$APP_GROUP
WorkingDirectory=$BACKEND_DIR
Environment="PATH=$VENV_DIR/bin"
EnvironmentFile=$BACKEND_DIR/.env
ExecStart=$VENV_DIR/bin/gunicorn \
    --worker-class uvicorn.workers.UvicornWorker \
    --config $BACKEND_DIR/deploy/gunicorn_conf.py \
    app.main:app
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOL
    
    # Reload systemd and enable service
    systemctl daemon-reload
    systemctl enable notefusion.service
    systemctl start notefusion.service
    
    # Check service status
    systemctl status notefusion.service
}

# Set up logging and monitoring
setup_monitoring() {
    status "Setting up logging and monitoring..."
    
    # Create log directory
    mkdir -p $LOG_DIR
    chown -R $APP_USER:$APP_GROUP $LOG_DIR
    
    # Set up logrotate
    cat > /etc/logrotate.d/notefusion << EOL
$LOG_DIR/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 $APP_USER $APP_GROUP
    sharedscripts
    postrotate
        systemctl reload notefusion > /dev/null 2>&1 || true
    endscript
}
EOL
    
    # Install and configure monitoring tools
    apt-get install -y htop iotop iftop nmon sysstat
    
    # Enable and start sysstat for system monitoring
    sed -i 's/ENABLED="false"/ENABLED="true"/' /etc/default/sysstat
    systemctl enable sysstat
    systemctl start sysstat
}

# Main setup function
main() {
    # Initial setup
    update_system
    install_packages
    setup_security
    setup_environment
    
    # Database setup
    setup_postgresql
    setup_redis
    
    # Application setup
    setup_python_env
    setup_nodejs
    
    # Web server setup
    setup_nginx
    setup_ssl
    
    # Service setup
    setup_systemd
    setup_monitoring
    
    # Generate environment file
    cd $BACKEND_DIR/deploy
    python3 generate_env.py
    
    # Set proper permissions
    chown -R $APP_USER:$APP_GROUP $APP_DIR
    chmod -R 775 $APP_DIR/logs
    
    # Print completion message
    echo -e "\n${GREEN}[+] Server setup completed successfully!${NC}"
    echo -e "\n${YELLOW}IMPORTANT:${NC}"
    echo "1. Update the DOMAIN_NAME and ADMIN_EMAIL variables in this script"
    echo "2. Review all configuration files in /etc/"
    echo "3. Check the application logs: $LOG_DIR/"
    echo -e "\nApplication URL: https://$DOMAIN_NAME"
    echo -e "Admin email: $ADMIN_EMAIL"
    echo -e "Database name: $DB_NAME"
    echo -e "Database user: $DB_USER"
    echo -e "Database password: $DB_PASSWORD"
    echo -e "\n${YELLOW}Please change all default passwords and secure your installation!${NC}"
}

# Run the setup
main
