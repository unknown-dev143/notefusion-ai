"""
Integration tests for the Audio API endpoints.
"""
import os
import sys
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock, mock_open
import tempfile
from pathlib import Path

# Add the project root to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Import the FastAPI app
from app.main import app
from app.services.audio.service import audio_service
from app.config.audio_config import audio_settings

# Create test client
client = TestClient(app)

# Test data
TEST_TEXT = "This is a test message for the API."
TEST_LANG = "en"
TEST_AUDIO_CONTENT = b'RIFF$\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00D\xac\x00\x00\x88X\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00'

# Mock authentication
def mock_get_current_user():
    return "test_user"

app.dependency_overrides["app.core.security.get_current_user"] = mock_get_current_user

class TestAudioAPI:
    """Test cases for the Audio API endpoints."""

    def test_text_to_speech_success(self, tmp_path):
        """Test successful text-to-speech conversion."""
        # Setup
        with patch.object(audio_service, 'text_to_speech') as mock_tts, \
             patch('os.path.exists', return_value=True):
            # Mock the response
            mock_tts.return_value = (str(tmp_path / "test.mp3"), "audio/mp3")
            
            # Create a test file
            test_file = tmp_path / "test.mp3"
            test_file.write_text("dummy audio content")
            
            # Make the request
            response = client.post(
                "/api/audio/tts",
                json={
                    "text": TEST_TEXT,
                    "lang": TEST_LANG,
                    "slow": False,
                    "download": True
                }
            )
            
            # Assertions
            assert response.status_code == 200
            assert response.headers["content-type"] == "audio/mp3"
            assert "content-disposition" in response.headers
            assert "attachment" in response.headers["content-disposition"]
            
            # Cleanup
            if test_file.exists():
                test_file.unlink()
    
    def test_text_to_speech_streaming(self, tmp_path):
        """Test text-to-speech with streaming response."""
        # Setup
        with patch.object(audio_service, 'text_to_speech') as mock_tts:
            # Mock the response
            mock_tts.return_value = (b"dummy audio data", "audio/mp3")
            
            # Make the request
            response = client.post(
                "/api/audio/tts",
                json={
                    "text": TEST_TEXT,
                    "download": False
                }
            )
            
            # Assertions
            assert response.status_code == 200
            assert response.headers["content-type"] == "audio/mp3"
            assert response.content == b"dummy audio data"
    
    def test_speech_to_text_success(self, tmp_path):
        """Test successful speech-to-text conversion."""
        # Create a temporary audio file
        test_audio_path = tmp_path / "test_audio.wav"
        test_audio_path.write_bytes(TEST_AUDIO_CONTENT)
        
        # Setup mocks
        with patch('speech_recognition.Recognizer') as mock_recognizer, \
             patch('builtins.open', create=True) as mock_open:
            
            # Setup mock recognizer
            mock_recognizer_instance = MagicMock()
            mock_recognizer.return_value = mock_recognizer_instance
            mock_recognizer_instance.recognize_google.return_value = "Test transcription"
            
            # Mock file operations
            mock_file = MagicMock()
            mock_file.__enter__.return_value = test_audio_path.open('rb')
            mock_open.return_value = mock_file
            
            # Make the request
            with test_audio_path.open('rb') as f:
                files = {'audio': ('test.wav', f, 'audio/wav')}
                response = client.post(
                    "/api/audio/stt",
                    files=files,
                    data={"language": "en-US"}
                )
            
            # Assertions
            assert response.status_code == 200
            assert response.json() == {"text": "Test transcription"}
    
    def test_speech_to_text_invalid_file(self):
        """Test speech-to-text with invalid file."""
        # Create an invalid audio file (empty)
        files = {'audio': ('test.wav', b'', 'audio/wav')}
        
        # Make the request
        response = client.post(
            "/api/audio/stt",
            files=files
        )
        
        # Assertions
        assert response.status_code == 400
        assert "error" in response.json()
    
    def test_get_supported_languages(self):
        """Test getting supported languages."""
        # Make the request
        response = client.get("/api/audio/languages")
        
        # Assertions
        assert response.status_code == 200
        data = response.json()
        assert "tts" in data
        assert "stt" in data
        assert isinstance(data["tts"], list)
        assert isinstance(data["stt"], list)
    
    def test_rate_limiting(self):
        """Test rate limiting on the TTS endpoint."""
        # Setup mock
        with patch.object(audio_service, 'text_to_speech') as mock_tts:
            mock_tts.return_value = (b"dummy audio data", "audio/mp3")
            
            # Make requests up to the rate limit
            for _ in range(audio_settings.RATE_LIMIT_REQUESTS):
                response = client.post(
                    "/api/audio/tts",
                    json={"text": "test"}
                )
                assert response.status_code == 200
            
            # Next request should be rate limited
            response = client.post(
                "/api/audio/tts",
                json={"text": "test"}
            )
            assert response.status_code == 429
            assert "Rate limit exceeded" in response.json()["detail"]

# Run tests with: python -m pytest tests/test_audio_api.py -v
