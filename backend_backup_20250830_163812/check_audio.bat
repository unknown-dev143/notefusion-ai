@echo off
echo Checking Python environment...
python --version
echo.
echo Installing required packages...
pip install gtts SpeechRecognition pydub pyaudio

echo.
echo Running environment check...
python -c "import sys; print(f'Python Path: {sys.path}')"

echo.
echo Running audio service test...
python -c "from app.services.audio.service import audio_service; print('Audio service imported successfully')"

echo.
echo Test completed. Press any key to exit.
pause >nul
