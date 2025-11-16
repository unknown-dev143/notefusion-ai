@echo off
echo Creating .env files with secure values...

:: Create backend .env file
echo # Application > backend\.env
echo ENV=development >> backend\.env
echo DEBUG=true >> backend\.env
echo SECRET_KEY=8x!A%%D*G-KaPdSgVkYp3s6v9y$B?E(H+MbQeThWmZq4t7w!z%%C*F)J@NcRfUjXn2 >> backend\.env
echo SECURITY_PASSWORD_SALT=9y$B&E)H@McQfTjWnZr4u7x!A%%D*G-KaP >> backend\.env
echo. >> backend\.env
echo # Database >> backend\.env
echo DATABASE_URL=sqlite+aiosqlite:///./notefusion.db >> backend\.env
echo TEST_DATABASE_URL=sqlite+aiosqlite:///./test_notefusion.db >> backend\.env
echo DB_POOL_SIZE=5 >> backend\.env
echo DB_MAX_OVERFLOW=10 >> backend\.env
echo DB_POOL_TIMEOUT=30 >> backend\.env
echo DB_POOL_RECYCLE=3600 >> backend\.env
echo DB_ECHO=false >> backend\.env
echo. >> backend\.env
echo # JWT >> backend\.env
echo JWT_SECRET_KEY=KbPeShVmYq3t6w9z$C&F)J@NcRfUjXn2r4u7x!A%%D*G-KaPdSgVkYp3s6v9 >> backend\.env
echo JWT_ALGORITHM=HS256 >> backend\.env
echo JWT_ACCESS_TOKEN_EXPIRE_MINUTES=1440 >> backend\.env
echo JWT_REFRESH_TOKEN_EXPIRE_DAYS=30 >> backend\.env
echo. >> backend\.env
echo # Rate Limiting >> backend\.env
echo RATE_LIMIT=100/minute >> backend\.env
echo. >> backend\.env
echo # Redis >> backend\.env
echo REDIS_URL=redis://localhost:6379/0 >> backend\.env
echo REDIS_CACHE_TTL=300 >> backend\.env
echo. >> backend\.env
echo # CORS >> backend\.env
echo CORS_ORIGINS=http://localhost:3000,http://localhost:8000,http://localhost:8080 >> backend\.env
echo. >> backend\.env
echo # API Settings >> backend\.env
echo API_V1_STR=/api/v1 >> backend\.env
echo PROJECT_NAME=NoteFusion AI >> backend\.env
echo. >> backend\.env
echo # File Upload >> backend\.env
echo UPLOAD_FOLDER=./app/uploads >> backend\.env
echo MAX_CONTENT_LENGTH=16777216 >> backend\.env

:: Create frontend .env file
echo NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1 > frontend\.env.local
echo NEXT_PUBLIC_ENV=development >> frontend\.env.local
echo NEXT_PUBLIC_APP_NAME=NoteFusion AI >> frontend\.env.local
echo # Add your Google Analytics ID if needed >> frontend\.env.local
echo # NEXT_PUBLIC_GOOGLE_ANALYTICS_ID= >> frontend\.env.local

echo.
echo Successfully created:
echo - backend\.env
echo - frontend\.env.local
echo.
echo Note: You'll need to manually add your OPENAI_API_KEY to the backend .env file when needed.
pause
