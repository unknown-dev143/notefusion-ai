"""
Comprehensive test script for AudioService functionality.
"""
import os
import sys
import asyncio
import json
import pytest
from pathlib import Path
from typing import Dict, Any, List, Optional

# Add the backend directory to Python path
backend_dir = Path(__file__).parent.absolute()
sys.path.insert(0, str(backend_dir))

# Initialize logging
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize AudioService
audio_service = None

try:
    from app.services.audio.service import AudioService
    audio_service = AudioService()
except ImportError as e:
    logger.warning(f"Could not import AudioService: {e}")
    logger.warning("Running in test mode with mock implementations")

# Test Fixtures
@pytest.fixture
def test_audio_file(tmp_path: Path) -> Path:
    """Create a test audio file for transcription tests."""
    test_audio = tmp_path / "test_audio.wav"
    test_audio.write_bytes(
        b"RIFF$\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00"
        b"\x22\x56\x00\x00\x44\xac\x00\x00\x02\x00\x10\x00"
        b"data\x00\x00\x00\x00"
    )
    return test_audio

# Test Cases
@pytest.mark.asyncio
async def test_tts() -> str:
    """Test Text-to-Speech functionality."""
    if audio_service is None:
        pytest.skip("AudioService not available. Running in test mode.")
    
    test_text = "This is a test of the text-to-speech functionality."
    
    try:
        audio_data = await audio_service.text_to_speech(
            text=test_text,
            voice="en-US-AriaNeural",
            rate="+10%",
            pitch="+0Hz"
        )
        
        assert isinstance(audio_data, bytes), "Should return audio data as bytes"
        assert len(audio_data) > 0, "Audio data should not be empty"
        
        # Save the audio to a file for manual verification
        output_path = "test_output_tts.wav"
        with open(output_path, "wb") as f:
            f.write(audio_data)
            
        return output_path
        
    except Exception as e:
        if "api key" in str(e).lower() or "authentication" in str(e).lower():
            pytest.skip("Skipping TTS test - service not configured")
        raise

@pytest.mark.asyncio
async def test_transcribe(test_audio_file: Path):
    """Test audio transcription."""
    if audio_service is None:
        pytest.skip("AudioService not available. Running in test mode.")
    
    try:
        with open(test_audio_file, "rb") as f:
            audio_data = f.read()
            
        transcription = await audio_service.transcribe_audio(
            audio_data=audio_data,
            language="en-US",
            format="wav"
        )
        
        assert isinstance(transcription, str), "Transcription should be a string"
        
    except Exception as e:
        if "api key" in str(e).lower() or "authentication" in str(e).lower():
            pytest.skip("Skipping transcription test - service not configured")
        raise

@pytest.mark.asyncio
async def test_audio_note(test_audio_file: Path):
    """Test processing an audio note."""
    if audio_service is None:
        pytest.skip("AudioService not available. Running in test mode.")
    
    test_note = {
        "id": "test_note_123",
        "title": "Test Note",
        "content": "",
        "audio_path": str(test_audio_file),
        "metadata": {
            "language": "en-US",
            "speaker_count": 1
        }
    }
    
    try:
        processed_note = await audio_service.process_audio_note(test_note)
        
        assert isinstance(processed_note, dict), "Should return a dictionary"
        assert "content" in processed_note, "Processed note should have content"
        assert processed_note["id"] == test_note["id"], "Note ID should be preserved"
        
    except Exception as e:
        if "api key" in str(e).lower() or "authentication" in str(e).lower():
            pytest.skip("Skipping audio note test - service not configured")
        raise

@pytest.mark.asyncio
async def test_audio_flashcards():
    """Test generating audio flashcards."""
    if audio_service is None:
        pytest.skip("AudioService not available. Running in test mode.")
    
    test_text = """
    Photosynthesis is the process by which green plants use sunlight to synthesize foods.
    The mitochondria is the powerhouse of the cell.
    Newton's first law states that an object in motion stays in motion unless acted upon by an external force.
    The chemical formula for water is H₂O.
    The Earth revolves around the Sun in an elliptical orbit.
    """
    
    try:
        flashcards = await audio_service.generate_flashcards(
            text=test_text,
            num_flashcards=3,
            language="en-US"
        )
        
        assert isinstance(flashcards, list), "Should return a list of flashcards"
        assert len(flashcards) > 0, "Should return at least one flashcard"
        
        for flashcard in flashcards:
            assert "question" in flashcard, "Flashcard should have a question"
            assert "answer" in flashcard, "Flashcard should have an answer"
            assert isinstance(flashcard["question"], str), "Question should be a string"
            assert isinstance(flashcard["answer"], str), "Answer should be a string"
        
    except Exception as e:
        if "api key" in str(e).lower() or "authentication" in str(e).lower():
            pytest.skip("Skipping flashcard test - service not configured")
        raise

@pytest.mark.asyncio
async def test_audio_summarization():
    """Test audio note summarization."""
    if audio_service is None:
        pytest.skip("AudioService not available. Running in test mode.")
    
    test_note = {
        "title": "Test Meeting Notes",
        "transcription": """
        In today's meeting, we discussed the new project timeline. 
        The frontend team is making good progress on the UI components. 
        The backend team is working on the API endpoints. 
        We need to finalize the database schema by Friday. 
        The next meeting is scheduled for next Monday at 10 AM.
        """,
        "language": "en"
    }
    
    test_cases = [
        {"style": "concise", "max_length": 100},
        {"style": "detailed", "max_length": 200},
        {"style": "bullets", "max_length": 150},
        {"style": "action_items", "max_length": 200}
    ]
    
    try:
        for test_case in test_cases:
            summary = await audio_service.summarize_audio_note(
                note=test_note,
                style=test_case["style"],
                max_length=test_case["max_length"]
            )
            
            assert isinstance(summary, str), "Summary should be a string"
            assert len(summary) > 0, "Summary should not be empty"
            assert len(summary) <= test_case["max_length"], "Summary exceeds max length"
            
    except Exception as e:
        if "api key" in str(e).lower() or "authentication" in str(e).lower():
            pytest.skip("Skipping summarization test - service not configured")
        raise

# Main function to run all tests
async def run_all_tests():
    """Run all test functions and report results."""
    test_functions = [
        ("Text-to-Speech", test_tts),
        ("Audio Transcription", lambda: test_transcribe(Path("test_audio.wav"))),
        ("Audio Note Processing", lambda: test_audio_note(Path("test_audio.wav"))),
        ("Audio Flashcards", test_audio_flashcards),
        ("Audio Summarization", test_audio_summarization)
    ]
    
    results = {}
    for name, test_func in test_functions:
        try:
            print(f"\n{'=' * 50}")
            print(f"RUNNING TEST: {name}")
            print("=" * 50)
            
            if asyncio.iscoroutinefunction(test_func):
                result = await test_func()
            else:
                result = test_func()
                if asyncio.iscoroutine(result):
                    result = await result
                    
            results[name] = (True, "Test passed")
            print(f"✅ {name} completed successfully")
            
        except Exception as e:
            results[name] = (False, str(e))
            print(f"❌ {name} failed: {str(e)}")
    
    # Print summary
    print("\n" + "=" * 50)
    print("TEST SUMMARY")
    print("=" * 50)
    
    for name, (success, message) in results.items():
        status = "PASS" if success else "FAIL"
        print(f"{status}: {name} - {message}")
    
    # Return non-zero exit code if any tests failed
    if not all(success for success, _ in results.values()):
        return 1
    return 0

if __name__ == "__main__":
    sys.exit(asyncio.run(run_all_tests()))
