"""
Script to validate and update environment configuration with secure defaults.
"""
import os
import sys
import secrets
import string
from pathlib import Path
from dotenv import load_dotenv, set_key
from typing import Dict, Any, Optional

# Required environment variables and their validation rules
REQUIRED_ENV_VARS = {
    "SECRET_KEY": {
        "min_length": 32,
        "generate": True,
        "description": "Secret key for cryptographic signing"
    },
    "JWT_SECRET_KEY": {
        "min_length": 32,
        "generate": True,
        "description": "Secret key for JWT token signing"
    },
    "SECURITY_PASSWORD_SALT": {
        "min_length": 16,
        "generate": True,
        "description": "Salt for password hashing"
    },
    "FERNET_KEY": {
        "min_length": 44,  # 32 bytes, base64-encoded
        "generate": True,
        "description": "Key for Fernet symmetric encryption"
    },
    "DATABASE_URL": {
        "required": True,
        "description": "Database connection URL"
    },
    "REDIS_URL": {
        "required": False,
        "description": "Redis connection URL for caching and rate limiting"
    },
    "OPENAI_API_KEY": {
        "required": True,
        "description": "OpenAI API key for AI features"
    },
    "ENVIRONMENT": {
        "default": "development",
        "allowed": ["development", "staging", "production"],
        "description": "Application environment"
    },
    "CORS_ORIGINS": {
        "default": "http://localhost:3000,http://localhost:8000",
        "description": "Comma-separated list of allowed CORS origins"
    },
    "RATE_LIMIT_ENABLED": {
        "default": "true",
        "type": bool,
        "description": "Enable rate limiting"
    },
    "RATE_LIMIT_REQUESTS": {
        "default": "100",
        "type": int,
        "description": "Maximum number of requests per time window"
    },
    "RATE_LIMIT_PERIOD": {
        "default": "60",
        "type": int,
        "description": "Time window for rate limiting in seconds"
    }
}

def generate_secure_string(length: int = 32) -> str:
    """Generate a cryptographically secure random string."""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*()_+-=[]{}|;:,.<>?"
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def generate_fernet_key() -> str:
    """Generate a Fernet key for encryption."""
    from cryptography.fernet import Fernet
    return Fernet.generate_key().decode()

def validate_environment() -> Dict[str, Any]:
    """Validate and update environment variables."""
    env_path = Path(__file__).parent.parent / '.env'
    load_dotenv(env_path)
    
    updates = {}
    warnings = []
    
    for var_name, config in REQUIRED_ENV_VARS.items():
        current_value = os.getenv(var_name)
        
        # Generate value if needed
        if config.get('generate') and not current_value:
            if var_name == 'FERNET_KEY':
                new_value = generate_fernet_key()
            else:
                new_value = generate_secure_string(config.get('min_length', 32))
            updates[var_name] = new_value
            continue
            
        # Check required fields
        if config.get('required', False) and not current_value:
            warnings.append(f"⚠️  {var_name}: {config.get('description', 'Required but not set')}")
            continue
            
        # Check minimum length
        if 'min_length' in config and current_value and len(current_value) < config['min_length']:
            warnings.append(
                f"⚠️  {var_name}: Should be at least {config['min_length']} characters long"
            )
            
        # Check allowed values
        if 'allowed' in config and current_value not in config['allowed']:
            warnings.append(
                f"⚠️  {var_name}: Must be one of {', '.join(config['allowed'])}"
            )
            
        # Type conversion
        if 'type' in config and current_value:
            try:
                if config['type'] == bool:
                    updates[var_name] = current_value.lower() in ('true', '1', 't')
                else:
                    updates[var_name] = config['type'](current_value)
            except (ValueError, TypeError):
                warnings.append(f"⚠️  {var_name}: Invalid format for type {config['type'].__name__}")
    
    return {
        'updates': updates,
        'warnings': warnings,
        'env_path': env_path
    }

def update_environment(updates: Dict[str, Any], env_path: Path) -> None:
    """Update the .env file with new values."""
    # Read existing content
    lines = []
    existing_vars = set()
    
    if env_path.exists():
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    var_name = line.split('=')[0].strip()
                    existing_vars.add(var_name)
                lines.append(line)
    
    # Add or update variables
    for var_name, value in updates.items():
        if var_name in existing_vars:
            # Update existing variable
            lines = [
                f"{var_name}={value}" if line.startswith(f"{var_name}=") else line
                for line in lines
            ]
        else:
            # Add new variable
            lines.append(f"{var_name}={value}")
    
    # Write back to file
    with open(env_path, 'w') as f:
        f.write("\n".join(lines) + "\n")

def main():
    """Main function to validate and update environment."""
    print("🔍 Validating environment configuration...\n")
    
    result = validate_environment()
    
    # Show warnings
    if result['warnings']:
        print("\n".join(result['warnings']))
    
    # Show updates
    if result['updates']:
        print("\n🔄 The following environment variables will be updated:")
        for var_name, value in result['updates'].items():
            print(f"  {var_name}: {'*' * 8} (new value set)")
        
        # Confirm before updating
        confirm = input("\nDo you want to update the .env file? (y/N): ").lower()
        if confirm == 'y':
            update_environment(result['updates'], result['env_path'])
            print("\n✅ Environment configuration updated successfully!")
            print("💡 Please restart your application for changes to take effect.")
        else:
            print("\n⚠️  Environment configuration was not updated.")
    elif not result['warnings']:
        print("\n✅ Environment configuration is valid and secure!")
    
    if result['warnings']:
        print("\n⚠️  Please address the warnings above to ensure proper configuration.")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
