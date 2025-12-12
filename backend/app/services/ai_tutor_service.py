from typing import Dict, Any, List, Optional
import logging
from ..api.endpoints.ai_tutor import (
    TutoringSession,
    TutorMessage,
    StudyPlanRequest,
    TUTOR_PERSONAS
)

logger = logging.getLogger(__name__)

class AITutorService:
    """Service for managing AI tutoring sessions and interactions."""
    
    def __init__(self):
        self.sessions: Dict[str, TutoringSession] = {}
        self.messages: Dict[str, List[TutorMessage]] = {}
    
    async def create_session(
        self,
        persona: str = "general",
        subject: str = "",
        topic: str = "",
        difficulty: str = "medium",
        learning_style: str = "visual"
    ) -> Dict[str, Any]:
        """Create a new tutoring session."""
        try:
            session_id = f"session_{len(self.sessions) + 1}"
            
            session = TutoringSession(
                id=session_id,
                persona=persona,
                subject=subject,
                topic=topic,
                difficulty=difficulty,
                learning_style=learning_style,
                created_at="2024-01-01T00:00:00Z",
                last_activity="2024-01-01T00:00:00Z",
                message_count=0,
                is_active=True
            )
            
            self.sessions[session_id] = session
            self.messages[session_id] = []
            
            logger.info(f"Created tutoring session {session_id}")
            return {"session_id": session_id, "session": session}
            
        except Exception as e:
            logger.error(f"Error creating session: {str(e)}")
            raise Exception(f"Failed to create session: {str(e)}")
    
    async def send_message(
        self,
        session_id: str,
        content: str,
        message_type: str = "text"
    ) -> Dict[str, Any]:
        """Send a message and get AI response."""
        try:
            if session_id not in self.sessions:
                raise Exception("Session not found")
            
            session = self.sessions[session_id]
            persona_info = TUTOR_PERSONAS.get(session.persona, TUTOR_PERSONAS["general"])
            
            # Add user message
            user_message = TutorMessage(
                id=f"msg_{len(self.messages.get(session_id, [])) + 1}",
                session_id=session_id,
                role="user",
                content=content,
                timestamp="2024-01-01T00:00:00Z",
                message_type=message_type
            )
            
            if session_id not in self.messages:
                self.messages[session_id] = []
            self.messages[session_id].append(user_message)
            
            # Generate contextual AI response
            ai_response = await self._generate_ai_response(
                content=content,
                persona=session.persona,
                topic=session.topic,
                subject=session.subject,
                persona_info=persona_info
            )
            
            # Add AI response
            ai_message = TutorMessage(
                id=f"msg_{len(self.messages[session_id]) + 1}",
                session_id=session_id,
                role="tutor",
                content=ai_response,
                timestamp="2024-01-01T00:00:00Z",
                message_type="text"
            )
            
            self.messages[session_id].append(ai_message)
            
            # Update session
            session.message_count += 2
            session.last_activity = "2024-01-01T00:00:00Z"
            
            return {
                "message": "Message sent successfully",
                "ai_response": ai_response,
                "session_id": session_id
            }
            
        except Exception as e:
            logger.error(f"Error sending message: {str(e)}")
            raise Exception(f"Failed to send message: {str(e)}")
    
    async def _generate_ai_response(
        self,
        content: str,
        persona: str,
        topic: str,
        subject: str,
        persona_info: Dict[str, Any]
    ) -> str:
        """Generate AI response based on context."""
        # This is a simplified AI response generator
        # In production, this would call OpenAI API
        
        if persona == "socratic":
            return f"That's an interesting question about {topic}. What do you already know about this topic? Can you think of any related concepts you've encountered?"
        
        elif persona == "technical":
            return f"Let me provide a technical explanation about {topic}. The key concepts you need to understand are: [would list technical details]. Would you like me to elaborate on any specific aspect?"
        
        elif persona == "exam_coach":
            return f"For your {topic} exam preparation, let's focus on: 1) Key concepts, 2) Practice problems, 3) Study strategies. What area would you like to start with?"
        
        elif persona == "study_buddy":
            return f"Hey! {topic} is interesting. I found some great resources for this. Have you considered looking at it from [different perspective]? What's your current approach to studying this?"
        
        else:  # general
            return f"As your NoteFusion Tutor, I'd be happy to help you with {topic}! Based on what you've told me, I suggest we start with [key concept]. What specific aspect would you like to explore first?"
    
    async def get_sessions(self) -> List[TutoringSession]:
        """Get all active tutoring sessions."""
        return [session for session in self.sessions.values() if session.is_active]
    
    async def get_session(self, session_id: str) -> Optional[TutoringSession]:
        """Get a specific tutoring session."""
        return self.sessions.get(session_id)
    
    async def get_session_messages(self, session_id: str) -> List[TutorMessage]:
        """Get all messages in a session."""
        return self.messages.get(session_id, [])
    
    async def create_study_plan(self, request: StudyPlanRequest) -> Dict[str, Any]:
        """Create a personalized study plan."""
        try:
            study_plan = {
                "id": f"plan_{len(self.sessions) + 1}",
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
            raise Exception(f"Failed to create study plan: {str(e)}")
    
    async def delete_session(self, session_id: str) -> Dict[str, Any]:
        """Delete a tutoring session."""
        try:
            if session_id not in self.sessions:
                raise Exception("Session not found")
            
            # Mark session as inactive
            self.sessions[session_id].is_active = False
            
            return {"message": "Session deleted successfully"}
            
        except Exception as e:
            logger.error(f"Error deleting session: {str(e)}")
            raise Exception(f"Failed to delete session: {str(e)}")
    
    def get_personas(self) -> Dict[str, Any]:
        """Get available AI tutor personas."""
        return TUTOR_PERSONAS

# Global instance
ai_tutor_service = AITutorService()
