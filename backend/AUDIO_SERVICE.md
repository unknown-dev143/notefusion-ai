# Audio Service Documentation

## Overview

The Audio Service provides comprehensive audio processing capabilities including text-to-speech (TTS), speech-to-text (STT), and audio note management.

## Features

### 1. Text-to-Speech (TTS)

Convert text to natural-sounding speech with support for multiple languages and speech rates.

### 2. Speech-to-Text (STT)

Transcribe spoken words from audio files into text using Google's Speech Recognition API.

### 3. Audio Note Processing

Record, save, and transcribe audio notes with automatic language detection.

### 4. Audio Flashcards

Generate interactive audio flashcards from text content.

## Installation

1. Install required Python packages:

   ```bash
   pip install gTTS SpeechRecognition pydub pyaudio
   ```

2. For Windows users, you might need to install additional dependencies:

   - Install [Microsoft Visual C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
   - Install [FFmpeg](https://ffmpeg.org/) and add it to your PATH

## Usage

### Basic TTS Example

```python
from app.services.audio.service import AudioService

async def main():
    audio_service = AudioService()
    
    # Convert text to speech and save to file
    audio_path, content_type = await audio_service.text_to_speech(
        text="Hello, this is a test.",
        lang="en",
        slow=False,
        save=True
    )
    print(f"Audio saved to: {audio_path}")
```

### Basic STT Example

```python
from app.services.audio.service import AudioService

async def main():
    audio_service = AudioService()
    
    # Transcribe an audio file
    text = await audio_service.transcribe(
        audio_path="path/to/audio.wav",
        language="en-US"
    )
    print(f"Transcribed text: {text}")
```

### Processing Audio Notes

```python
from app.services.audio.service import AudioService

async def main():
    audio_service = AudioService()
    
    # Process an audio note
    result = await audio_service.process_audio_note(
        audio_file="path/to/recording.wav",
        language="en-US",
        save_audio=True
    )
    print(f"Transcription: {result['transcription']}")
```

### Generating Audio Flashcards

```python
from app.services.audio.service import AudioService

async def main():
    audio_service = AudioService()
    
    # Generate flashcards from text
    flashcards = await audio_service.generate_audio_flashcards(
        text="""
        Photosynthesis is the process by which green plants use sunlight to synthesize foods.
        The mitochondria is the powerhouse of the cell.
        """,
        language="en"
    )
    
    for card in flashcards:
        print(f"Flashcard: {card['text']}")
        print(f"Audio: {card['audio_path']}")
```

## API Endpoints

### POST /api/audio/tts

Convert text to speech.

**Request Body:**

```json
{
    "text": "Text to convert to speech",
    "lang": "en",
    "slow": false
}
```

**Response:**

- `200 OK` with audio file
- `400 Bad Request` for invalid input
- `500 Internal Server Error` for processing errors

### POST /api/audio/stt

Convert speech to text.

**Request Body:**

- `file`: Audio file (WAV format recommended)
- `language`: Language code (default: 'en-US')

**Response:**

```json
{
    "text": "Transcribed text",
    "language": "en-US"
}
```

## Error Handling

The service includes comprehensive error handling and logging. Check the application logs for detailed error information.

## Testing

Run the test suite with:

```bash
python test_audio_services.py
```

## Dependencies

- Python 3.7+
- gTTS (Google Text-to-Speech)
- SpeechRecognition
- PyDub
- PyAudio

## License

[Your License Here]
