from setuptools import setup, find_packages

setup(
    name="notefusion-ai",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        # Core dependencies
        "fastapi>=0.68.0",
        "uvicorn>=0.15.0",
        "python-multipart>=0.0.5",
        "python-jose[cryptography]>=3.3.0",
        "passlib[bcrypt]>=1.7.4",
        "python-dotenv>=0.19.0",
        "sqlalchemy>=1.4.0",
        "sqlalchemy[asyncio]>=1.4.0",
        "alembic>=1.7.0",
        "pydantic>=1.8.0",
        "pydantic-settings>=2.0.0",
        "openai>=1.0.0",
        "python-multipart>=0.0.5",
        "httpx>=0.23.0",
        "python-jose[cryptography]>=3.3.0",
        "passlib[bcrypt]>=1.7.4",
        "python-multipart>=0.0.5",
    ],
    extras_require={
        "dev": [
            "pytest>=6.0.0",
            "pytest-asyncio>=0.15.0",
            "httpx>=0.23.0",
            "black>=21.0",
            "isort>=5.0.0",
            "mypy>=0.910",
            "pylint>=2.11.0",
        ],
    },
    python_requires=">=3.8",
)
