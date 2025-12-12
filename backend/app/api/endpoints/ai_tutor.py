from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field
from ...core.security import get_current_active_user
from ...services.ai_service import AIService, ai_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Pydantic Models
class TutoringSessionRequest(BaseModel):
    persona: str = Field("general", description="AI tutor persona to use")
    subject: str = Field(..., description="Subject area")
    topic: str = Field(..., description="Specific topic to discuss")
    difficulty: str = Field("medium", description="Difficulty level (beginner, intermediate, advanced)")
    learning_style: Optional[str] = Field("visual", description="Learning style preference")

class TutoringMessage(BaseModel):
    session_id: str = Field(..., description="Session ID")
    content: str = Field(..., description="Message content")
    message_type: str = Field("text", description="Message type (text, voice, image)")

class StudyPlanRequest(BaseModel):
    subject: str = Field(..., description="Subject area")
    goals: List[str] = Field(..., description="Learning goals")
    duration_weeks: int = Field(4, description="Study plan duration in weeks")
    difficulty: str = Field("medium", description="Difficulty level")
    learning_style: Optional[str] = Field("visual", description="Learning style preference")

class TutoringSession(BaseModel):
    id: str
    persona: str
    subject: str
    topic: str
    difficulty: str
    learning_style: str
    created_at: str
    last_activity: str
    message_count: int
    is_active: bool

class TutorMessage(BaseModel):
    id: str
    session_id: str
    role: str  # 'user' or 'tutor'
    content: str
    timestamp: str
    message_type: str

# AI Tutor Personas
TUTOR_PERSONAS = {
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

# In-memory session storage (TODO: Replace with database)
tutoring_sessions: Dict[str, TutoringSession] = {}
session_messages: Dict[str, List[TutorMessage]] = {}

@router.post("/sessions", response_model=TutoringSession)
async def create_tutoring_session(
    request: TutoringSessionRequest,
    current_user: dict = Depends(get_current_active_user)
):
    """Create a new AI tutoring session."""
    try:
        session_id = f"session_{len(tutoring_sessions) + 1}"
        
        session = TutoringSession(
            id=session_id,
            persona=request.persona,
            subject=request.subject,
            topic=request.topic,
            difficulty=request.difficulty,
            learning_style=request.learning_style,
            created_at="2024-01-01T00:00:00Z",
            last_activity="2024-01-01T00:00:00Z",
            message_count=0,
            is_active=True
        )
        
        tutoring_sessions[session_id] = session
        session_messages[session_id] = []
        
        logger.info(f"Created tutoring session {session_id} for user {current_user.get('id')}")
        return session
        
    except Exception as e:
        logger.error(f"Error creating tutoring session: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create tutoring session"
        )

@router.get("/sessions", response_model=List[TutoringSession])
async def get_user_sessions(
    current_user: dict = Depends(get_current_active_user)
):
    """Get all tutoring sessions for the current user."""
    try:
        user_sessions = [
            session for session in tutoring_sessions.values()
            if session.is_active  # TODO: Filter by actual user ID
        ]
        return user_sessions
        
    except Exception as e:
        logger.error(f"Error fetching sessions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch sessions"
        )

@router.get("/sessions/{session_id}", response_model=TutoringSession)
async def get_session(
    session_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    """Get a specific tutoring session."""
    if session_id not in tutoring_sessions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    return tutoring_sessions[session_id]

@router.post("/sessions/{session_id}/messages")
async def send_message(
    session_id: str,
    message: TutoringMessage,
    current_user: dict = Depends(get_current_active_user)
):
    """Send a message to the AI tutor and get a response."""
    try:
        if session_id not in tutoring_sessions:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )
        
        session = tutoring_sessions[session_id]
        persona_info = TUTOR_PERSONAS.get(session.persona, TUTOR_PERSONAS["general"])
        
        # Add user message
        user_message = TutorMessage(
            id=f"msg_{len(session_messages.get(session_id, [])) + 1}",
            session_id=session_id,
            role="user",
            content=message.content,
            timestamp="2024-01-01T00:00:00Z",
            message_type=message.message_type
        )
        
        if session_id not in session_messages:
            session_messages[session_id] = []
        session_messages[session_id].append(user_message)
        
        # Generate AI response (simplified for now)
        ai_response_content = f"As {persona_info['name']}, I'd be happy to help you with {session.topic}! {persona_info['style']}. Could you tell me more about what specific aspect you'd like to explore?"
        
        # Add AI response
        ai_message = TutorMessage(
            id=f"msg_{len(session_messages[session_id]) + 1}",
            session_id=session_id,
            role="tutor",
            content=ai_response_content,
            timestamp="2024-01-01T00:00:00Z",
            message_type="text"
        )
        
        session_messages[session_id].append(ai_message)
        
        # Update session
        session.message_count += 2
        session.last_activity = "2024-01-01T00:00:00Z"
        
        return {"message": "Message sent successfully", "ai_response": ai_response_content}
        
    except Exception as e:
        logger.error(f"Error sending message: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send message"
        )

@router.get("/sessions/{session_id}/messages", response_model=List[TutorMessage])
async def get_session_messages(
    session_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    """Get all messages in a tutoring session."""
    if session_id not in session_messages:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    return session_messages[session_id]

@router.post("/study-plans")
async def create_study_plan(
    request: StudyPlanRequest,
    current_user: dict = Depends(get_current_active_user)
):
    """Create a personalized study plan."""
    try:
        # Generate study plan (simplified)
        study_plan = {
            "id": f"plan_{len(tutoring_sessions) + 1}",
            "subject": request.subject,
            "goals": request.goals,
            "duration_weeks": request.duration_weeks,
            "difficulty": request.difficulty,
            "learning_style": request.learning_style,
            "weekly_topics": [
                f"Week {i+1}: {request.subject} - Topic {i+1}" 
                for i in range(request.duration_weeks)
            ],
            "created_at": "2024-01-01T00:00:00Z"
        }
        
        logger.info(f"Created study plan for {request.subject}")
        return study_plan
        
    except Exception as e:
        logger.error(f"Error creating study plan: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create study plan"
        )

@router.get("/personas")
async def get_tutor_personas():
    """Get available AI tutor personas."""
    return TUTOR_PERSONAS

@router.delete("/sessions/{session_id}")
async def delete_session(
    session_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    """Delete a tutoring session."""
    if session_id not in tutoring_sessions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    # Mark session as inactive
    tutoring_sessions[session_id].is_active = False
    
    return {"message": "Session deleted successfully"}
