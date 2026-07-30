#!/usr/bin/env bash
# ============================================================
# NoteFusion AI — Automated VPS Setup Script
# Tested on: Ubuntu 22.04 LTS
#
# Usage:
#   1. SSH into your fresh VPS as root
#   2. curl -fsSL https://raw.githubusercontent.com/YOUR_USER/notefusion-ai/main/deploy/setup_vps.sh | bash
#   OR upload and run: bash setup_vps.sh
#
# What this does:
#   - Installs Docker, Docker Compose, Git, Nginx, Certbot
#   - Clones the repo
#   - Prompts you for your domain and env values
#   - Starts all containers
#   - Sets up SSL via Let's Encrypt
# ============================================================

set -euo pipefail

# ---- Colors ----
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# ---- Must be root ----
[[ $EUID -ne 0 ]] && error "Run this script as root: sudo bash setup_vps.sh"

# ---- Prompt for config ----
read -rp "Enter your domain name (e.g. notefusion.example.com): " DOMAIN
read -rp "Enter your GitHub repo URL (e.g. https://github.com/you/notefusion-ai): " REPO_URL
read -rp "Enter your email (for SSL cert / Let's Encrypt): " ADMIN_EMAIL

APP_DIR="/opt/notefusion"

# ============================================================
# 1. System update
# ============================================================
info "Updating system packages..."
apt-get update -y && apt-get upgrade -y
apt-get install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# ============================================================
# 2. Install Docker
# ============================================================
if ! command -v docker &>/dev/null; then
  info "Installing Docker..."
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] \
    https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
  systemctl enable --now docker
  info "Docker installed: $(docker --version)"
else
  info "Docker already installed: $(docker --version)"
fi

# ============================================================
# 3. Install Nginx
# ============================================================
if ! command -v nginx &>/dev/null; then
  info "Installing Nginx..."
  apt-get install -y nginx
  systemctl enable --now nginx
fi

# ============================================================
# 4. Install Certbot
# ============================================================
if ! command -v certbot &>/dev/null; then
  info "Installing Certbot..."
  apt-get install -y certbot python3-certbot-nginx
fi

# ============================================================
# 5. Configure firewall
# ============================================================
info "Configuring UFW firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# ============================================================
# 6. Clone repository
# ============================================================
info "Cloning repository into $APP_DIR..."
if [ -d "$APP_DIR" ]; then
  warn "$APP_DIR already exists. Pulling latest changes..."
  cd "$APP_DIR" && git pull
else
  git clone "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
fi

# ============================================================
# 7. Set up .env from template
# ============================================================
if [ ! -f "$APP_DIR/.env" ]; then
  info "Creating .env from template..."
  cp "$APP_DIR/.env.production.example" "$APP_DIR/.env"

  # Generate secure random secrets
  SECRET_KEY=$(openssl rand -hex 32)
  JWT_SECRET=$(openssl rand -hex 32)
  CSRF_SECRET=$(openssl rand -hex 32)
  DB_PASS=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 32)
  REDIS_PASS=$(openssl rand -base64 16 | tr -dc 'a-zA-Z0-9' | head -c 20)
  GRAFANA_PASS=$(openssl rand -base64 12 | tr -dc 'a-zA-Z0-9' | head -c 16)

  # Fill in auto-generated values
  sed -i "s|REPLACE_WITH_64_CHAR_RANDOM_STRING|$SECRET_KEY|1" "$APP_DIR/.env"
  sed -i "s|REPLACE_WITH_64_CHAR_RANDOM_STRING|$JWT_SECRET|1" "$APP_DIR/.env"
  sed -i "s|REPLACE_WITH_64_CHAR_RANDOM_STRING|$CSRF_SECRET|1" "$APP_DIR/.env"
  sed -i "s|REPLACE_WITH_STRONG_DB_PASSWORD|$DB_PASS|g" "$APP_DIR/.env"
  sed -i "s|REPLACE_WITH_STRONG_REDIS_PASSWORD|$REDIS_PASS|g" "$APP_DIR/.env"
  sed -i "s|REPLACE_WITH_GRAFANA_PASSWORD|$GRAFANA_PASS|g" "$APP_DIR/.env"
  sed -i "s|yourdomain.com|$DOMAIN|g" "$APP_DIR/.env"

  warn "==================================================================="
  warn " .env created with auto-generated secrets."
  warn " YOU MUST STILL FILL IN manually:"
  warn "   - OPENAI_API_KEY"
  warn "   - GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET"
  warn "   - STRIPE_PUBLIC_KEY / STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET"
  warn "   - SMTP_USER / SMTP_PASSWORD"
  warn "   - SENTRY_DSN"
  warn " Edit: nano $APP_DIR/.env"
  warn "==================================================================="
  read -rp "Press ENTER when you have filled in the remaining values..."
else
  warn ".env already exists — skipping creation."
fi

# ============================================================
# 8. Configure Nginx (HTTP only initially, for Certbot)
# ============================================================
info "Configuring Nginx for $DOMAIN..."
NGINX_CONF="/etc/nginx/sites-available/notefusion"
cat > "$NGINX_CONF" <<NGINX
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Proxy API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 300s;
        client_max_body_size 50M;
    }

    # Proxy WebSockets
    location /ws/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host \$host;
    }

    # Frontend
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINX

ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/notefusion
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# ============================================================
# 9. Obtain SSL Certificate
# ============================================================
info "Obtaining SSL certificate for $DOMAIN..."
mkdir -p /var/www/certbot
certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos -m "$ADMIN_EMAIL" || \
  warn "Certbot failed — ensure DNS A record is pointing to this server's IP. Re-run: certbot --nginx -d $DOMAIN"

# ============================================================
# 10. Start application with Docker Compose
# ============================================================
info "Building and starting application containers..."
cd "$APP_DIR"
docker compose -f docker-compose.prod.yml pull --quiet
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# ============================================================
# 11. Wait for health + show status
# ============================================================
info "Waiting 30 seconds for containers to initialize..."
sleep 30

info "Container status:"
docker compose -f docker-compose.prod.yml ps

info "Checking API health..."
curl -sf http://localhost:8000/health && echo "" && info "API is healthy!" || warn "API not responding yet. Check: docker logs notefusion-api"

# ============================================================
# 12. Set up auto-renewal for SSL cert
# ============================================================
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet && systemctl reload nginx") | crontab -

# ============================================================
# Done!
# ============================================================
echo ""
echo -e "${GREEN}============================================================${NC}"
echo -e "${GREEN} NoteFusion AI deployment complete!${NC}"
echo -e "${GREEN}============================================================${NC}"
echo ""
echo " App URL:      https://$DOMAIN"
echo " API Health:   https://$DOMAIN/api/v1/health"
echo " Grafana:      SSH tunnel to port 3001 on this server"
echo ""
echo " Useful commands:"
echo "   Logs:       docker compose -f $APP_DIR/docker-compose.prod.yml logs -f"
echo "   Restart:    docker compose -f $APP_DIR/docker-compose.prod.yml restart"
echo "   Update:     cd $APP_DIR && git pull && docker compose -f docker-compose.prod.yml up -d --build"
echo ""
