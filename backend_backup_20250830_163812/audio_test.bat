@echo off
echo Running Audio Test...
python -c "from gtts import gTTS; tts = gTTS('Test successful', lang='en'); tts.save('test_output/test.mp3')"
echo If you see no errors, TTS is working!
pause
