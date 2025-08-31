print("Testing audio services...")
try:
    # Test TTS
    from gtts import gTTS
    tts = gTTS('Test successful', lang='en')
    tts.save('test_output/test_audio.mp3')
    print("✅ TTS test passed!")
    
    # Test STT
    import speech_recognition as sr
    r = sr.Recognizer()
    print("✅ SpeechRecognition imported successfully!")
    
except Exception as e:
    print(f"❌ Error: {str(e)}")
    
print("\nTest complete. Check test_output folder for generated audio.")
