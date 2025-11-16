@echo off
echo Setting up Python environment and installing dependencies...

:: Check if Python is installed
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Python is not installed or not in PATH.
    echo Please install Python 3.7 or higher and add it to your PATH.
    pause
    exit /b 1
)

echo Installing required packages...
pip install gTTS SpeechRecognition pydub pyaudio

if %ERRORLEVEL% NEQ 0 (
    echo Failed to install required packages.
    pause
    exit /b 1
)

echo.
echo Running audio service tests...
python test_audio_services.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Tests failed. Check the output above for errors.
    pause
    exit /b 1
)

echo.
echo Setup and tests completed successfully!
pause
