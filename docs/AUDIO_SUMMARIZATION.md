# Audio Summarization Feature

## Overview

This document describes the audio summarization feature that allows users to generate concise summaries of their audio notes.

## Implementation Details

### 1. Schemas

- Location: `backend/app/schemas/audio_summary.py`
- Defines request/response models for the summarization API

### 2. Service

- Location: `backend/app/services/audio_summarizer.py`
- Implements the core summarization logic with different styles:
  - Concise summary
  - Detailed summary
  - Bullet points

### 3. API Endpoints

- Location: `backend/app/api/endpoints/audio_summary.py`
- Endpoints:
  - `POST /audio/notes/summarize` - Generate summary with request body
  - `POST /audio/notes/{note_id}/summarize` - Generate summary with URL parameters

## Usage Examples

### Generate Summary (Request Body)

```http
POST /api/v1/audio/notes/summarize
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
    "note_id": 1,
    "style": "concise",
    "max_length": 250
}
```

### Generate Summary (URL Parameters)

```http
POST /api/v1/audio/notes/1/summarize?style=concise&max_length=250
Authorization: Bearer YOUR_TOKEN
```

## Response Format

```json
{
    "summary": "Generated summary text...",
    "key_points": ["Point 1", "Point 2", "Point 3"],
    "tags": ["meeting", "project"],
    "summary_style": "concise"
}
```

## Dependencies

- Python 3.8+
- FastAPI
- Pydantic
- SQLAlchemy

## Testing

Run the test script:

```bash
python test_audio_summary.py
```

## Next Steps

1. Add more summarization styles
2. Implement caching for frequently accessed summaries
3. Add support for batch summarization
