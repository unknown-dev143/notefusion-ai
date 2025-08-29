# Stop any running servers
Get-Process -Name "python" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "uvicorn" -ErrorAction SilentlyContinue | Stop-Process -Force

# Remove existing virtual environments
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue .venv
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue venv

# Create new virtual environment
python -m venv .venv

# Activate the environment
. \.venv\Scripts\Activate.ps1

# Upgrade pip
python -m pip install --upgrade pip

# Install core dependencies
pip install fastapi==0.95.0 uvicorn==0.22.0 pydantic==1.10.8 python-multipart==0.0.6

# Install database and authentication
pip install sqlalchemy==2.0.20 python-jose[cryptography]==3.3.0 passlib[bcrypt]==1.7.4

# Install the project in development mode
cd backend
pip install -e .

# Start the server
Write-Host "`n✅ Environment setup complete! Starting server..." -ForegroundColor Green
uvicorn app.main:app --reload
