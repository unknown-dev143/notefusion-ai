import os
import tempfile
import pytest
from unittest.mock import patch, MagicMock
import numpy as np

# Test audio recording functionality
def test_audio_recording():
    """Test audio recording initialization and basic operations"""
    from app.services.audio.recorder import AudioRecorder
    
    # Test recorder initialization
    recorder = AudioRecorder()
    assert recorder.is_recording is False
    
    # Test recording start/stop
    with patch('sounddevice.InputStream') as mock_stream:
        recorder.start_recording()
        assert recorder.is_recording is True
        
        # Simulate some audio data
        test_data = np.random.rand(44100 * 2, 1).astype(np.float32)  # 2 seconds of audio
        recorder._audio_buffer = test_data
        
        # Test stopping recording
        audio_data = recorder.stop_recording()
        assert recorder.is_recording is False
        assert len(audio_data) > 0

# Test audio processing
def test_audio_processing():
    """Test audio processing functions"""
    from app.services.audio.processor import AudioProcessor
    
    # Create test audio data (1 second of silence)
    sample_rate = 44100
    test_audio = np.zeros((sample_rate, 1), dtype=np.float32)
    
    # Test normalization
    processor = AudioProcessor()
    normalized = processor.normalize_audio(test_audio)
    assert normalized.shape == test_audio.shape
    
    # Test trimming silence
    trimmed = processor.trim_silence(test_audio, sample_rate)
    assert len(trimmed) <= len(test_audio)

# Test transcription service
@patch('app.services.audio.transcription.TranscriptionService')
def test_audio_transcription(mock_transcription):
    """Test audio transcription functionality"""
    from app.services.audio.service import AudioService
    
    # Setup mock
    mock_transcription.transcribe.return_value = {
        'text': 'This is a test transcription',
        'language': 'en',
        'confidence': 0.95
    }
    
    # Initialize service with mock
    service = AudioService(transcription_service=mock_transcription)
    
    # Create test audio file
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp_file:
        test_audio_path = tmp_file.name
        
    try:
        # Test transcription
        result = service.transcribe_audio(test_audio_path)
        assert 'text' in result
        assert result['text'] == 'This is a test transcription'
        assert result['confidence'] > 0.9
        
    finally:
        # Cleanup
        if os.path.exists(test_audio_path):
            os.unlink(test_audio_path)

# Test audio note management
def test_audio_note_management():
    """Test audio note CRUD operations"""
    from app.services.audio.storage import AudioNoteStorage
    from app.schemas.audio import AudioNoteCreate, AudioNoteUpdate
    
    # Initialize with in-memory storage for testing
    storage = AudioNoteStorage(":memory:")
    
    # Test create
    test_note = AudioNoteCreate(
        title="Test Note",
        audio_path="/test/audio.wav",
        transcription="Test transcription",
        duration=60.5
    )
    created_note = storage.create(test_note)
    assert created_note.id is not None
    assert created_note.title == "Test Note"
    
    # Test get
    retrieved_note = storage.get(created_note.id)
    assert retrieved_note.id == created_note.id
    
    # Test update
    update_data = AudioNoteUpdate(transcription="Updated transcription")
    updated_note = storage.update(created_note.id, update_data)
    assert updated_note.transcription == "Updated transcription"
    
    # Test list
    notes = storage.list()
    assert len(notes) == 1
    
    # Test delete
    storage.delete(created_note.id)
    assert storage.get(created_note.id) is None

# Test API endpoints
@patch('app.api.endpoints.audio.AudioService')
def test_audio_api_endpoints(mock_audio_service, test_client):
    """Test audio-related API endpoints"""
    # Setup mock service
    mock_service = MagicMock()
    mock_audio_service.return_value = mock_service
    
    # Mock service methods
    test_note = {
        "id": "test123",
        "title": "Test Note",
        "audio_url": "/audio/test123.wav",
        "transcription": "Test transcription",
        "duration": 60.5,
        "created_at": "2023-01-01T00:00:00"
    }
    mock_service.create_note.return_value = test_note
    mock_service.get_note.return_value = test_note
    mock_service.list_notes.return_value = [test_note]
    
    # Test create note
    response = test_client.post(
        "/api/audio/notes",
        json={
            "title": "Test Note",
            "audio_data": "base64_encoded_audio_data"
        }
    )
    assert response.status_code == 200
    assert response.json()["id"] == "test123"
    
    # Test get note
    response = test_client.get("/api/audio/notes/test123")
    assert response.status_code == 200
    assert response.json()["title"] == "Test Note"
    
    # Test list notes
    response = test_client.get("/api/audio/notes")
    assert response.status_code == 200
    assert len(response.json()) == 1
    
    # Test delete note
    response = test_client.delete("/api/audio/notes/test123")
    assert response.status_code == 200

# Test error handling
def test_error_handling():
    """Test error handling in audio services"""
    from app.services.audio.exceptions import AudioProcessingError
    from app.services.audio.service import AudioService
    
    # Initialize with mock that raises an error
    with patch('app.services.audio.transcription.TranscriptionService') as mock_transcription:
        mock_transcription.transcribe.side_effect = Exception("Transcription failed")
        service = AudioService(transcription_service=mock_transcription)
        
        # Test that service handles errors gracefully
        with pytest.raises(AudioProcessingError):
            service.transcribe_audio("nonexistent.wav")

# Test performance with large audio files
@patch('app.services.audio.processor.AudioProcessor')
def test_large_audio_processing(mock_processor):
    """Test processing of large audio files"""
    from app.services.audio.service import AudioService
    
    # Setup mock processor
    mock_processor_instance = MagicMock()
    mock_processor.return_value = mock_processor_instance
    
    # Mock processing methods
    mock_processor_instance.process.return_value = b"processed_audio_data"
    
    # Initialize service
    service = AudioService(audio_processor=mock_processor_instance)
    
    # Create a large test file (10MB)
    large_audio = os.urandom(10 * 1024 * 1024)  # 10MB of random data
    
    with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
        tmp_file.write(large_audio)
        tmp_file_path = tmp_file.name
    
    try:
        # Test processing
        processed = service.process_audio(tmp_file_path)
        assert processed == b"processed_audio"
        
        # Verify processor was called with the correct data
        mock_processor_instance.process.assert_called_once()
        
    finally:
        # Cleanup
        if os.path.exists(tmp_file_path):
            os.unlink(tmp_file_path)
