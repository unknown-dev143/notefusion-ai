"""
Script to rotate API keys and update environment variables.
"""
import os
import secrets
import string
import json
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import hashlib

def generate_secure_string(length: int = 64) -> str:
    """Generate a cryptographically secure random string."""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*()_+-=[]{}|;:,.<>?"
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def generate_api_key(prefix: str = "nf_", length: int = 48) -> str:
    """Generate a new API key with the given prefix and length."""
    random_part = generate_secure_string(length - len(prefix))
    return f"{prefix}{random_part}"

def hash_api_key(api_key: str) -> str:
    """Generate a secure hash of the API key for storage."""
    salt = generate_secure_string(16).encode('utf-8')
    key_hash = hashlib.pbkdf2_hmac(
        'sha256',
        api_key.encode('utf-8'),
        salt,
        100000
    )
    return f"pbkdf2_sha256$100000${salt.hex()}${key_hash.hex()}"

def rotate_api_keys(env_path: Path) -> Dict[str, str]:
    """Rotate API keys and update environment variables."""
    # Generate new keys
    new_keys = {
        'SECRET_KEY': generate_secure_string(64),
        'JWT_SECRET_KEY': generate_secure_string(64),
        'SECURITY_PASSWORD_SALT': generate_secure_string(32),
        'API_KEY_SECRET': generate_secure_string(64),
        'FERNET_KEY': generate_secure_string(44),  # 32 bytes, base64-encoded
        'DATABASE_URL': os.getenv('DATABASE_URL', 'sqlite+aiosqlite:///./notefusion.db'),
        'REDIS_URL': os.getenv('REDIS_URL', 'redis://localhost:6379/0'),
        'OPENAI_API_KEY': os.getenv('OPENAI_API_KEY', ''),
        'ENVIRONMENT': os.getenv('ENVIRONMENT', 'development'),
    }
    
    # Generate API keys for different services
    services = ['ADMIN', 'USER', 'SERVICE', 'INTEGRATION']
    for service in services:
        key_name = f"{service}_API_KEY"
        new_key = generate_api_key(f"nf_{service.lower()}_")
        new_keys[key_name] = new_key
        new_keys[f"{key_name}_HASH"] = hash_api_key(new_key)
    
    # Read existing .env file if it exists
    if env_path.exists():
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key = line.split('=')[0].strip()
                    if key not in new_keys and key not in [f"{s}_API_KEY_HASH" for s in services]:
                        new_keys[key] = line.split('=', 1)[1].strip()
    
    # Write new .env file
    with open(env_path, 'w') as f:
        f.write("# NoteFusion AI - Environment Variables\n")
        f.write(f"# Generated on: {datetime.utcnow().isoformat()}\n")
        f.write("# WARNING: This file contains sensitive information. Do not commit to version control!\n\n")
        
        # Write security-related variables first
        f.write("# Security\n")
        for key in ['SECRET_KEY', 'JWT_SECRET_KEY', 'SECURITY_PASSWORD_SALT', 'FERNET_KEY', 'API_KEY_SECRET']:
            if key in new_keys:
                f.write(f"{key}={new_keys[key]}\n")
        
        # Write API keys
        f.write("\n# API Keys\n")
        for key in sorted(new_keys.keys()):
            if key.endswith('_API_KEY'):
                f.write(f"{key}={new_keys[key]}\n")
        
        # Write other variables
        f.write("\n# Application Settings\n")
        for key, value in sorted(new_keys.items()):
            if key not in ['SECRET_KEY', 'JWT_SECRET_KEY', 'SECURITY_PASSWORD_SALT', 'FERNET_KEY', 'API_KEY_SECRET'] and not key.endswith('_API_KEY'):
                f.write(f"{key}={value}\n")
    
    return {k: v for k, v in new_keys.items() if k.endswith('_API_KEY')}

def main():
    """Main function to rotate API keys."""
    env_path = Path(__file__).parent.parent / '.env'
    
    print("🔑 Rotating API keys...\n")
    
    # Confirm before rotating keys
    confirm = input("This will generate new API keys and update the .env file. Continue? (y/N): ").lower()
    if confirm != 'y':
        print("\n⚠️  Operation cancelled.")
        return
    
    try:
        new_keys = rotate_api_keys(env_path)
        
        print("\n✅ API keys rotated successfully!")
        print("\n🔑 New API Keys (save these in a secure location):")
        for service, key in new_keys.items():
            print(f"{service}: {key}")
        
        print("\n💡 Next steps:")
        print("1. Update any services that use these API keys")
        print("2. Restart your application for changes to take effect")
        print("3. Securely store these keys (they won't be shown again)")
        
    except Exception as e:
        print(f"\n❌ Error rotating API keys: {str(e)}")
        return 1
    
    return 0

if __name__ == "__main__":
    import sys
    sys.exit(main() or 0)
