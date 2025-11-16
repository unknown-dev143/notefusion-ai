"""
Script to update security configuration with secure defaults.
"""
import os
import sys
import secrets
import string
from pathlib import Path
from typing import Dict, Any, Optional

# Path to security config file
SECURITY_CONFIG_PATH = Path("backend/app/core/security_config.py")

def generate_secure_string(length: int = 32) -> str:
    """Generate a cryptographically secure random string."""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*()_+-=[]{}|;:,.<>?"
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def update_security_config() -> Dict[str, Any]:
    """Update security configuration with secure defaults."""
    if not SECURITY_CONFIG_PATH.exists():
        print(f"❌ Error: Security config file not found at {SECURITY_CONFIG_PATH}")
        return {"success": False, "message": "Security config file not found"}
    
    # Read the current config
    with open(SECURITY_CONFIG_PATH, 'r') as f:
        lines = f.readlines()
    
    # Define security settings to update
    security_updates = {
        # JWT Settings
        "JWT_SECRET_KEY": generate_secure_string(64),
        "JWT_ALGORITHM": "HS256",
        "ACCESS_TOKEN_EXPIRE_MINUTES": 30,
        "REFRESH_TOKEN_EXPIRE_DAYS": 7,
        
        # Password Settings
        "PASSWORD_MIN_LENGTH": 12,
        "PASSWORD_REQUIRE_UPPERCASE": True,
        "PASSWORD_REQUIRE_LOWERCASE": True,
        "PASSWORD_REQUIRE_NUMBERS": True,
        "PASSWORD_REQUIRE_SPECIAL_CHARS": True,
        
        # Rate Limiting
        "RATE_LIMIT": "1000/day, 100/hour, 20/minute",
        "RATE_LIMIT_BY_IP": True,
        "RATE_LIMIT_TRUST_PROXY": False,
        
        # API Key Settings
        "API_KEY_HEADER": "X-API-Key",
        "API_KEY_PREFIX": "nf_",
        "API_KEY_LENGTH": 48,
        "API_KEY_SECRET": generate_secure_string(64),
        "API_KEY_EXPIRE_DAYS": 90,
        "API_KEY_RATE_LIMIT_DEFAULT": 100,
        "API_KEY_RATE_LIMIT_WINDOW": 60,
    }
    
    # Update the config file
    updated = False
    for i, line in enumerate(lines):
        for key, value in security_updates.items():
            if line.strip().startswith(f"{key}:"):
                if isinstance(value, str):
                    new_line = f'    {key}: str = Field("{value}", env="{key}")\n'
                elif isinstance(value, bool):
                    new_line = f'    {key}: bool = Field({str(value).lower()}, env="{key}")\n'
                elif isinstance(value, int):
                    new_line = f'    {key}: int = Field({value}, env="{key}")\n'
                else:
                    continue
                
                if line != new_line:
                    lines[i] = new_line
                    updated = True
                break
    
    # Write the updated config back to file
    if updated:
        with open(SECURITY_CONFIG_PATH, 'w') as f:
            f.writelines(lines)
        
        print("✅ Security configuration updated successfully!")
        print("💡 Please restart your application for changes to take effect.")
        return {"success": True, "message": "Security configuration updated"}
    
    print("ℹ️  No security configuration updates were needed.")
    return {"success": True, "message": "No updates needed"}

def main():
    """Main function to update security configuration."""
    print("🔒 Updating security configuration...\n")
    
    # Confirm before making changes
    confirm = input("This will update security settings. Continue? (y/N): ").lower()
    if confirm != 'y':
        print("\n⚠️  Operation cancelled.")
        return 0
    
    result = update_security_config()
    
    if not result.get('success'):
        print(f"\n❌ {result.get('message')}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
