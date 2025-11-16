"""Generate production environment file."""
import os
import secrets
from pathlib import Path

def generate_secret_key():
    """Generate a secure secret key."""
    return secrets.token_urlsafe(32)

def generate_env_file(output_path=None):
    """Generate a production environment file."""
    if output_path is None:
        # Default to backend/.env
        output_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
    
    """Generate a production environment file."""
    # Generate secure random values
    secret_key = generate_secret_key()
    jwt_secret = generate_secret_key()
    postgres_password = generate_secret_key()
    redis_password = generate_secret_key()
    
    env_vars = {
        # Application
        'ENV': 'production',
        'DEBUG': 'False',
        'SECRET_KEY': secret_key,
        'API_V1_STR': '/api/v1',
        'PROJECT_NAME': 'NoteFusion AI',
        'DOMAIN': 'yourdomain.com',
        'ALLOWED_HOSTS': 'localhost,127.0.0.1',
        'CORS_ORIGINS': 'https://yourdomain.com,http://localhost:3000',
        
        # Database
        'POSTGRES_SERVER': 'localhost',
        'POSTGRES_USER': 'notefusion',
        'POSTGRES_PASSWORD': postgres_password,
        'POSTGRES_DB': 'notefusion_prod',
        'DATABASE_URL': f'postgresql+asyncpg://notefusion:{postgres_password}@localhost:5432/notefusion_prod',
        
        # JWT
        'JWT_SECRET_KEY': jwt_secret,
        'JWT_ALGORITHM': 'HS256',
        'JWT_ACCESS_TOKEN_EXPIRE_MINUTES': '1440',  # 24 hours
        'JWT_REFRESH_TOKEN_EXPIRE_DAYS': '30',
        'JWT_VERIFICATION_TOKEN_EXPIRE_HOURS': '24',
        'JWT_PASSWORD_RESET_TOKEN_EXPIRE_MINUTES': '60',
        
        # Email
        'EMAILS_ENABLED': 'False',
        'SMTP_TLS': 'True',
        'SMTP_PORT': '587',
        'SMTP_HOST': 'smtp.example.com',
        'SMTP_USER': 'your-email@example.com',
        'SMTP_PASSWORD': 'your-email-password',
        'CONTACT_EMAIL': 'contact@example.com',
        'EMAILS_FROM_EMAIL': 'noreply@example.com',
        'EMAILS_FROM_NAME': 'NoteFusion AI',
        
        # Redis
        'REDIS_HOST': 'localhost',
        'REDIS_PORT': '6379',
        'REDIS_PASSWORD': redis_password,
        'REDIS_URL': f'redis://:{redis_password}@localhost:6379/0',
        
        # File Storage
        'UPLOAD_FOLDER': '/var/www/notefusion/uploads',
        'MAX_CONTENT_LENGTH': '16777216',  # 16MB
        'VIDEO_OUTPUT_DIR': '/var/www/notefusion/videos',
        'MAX_VIDEO_DURATION': '600',  # 10 minutes
        'DEFAULT_VIDEO_WIDTH': '1280',
        'DEFAULT_VIDEO_HEIGHT': '720',
        'DEFAULT_FPS': '30',
        'TEMP_DIR': '/tmp/notefusion',
        
        # External Services
        'OPENAI_API_KEY': 'your-openai-api-key',
        
        # Security
        'SECURE_PROXY_SSL_HEADER': 'True',
        'SESSION_COOKIE_SECURE': 'True',
        'CSRF_COOKIE_SECURE': 'True',
        'SECURE_HSTS_SECONDS': '31536000',  # 1 year
        'SECURE_HSTS_INCLUDE_SUBDOMAINS': 'True',
        'SECURE_HSTS_PRELOAD': 'True',
        'SECURE_REFERRER_POLICY': 'same-origin',
        'SECURE_BROWSER_XSS_FILTER': 'True',
        'X_FRAME_OPTIONS': 'DENY',
        
        # Performance
        'WORKERS_PER_CORE': '2',
        'MAX_WORKERS': '8',
        'WEB_CONCURRENCY': '4',
        'LOG_LEVEL': 'info',
    }
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Write to file
    with open(output_path, 'w') as f:
        for key, value in env_vars.items():
            f.write(f"{key}={value}\n")
    
    print(f"Generated environment file at {output_path}")
    print("Please review and update the values before deployment!")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Generate environment configuration file')
    parser.add_argument('--output', '-o', help='Output file path (default: backend/.env)')
    args = parser.parse_args()
    
    try:
        output_path = args.output
        env_file = generate_env_file(output_path)
        print(f"Environment file generated at: {env_file}")
        print("Please review and update the configuration as needed.")
    except Exception as e:
        print(f"Error generating environment file: {e}")
        exit(1)
