@echo off
echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && uvicorn app.main:app --reload"

timeout /t 10 /nobreak >nul

echo.
echo Testing OpenAI Endpoint...

curl -X POST ^
  http://localhost:8000/api/v1/ai/generate ^
  -H "Content-Type: application/json" ^
  -d "{\"prompt\":\"Write a haiku about AI\",\"max_tokens\":100,\"temperature\":0.7}"
