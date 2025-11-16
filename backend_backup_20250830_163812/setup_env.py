"""Setup environment variables for NoteFusion AI backend."""
import os
import secrets
from pathlib import Path

def generate_secret_key():
    """Generate a secure secret key."""
    return secrets.token_hex(32)

def setup_environment():
    """Setup the environment configuration."""
    env_path = Path('.env')
    
    # If .env doesn't exist, create it from .env.example
    if not env_path.exists():
        with open('.env.example', 'r') as example_file:
            env_content = example_file.read()
        
        # Replace placeholder values
        env_content = env_content.replace('your-secret-key-change-in-production', generate_secret_key())
        env_content = env_content.replace('your-jwt-secret-change-in-production', generate_secret_key())
        
        # Write the new .env file
        with open('.env', 'w') as env_file:
            env_file.write(env_content)
        
        print("✅ Created .env file with generated secrets")
    else:
        print("ℹ️  .env file already exists")
    
    # Create necessary directories
    for directory in ['app/uploads', 'app/videos', 'app/temp']:
        os.makedirs(directory, exist_ok=True)
    print("✅ Created required directories")

if __name__ == "__main__":
    print("=== Setting up NoteFusion AI Environment ===\n")
    setup_environment()
    print("\n✅ Environment setup complete!")
    print("\nPlease edit the .env file and add your OPENAI_API_KEY")
    input("\nPress Enter to exit...")
