"""
Complete audio test script covering TTS and STT functionality.
"""
import os
import sys
import wave
import time
import subprocess
from pathlib import Path
from gtts import gTTS
import speech_recognition as sr
import pyaudio

# Create output directory
output_dir = Path("test_output")
output_dir.mkdir(exist_ok=True)

class AudioTester:
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.audio = pyaudio.PyAudio()
        
    def test_tts(self, text, lang='en', slow=False):
        """Test Text-to-Speech functionality."""
        print(f"\n=== Testing TTS: '{text[:50]}...' ===")
        
        output_file = output_dir / f"tts_{int(time.time())}.mp3"
        
        try:
            # Generate speech
            tts = gTTS(text=text, lang=lang, slow=slow)
            tts.save(str(output_file))
            
            if output_file.exists() and output_file.stat().st_size > 0:
                print(f"✅ TTS Success! File: {output_file}")
                print(f"   Size: {output_file.stat().st_size / 1024:.1f} KB")
                return str(output_file)
            else:
                print("❌ TTS Failed: No file created")
                return None
                
        except Exception as e:
            print(f"❌ TTS Error: {str(e)}")
            return None
    
    def test_stt(self, audio_file, expected_text=None):
        """Test Speech-to-Text functionality."""
        print(f"\n=== Testing STT with {audio_file} ===")
        
        if not os.path.exists(audio_file):
            print(f"❌ Audio file not found: {audio_file}")
            return False
            
        try:
            with sr.AudioFile(str(audio_file)) as source:
                print("Reading audio file...")
                audio_data = self.recognizer.record(source)
                
                print("Recognizing speech...")
                result = self.recognizer.recognize_google(audio_data, language='en-US')
                
                print(f"✅ STT Success! Recognized: '{result}'")
                
                if expected_text and expected_text.lower() not in result.lower():
                    print(f"⚠️ Warning: Expected '{expected_text}' but got '{result}'")
                    return False
                    
                return True
                
        except sr.UnknownValueError:
            print("❌ STT could not understand audio")
        except sr.RequestError as e:
            print(f"❌ STT request failed: {str(e)}")
        except Exception as e:
            print(f"❌ STT Error: {str(e)}")
            
        return False
    
    def test_microphone(self):
        """Test microphone input (interactive)."""
        print("\n=== Testing Microphone ===")
        print("Please speak into the microphone after the beep...")
        
        try:
            with sr.Microphone() as source:
                # Adjust for ambient noise
                print("Adjusting for ambient noise...")
                self.recognizer.adjust_for_ambient_noise(source, duration=1)
                
                # Beep
                print("\a")  # System beep
                print("Listening... (speak now)")
                
                # Listen for audio
                audio = self.recognizer.listen(source, timeout=5, phrase_time_limit=5)
                
                print("Processing...")
                try:
                    text = self.recognizer.recognize_google(audio)
                    print(f"✅ Recognized: {text}")
                    return text
                except sr.UnknownValueError:
                    print("❌ Could not understand audio")
                except sr.RequestError as e:
                    print(f"❌ Error: {str(e)}")
                    
        except Exception as e:
            print(f"❌ Microphone test failed: {str(e)}")
            
        return None

def run_complete_test():
    """Run complete audio test suite."""
    print("=== Starting Complete Audio Test ===\n")
    
    tester = AudioTester()
    
    # Test 1: Simple TTS
    test_text = "This is a test of the text to speech service."
    audio_file = tester.test_tts(test_text)
    
    # Test 2: STT with generated audio if available
    if audio_file:
        print("\nWaiting 2 seconds before STT test...")
        time.sleep(2)  # Give some time for file system
        tester.test_stt(audio_file, test_text)
    
    # Test 3: Interactive microphone test
    print("\n=== Microphone Test (Interactive) ===")
    print("This will test your microphone. Please speak when prompted.")
    input("Press Enter to continue...")
    tester.test_microphone()
    
    print("\n=== Audio Test Complete ===")

if __name__ == "__main__":
    run_complete_test()
    input("\nPress Enter to exit...")
