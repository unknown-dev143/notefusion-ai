@echo off
echo === Environment Check ===

echo.
echo 1. Checking Python...
python --version
if %errorlevel% neq 0 (
    echo ❌ Python not found or not in PATH
    exit /b 1
)

echo.
echo 2. Checking Python packages...
python -c "import sys; print(f'Python {sys.version} on {sys.platform}')"
python -c "import gtts; print(f'gTTS {gtts.__version__} is installed')"
python -c "import speech_recognition as sr; print(f'SpeechRecognition {sr.__version__} is installed')"

echo.
echo 3. Testing TTS...
python -c "from gtts import gTTS; tts = gTTS('Test', lang='en'); tts.save('test_output/test.mp3')"
if exist test_output\test.mp3 (
    echo ✅ TTS test passed - check test_output/test.mp3
) else (
    echo ❌ TTS test failed
)

echo.
pause
