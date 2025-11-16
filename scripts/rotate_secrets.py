"""Script to rotate and secure all API keys and secrets."""
import os
import secrets
import string
from pathlib import Path
from cryptography.fernet import Fernet

def generate_secure_string(length=64):
    """Generate a cryptographically secure random string."""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*()_+-=[]{}|;:,.<>?"
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def generate_fernet_key():
    """Generate a Fernet key for encrypting sensitive data."""
    return Fernet.generate_key().decode()

def rotate_secrets():
    """Rotate all secrets and update .env file."""
    env_path = Path(__file__).parent.parent / '.env'
    
    # Generate new secrets
    secrets = {
        'SECRET_KEY': generate_secure_string(64),
        'JWT_SECRET_KEY': generate_secure_string(64),
        'SECURITY_PASSWORD_SALT': generate_secure_string(32),
        'FERNET_KEY': generate_fernet_key(),
        'DATABASE_URL': 'sqlite+aiosqlite:///./notefusion.db',
        'ALGORITHM': 'HS256',
        'ACCESS_TOKEN_EXPIRE_MINUTES': '1440',
        'REFRESH_TOKEN_EXPIRE_DAYS': '30',
        'SMTP_TLS': 'True',
        'SMTP_PORT': '587',
        'EMAILS_FROM_NAME': '\"NoteFusion AI\"',
        'FRONTEND_URL': 'http://localhost:3000',
        'API_V1_STR': '/api/v1',
    }
    
    # Read existing .env file if it exists
    if env_path.exists():
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key = line.split('=')[0].strip()
                    if key not in secrets and key not in ['DATABASE_URL', 'ALGORITHM', 
                                                         'ACCESS_TOKEN_EXPIRE_MINUTES', 
                                                         'REFRESH_TOKEN_EXPIRE_DAYS',
                                                         'SMTP_TLS', 'SMTP_PORT',
                                                         'EMAILS_FROM_NAME',
                                                         'FRONTEND_URL', 'API_V1_STR']:
                        secrets[key] = ''  # Keep the key but clear the value
    
    # Write new .env file
    with open(env_path, 'w') as f:
        f.write("# Security and Configuration Settings\n")
        f.write("# WARNING: This file contains sensitive information. Do not commit to version control!\n\n")
        
        # Write security-related variables first
        f.write("# Security\n")
        for key in ['SECRET_KEY', 'JWT_SECRET_KEY', 'SECURITY_PASSWORD_SALT', 'FERNET_KEY']:
            f.write(f"{key}={secrets[key]}\n")
        
        # Write other variables
        f.write("\n# Application\n")
        for key, value in secrets.items():
            if key not in ['SECRET_KEY', 'JWT_SECRET_KEY', 'SECURITY_PASSWORD_SALT', 'FERNET_KEY']:
                f.write(f"{key}={value}\n")
    
    print(f"✅ Secrets rotated and saved to {env_path}")
    print("\n🔑 Please update the following in your deployment environment:")
    print("1. Update your deployment environment variables")
    print("2. Update any CI/CD pipeline secrets")
    print("3. Update any third-party services with new API keys")
    print("4. Restart your application services")

if __name__ == "__main__":
    rotate_secrets()
