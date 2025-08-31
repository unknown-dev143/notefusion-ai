import secrets
import string

def generate_secret_key(length=50):
    chars = string.ascii_letters + string.digits + "!@#$%^&*(-_=+)"
    return ''.join(secrets.choice(chars) for _ in range(length))

# Generate secure values
secure_values = {
    'JWT_SECRET_KEY': generate_secret_key(64),
    'SECRET_KEY': generate_secret_key(64),
    'API_KEY_SECRET': generate_secret_key(64),
    'DATABASE_URL': 'sqlite:///./sql_app.db',
    'TEST_DATABASE_URL': 'sqlite:///./test_sql_app.db'
}

# Generate .env content
env_content = """# Database
DATABASE_URL={DATABASE_URL}
TEST_DATABASE_URL={TEST_DATABASE_URL}

# JWT Settings
JWT_SECRET_KEY={JWT_SECRET_KEY}
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440  # 24 hours
REFRESH_TOKEN_EXPIRE_DAYS=30

# Security
SECRET_KEY={SECRET_KEY}
API_KEY_SECRET={API_KEY_SECRET}
ALLOWED_HOSTS=localhost,127.0.0.1

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:8000

# Environment
ENVIRONMENT=development
DEBUG=True

# API Keys
# OPENAI_API_KEY=your_openai_api_key_here  # Uncomment and add your OpenAI API key when needed
""".format(**secure_values)

print(env_content)
