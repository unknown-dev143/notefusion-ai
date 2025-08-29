#!/bin/bash
set -euo pipefail

# Configuration
readonly DEPLOY_DIR="/var/www/notefusion-ai/production"
readonly LOCK_FILE="/tmp/notefusion_deploy.lock"
readonly BACKUP_DIR="/var/backups/notefusion-ai"
readonly TIMESTAMP=$(date +%Y%m%d%H%M%S)
readonly SSH_OPTS="-o StrictHostKeyChecking=no -o ConnectTimeout=10 -o BatchMode=yes"

# Logging function
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Function to run a command with timeout
run_with_timeout() {
  local timeout=$1
  shift
  
  "$@" &
  local pid=$!
  
  (sleep $timeout && kill -9 $pid 2>/dev/null) &
  local sleep_pid=$!
  
  if wait $pid 2>/dev/null; then
    kill $sleep_pid 2>/dev/null
    return 0
  else
    return 1
  fi
}

# Function to send notifications
notify() {
  local message=$1
  local status=${2:-INFO}
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo "[${timestamp}] [${status}] ${message}"

  # Send to Slack if webhook is available
  if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
    local payload
    payload=$(cat <<EOF
{
  "text": "*[${status}]* ${message}",
  "username": "Deployment Bot",
  "icon_emoji": ":rocket:",
  "attachments": [
    {
      "color": "${status,,} == 'error' ? '#ff0000' : '#36a64f'",
      "fields": [
        {
          "title": "Environment",
          "value": "${DEPLOY_ENV}",
          "short": true
        },
        {
          "title": "Status",
          "value": "${status}",
          "short": true
        },
        {
          "title": "Timestamp",
          "value": "${timestamp}",
          "short": false
        }
      ]
    }
  ]
}
EOF
    )
    
    curl -s -X POST -H 'Content-type: application/json' --data "$payload" "$SLACK_WEBHOOK_URL" >/dev/null || true
  fi
}

# Cleanup function to remove lock file
cleanup() {
  local exit_code=$?
  
  # Always try to remove the lock file, even if the deployment fails
  if ssh $SSH_OPTS $PROD_CANARY_USER@$PROD_CANARY_SERVER "[ -f \"$LOCK_FILE\" ] && rm -f \"$LOCK_FILE\""; then
    log "Lock file removed"
  else
    log "Warning: Failed to remove lock file" "WARNING"
  fi
  
  return $exit_code
}

# Main deployment function
deploy() {
  local start_time=$(date +%s)
  log "Starting deployment to $PROD_CANARY_SERVER"
  
  # Check if required commands are available
  for cmd in ssh rsync; do
    if ! command_exists "$cmd"; then
      log "Required command not found: $cmd" "ERROR"
      return 1
    fi
  done
  
  # Create backup
  log "Creating backup of current deployment..."
  ssh $SSH_OPTS $PROD_CANARY_USER@$PROD_CANARY_SERVER "
    mkdir -p $BACKUP_DIR
    tar -czf $BACKUP_DIR/backup_$TIMESTAMP.tar.gz -C $(dirname $DEPLOY_DIR) $(basename $DEPLOY_DIR) 2>/dev/null || true
  "
  
  # Deploy new version
  log "Deploying new version..."
  rsync -avz --delete \
    --exclude='.env' \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='__pycache__' \
    ./artifact/ $PROD_CANARY_USER@$PROD_CANARY_SERVER:$DEPLOY_DIR/
  
  # Run post-deployment commands
  log "Running post-deployment tasks..."
  ssh $SSH_OPTS $PROD_CANARY_USER@$PROD_CANARY_SERVER "
    cd $DEPLOY_DIR
    # Example: docker-compose up -d --build
  "
  
  local end_time=$(date +%s)
  local duration=$((end_time - start_time))
  log "Deployment completed successfully in ${duration} seconds" "SUCCESS"
  return 0
}

# Main execution
if [ -z "$PROD_CANARY_USER" ] || [ -z "$PROD_CANARY_SERVER" ]; then
  log "Missing required environment variables: PROD_CANARY_USER or PROD_CANARY_SERVER" "ERROR"
  exit 1
fi

# Check for existing deployment
if ssh $SSH_OPTS $PROD_CANARY_USER@$PROD_CANARY_SERVER "[ -f \"$LOCK_FILE\" ]"; then
  log "Deployment is already in progress (lock file exists)" "ERROR"
  exit 1
fi

# Create lock file
if ! ssh $SSH_OPTS $PROD_CANARY_USER@$PROD_CANARY_SERVER "touch \"$LOCK_FILE\""; then
  log "Failed to create lock file" "ERROR"
  exit 1
fi

# Set up trap to ensure cleanup runs on exit
trap cleanup EXIT

# Run deployment
deploy
