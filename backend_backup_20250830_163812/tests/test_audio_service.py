"""
Unit tests for the Audio Service.
"""
import os
import sys
import pytest
from pathlib import Path
from unittest.mock import MagicMock, patch, mock_open
import tempfile

# Add the project root to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Import with error handling
from app.services.audio.service import AudioService, GTTSWrapper, PyTTSx3Wrapper
from app.config.audio_config import audio_settings

# Test data
TEST_TEXT = "This is a test message for text-to-speech conversion."
TEST_LANG = "en"
TEST_FILENAME = "test_audio"

@pytest.fixture
def audio_service():
    """Fixture to provide an AudioService instance for testing."""
    with tempfile.TemporaryDirectory() as temp_dir:
        yield AudioService(output_dir=temp_dir)

@pytest.fixture
def mock_audio_data():
    """Fixture to provide mock audio data."""
    return b'RIFF$\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00D\xac\x00\x00\x88X\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00'

class TestAudioService:
    """Test cases for the AudioService class."""

    def test_text_to_speech_success(self, audio_service):
        """Test successful text-to-speech conversion."""
        with patch('gtts.gTTS') as mock_tts, \
             patch('builtins.open', mock_open()) as mock_file, \
             patch('os.path.exists', return_value=True):
            # Setup mock
            mock_tts_instance = MagicMock()
            mock_tts.return_value = mock_tts_instance
            
            # Call the method
            result = audio_service.text_to_speech(
                text=TEST_TEXT,
                lang=TEST_LANG,
                filename=TEST_FILENAME,
                save=True
            )
            
            # Assertions
            assert isinstance(result, tuple)
            assert len(result) == 2
            filepath, content_type = result
            assert content_type == 'audio/mp3'
            assert Path(filepath).exists()
            
            # Cleanup
            if Path(filepath).exists():
                os.unlink(filepath)
    
    def test_text_to_speech_bytes(self, audio_service):
        """Test text-to-speech returning bytes."""
        with patch('gtts.gTTS') as mock_tts:
            # Setup mock
            mock_tts_instance = MagicMock()
            mock_tts.return_value = mock_tts_instance
            
            # Call the method
            result = audio_service.text_to_speech(
                text=TEST_TEXT,
                lang=TEST_LANG,
                save=False
            )
            
            # Assertions
            assert isinstance(result, tuple)
            assert len(result) == 2
            audio_data, content_type = result
            assert content_type == 'audio/mp3'
            assert isinstance(audio_data, bytes)
    
    def test_speech_to_text_success(self, audio_service, mock_audio_data, tmp_path):
        """Test successful speech-to-text conversion."""
        # Create a temporary audio file
        test_audio_path = tmp_path / "test_audio.wav"
        with open(test_audio_path, 'wb') as f:
            f.write(mock_audio_data)
        
        with patch('speech_recognition.Recognizer') as mock_recognizer:
            # Setup mock
            mock_recognizer_instance = MagicMock()
            mock_recognizer.return_value = mock_recognizer_instance
            mock_recognizer_instance.recognize_google.return_value = "Test transcription"
            
            # Call the method
            result = audio_service.speech_to_text(
                audio_source=str(test_audio_path),
                language="en-US"
            )
            
            # Assertions
            assert result == "Test transcription"
            mock_recognizer_instance.record.assert_called_once()
            mock_recognizer_instance.recognize_google.assert_called_once()
    
    def test_speech_to_text_invalid_file(self, audio_service):
        """Test speech-to-text with invalid file."""
        with pytest.raises(ValueError):
            audio_service.speech_to_text(
                audio_source="nonexistent_file.wav",
                language="en-US"
            )

class TestGTTSWrapper:
    """Test cases for the GTTSWrapper class."""
    
    def test_generate_success(self):
        """Test successful audio generation with gTTS."""
        wrapper = GTTSWrapper()
        with patch('gtts.gTTS') as mock_tts:
            # Setup mock
            mock_tts_instance = MagicMock()
            mock_tts.return_value = mock_tts_instance
            
            # Call the method
            result = wrapper.generate(
                text=TEST_TEXT,
                lang=TEST_LANG,
                slow=False
            )
            
            # Assertions
            assert isinstance(result, bytes)
            mock_tts.assert_called_once_with(
                text=TEST_TEXT,
                lang=TEST_LANG,
                slow=False
            )
            mock_tts_instance.write_to_fp.assert_called_once()

class TestPyTTSx3Wrapper:
    """Test cases for the PyTTSx3Wrapper class."""
    
    def test_generate_success(self):
        """Test successful audio generation with pyttsx3."""
        with patch('pyttsx3.init') as mock_init:
            # Setup mocks
            mock_engine = MagicMock()
            mock_init.return_value = mock_engine
            
            wrapper = PyTTSx3Wrapper()
            
            # Call the method
            result = wrapper.generate(
                text=TEST_TEXT,
                rate=150,
                volume=0.8
            )
            
            # Assertions
            assert isinstance(result, bytes)
            mock_engine.setProperty.assert_any_call('rate', 150)
            mock_engine.setProperty.assert_any_call('volume', 0.8)
            mock_engine.save_to_file.assert_called_once_with(
                TEST_TEXT,
                'ignored_path'
            )
            mock_engine.runAndWait.assert_called_once()

# Run tests with: python -m pytest tests/test_audio_service.py -v
