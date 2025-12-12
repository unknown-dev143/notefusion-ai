from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Create FastAPI app
app = FastAPI(title="NoteFusion AI Test Server")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# AI Tutor endpoints
@app.get("/api/v1/ai-tutor/personas")
async def get_personas():
    """Get available AI tutor personas."""
    return {
        "general": {
            "name": "NoteFusion Tutor",
            "description": "A friendly, knowledgeable tutor for general academic assistance",
            "style": "Supportive and encouraging"
        },
        "socratic": {
            "name": "Socratic Guide", 
            "description": "Uses Socratic method to guide students to answers",
            "style": "Question-based and probing"
        },
        "technical": {
            "name": "Technical Expert",
            "description": "Specializes in technical subjects like programming and engineering",
            "style": "Precise and detailed"
        },
        "study_buddy": {
            "name": "Study Buddy",
            "description": "Casual peer-like tutor for collaborative learning",
            "style": "Friendly and conversational"
        },
        "exam_coach": {
            "name": "Exam Coach",
            "description": "Focused on test preparation and study strategies",
            "style": "Structured and motivational"
        }
    }

@app.post("/api/v1/ai-tutor/sessions")
async def create_session(data: dict):
    """Create a new tutoring session."""
    session_id = f"session_{hash(str(data)) % 10000}"
    return {
        "id": session_id,
        "persona": data.get("persona", "general"),
        "subject": data.get("subject", ""),
        "topic": data.get("topic", ""),
        "difficulty": data.get("difficulty", "medium"),
        "learning_style": data.get("learning_style", "visual"),
        "created_at": "2024-01-01T00:00:00Z",
        "last_activity": "2024-01-01T00:00:00Z",
        "message_count": 0,
        "is_active": True
    }

@app.get("/api/v1/ai-tutor/sessions")
async def get_sessions():
    """Get all tutoring sessions."""
    return []

@app.post("/api/v1/ai-tutor/sessions/{session_id}/messages")
async def send_message(session_id: str, message: dict):
    """Send a message and get AI response."""
    content = message.get("content", "")
    
    # Simple AI response logic
    if "help" in content.lower():
        ai_response = "I'm here to help! What specific topic would you like assistance with?"
    elif "explain" in content.lower():
        ai_response = "Let me explain that concept step by step. First, we need to understand the basics..."
    else:
        ai_response = f"That's an interesting question! Let me think about {content.split()[-1] if content else 'that'}..."
    
    return {
        "message": "Message sent successfully",
        "ai_response": ai_response
    }

@app.get("/api/v1/ai-tutor/sessions/{session_id}/messages")
async def get_session_messages(session_id: str):
    """Get all messages in a session."""
    return []

@app.post("/api/v1/ai-tutor/study-plans")
async def create_study_plan(data: dict):
    """Create a personalized study plan."""
    return {
        "id": f"plan_{hash(str(data)) % 10000}",
        "subject": data.get("subject", ""),
        "goals": data.get("goals", []),
        "duration_weeks": data.get("duration_weeks", 4),
        "difficulty": data.get("difficulty", "medium"),
        "learning_style": data.get("learning_style", "visual"),
        "weekly_topics": [
            f"Week {i+1}: {data.get('subject', 'Subject')} - Topic {i+1}" 
            for i in range(data.get("duration_weeks", 4))
        ],
        "created_at": "2024-01-01T00:00:00Z"
    }

@app.delete("/api/v1/ai-tutor/sessions/{session_id}")
async def delete_session(session_id: str):
    """Delete a tutoring session."""
    return {"message": "Session deleted successfully"}

# AI endpoints
@app.get("/api/v1/ai/models")
async def get_ai_models():
    """Get available AI models."""
    return {
        "gpt-3.5-turbo": {
            "id": "gpt-3.5-turbo",
            "name": "GPT-3.5 Turbo",
            "description": "Fast and efficient model for general tasks",
            "max_tokens": 4096,
            "available": True
        },
        "gpt-4": {
            "id": "gpt-4",
            "name": "GPT-4",
            "description": "Advanced model for complex reasoning",
            "max_tokens": 8192,
            "available": True
        }
    }

@app.post("/api/v1/ai/summarize")
async def summarize_text(data: dict):
    """Summarize text."""
    text = data.get("text", "")
    summary_length = data.get("summary_length", "medium")
    
    # Simple summary logic
    if len(text) > 100:
        summary = text[:100] + "..." if summary_length == "short" else text[:200] + "..."
    else:
        summary = text
    
    return {
        "original_text": text,
        "summary": summary,
        "summary_length": summary_length
    }

@app.post("/api/v1/ai/flashcards/generate")
async def generate_flashcards(data: dict):
    """Generate flashcards."""
    content = data.get("content", "")
    num_cards = data.get("num_cards", 5)
    
    # Simple flashcard generation
    flashcards = []
    words = content.split()
    for i in range(min(num_cards, len(words) // 2)):
        front = " ".join(words[i*2:(i+1)*2])
        back = f"Definition/Explanation for: {front}"
        flashcards.append({
            "front": front,
            "back": back,
            "difficulty": "medium"
        })
    
    return {
        "title": "Generated Flashcards",
        "description": "Flashcards generated from your content",
        "cards": flashcards
    }

@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "NoteFusion AI Test Server is running!"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
