# Audio Service API Documentation

This document provides detailed information about the Audio Service API endpoints, including usage examples and parameter descriptions.

## Table of Contents

- [Text-to-Speech (TTS)](#text-to-speech-tts)
- [Speech-to-Text (STT)](#speech-to-text-stt)
- [Supported Languages](#supported-languages)
- [Rate Limiting](#rate-limiting)
- [Error Handling](#error-handling)

## Text-to-Speech (TTS)

Convert text to spoken audio.

### Endpoint

```http
POST /api/audio/tts
```

### Parameters

| Parameter | Type    | Required | Default | Description                                      |
|-----------|---------|----------|---------|--------------------------------------------------|
| text      | string  | Yes      | -       | The text to convert to speech                    |
| lang      | string  | No       | 'en'    | Language code (e.g., 'en', 'es')                 |
| slow      | boolean | No       | false   | Whether to speak slowly                          |
| download  | boolean | No       | false   | Force file download instead of streaming         |

### Examples

#### Basic Usage

```bash
curl -X POST "http://localhost:8000/api/audio/tts" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, this is a test"}'
```

#### With Language and Slow Speech

```bash
curl -X POST "http://localhost:8000/api/audio/tts" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text": "Hola, esto es una prueba", "lang": "es", "slow": true}'
```

## Speech-to-Text (STT)

Convert spoken audio to text.

### Endpoint

```http
POST /api/audio/stt
```

### Parameters

| Parameter | Type   | Required | Default | Description                                      |
|-----------|--------|----------|---------|--------------------------------------------------|
| audio     | file   | Yes      | -       | Audio file to transcribe (WAV, MP3, OGG)         |
| language  | string | No       | 'en-US' | Language code (e.g., 'en-US', 'es-ES')           |

### Examples

#### Basic Usage

```bash
curl -X POST "http://localhost:8000/api/audio/stt" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "audio=@recording.wav"
```

#### With Language Specification

```bash
curl -X POST "http://localhost:8000/api/audio/stt" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "audio=@grabacion.wav" \
  -F "language=es-ES"
```

## Supported Languages

### Get Supported Languages

```http
GET /api/audio/languages
```

### Example Response

```json
{
  "tts": ["en", "es", "fr", "de", "it", "pt", "ru", "zh-CN", "ja", "ko"],
  "stt": ["en-US", "es-ES", "fr-FR", "de-DE", "it-IT", "pt-BR", "ru-RU", "zh-CN", "ja-JP", "ko-KR"]
}
```

## Rate Limiting

The Audio API is rate limited to prevent abuse. The default rate limit is 100 requests per hour per IP address. If you exceed this limit, you will receive a 429 Too Many Requests response.

### Rate Limit Headers

Each response includes the following headers:

- `X-RateLimit-Limit`: Maximum number of requests allowed in the time window
- `X-RateLimit-Remaining`: Number of requests remaining in the current window
- `X-RateLimit-Reset`: Time at which the current window resets (UTC epoch seconds)

## Error Handling

### Common Error Responses

#### 400 Bad Request

```json
{
  "detail": "Invalid audio format"
}
```

#### 401 Unauthorized

```json
{
  "detail": "Not authenticated"
}
```

#### 429 Too Many Requests

```json
{
  "detail": "Rate limit exceeded",
  "message": "Too many requests. Please try again in 3600 seconds.",
  "retry_after": 3600,
  "limit": 100,
  "remaining": 0
}
```

#### 500 Internal Server Error

```json
{
  "detail": "TTS conversion failed: [error details]"
}
```

## Python Client Example

```python
import requests

class AudioClient:
    def __init__(self, base_url, api_key):
        self.base_url = base_url.rstrip('/')
        self.headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
    
    def text_to_speech(self, text, lang='en', slow=False, download=False):
        """Convert text to speech."""
        url = f"{self.base_url}/api/audio/tts"
        data = {
            'text': text,
            'lang': lang,
            'slow': slow,
            'download': download
        }
        response = requests.post(url, json=data, headers=self.headers)
        response.raise_for_status()
        
        if download:
            # Save the audio file
            filename = f"tts_{hash(text)}.mp3"
            with open(filename, 'wb') as f:
                f.write(response.content)
            return filename
        return response.content
    
    def speech_to_text(self, audio_file, language='en-US'):
        """Convert speech to text."""
        url = f"{self.base_url}/api/audio/stt"
        files = {'audio': open(audio_file, 'rb')}
        data = {'language': language}
        
        response = requests.post(
            url,
            files=files,
            data=data,
            headers={'Authorization': self.headers['Authorization']}
        )
        response.raise_for_status()
        return response.json()['text']

# Example usage
if __name__ == "__main__":
    client = AudioClient("http://localhost:8000", "YOUR_API_KEY")
    
    # Text to speech
    audio_data = client.text_to_speech("Hello, this is a test")
    with open("output.mp3", "wb") as f:
        f.write(audio_data)
    
    # Speech to text
    text = client.speech_to_text("recording.wav")
    print(f"Transcribed text: {text}")
```
