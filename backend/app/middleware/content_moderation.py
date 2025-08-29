"""Content moderation middleware for AI-generated content."""
from typing import Dict, List, Pattern, Optional, Tuple
import re
from fastapi import Request, HTTPException, status
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)

class ContentModeration:
    """Moderate AI-generated and user-submitted content."""
    
    def __init__(self):
        # Define patterns for different types of content to moderate
        self.banned_patterns: Dict[str, List[Pattern]] = {
            'hate_speech': [
                re.compile(r'\b(kill|hurt|harm|attack|assault|murder|rape|torture|abuse)(?:\s+\w+){0,3}\s+(you|them|us|him|her|me)\b', re.IGNORECASE),
                re.compile(r'\b(nazi|hitler|kkk|white\s+supremac|racist|sexist|homophob|transphob|islamophob)\b', re.IGNORECASE),
            ],
            'violence': [
                re.compile(r'\b(kill|murder|assassinat|behead|tortur|maim|mutilat|dismember|strangl|suffocat|stab|shoot|bomb|explod|arson|burn\s+alive|lynch|execute|massacre|genocide)\b', re.IGNORECASE),
            ],
            'self_harm': [
                re.compile(r'\b(suicid|kill\s+myself|end\s+it\s+all|want\s+to\s+die|cutting\s+myself|self\s*[-]?harm|self\s*[-]?injury)\b', re.IGNORECASE),
            ],
            'harassment': [
                re.compile(r'\b(rape|raping|rapist|pedophil|child\s*abuse|incest|molest|molestation|pedo)\b', re.IGNORECASE),
            ]
        }
    
    async def __call__(self, request: Request, call_next):
        # Skip moderation for non-POST/PUT requests or non-AI endpoints
        if request.method not in ["POST", "PUT"] or not request.url.path.startswith("/api/v1/ai"):
            return await call_next(request)
        
        try:
            # Check request body for inappropriate content
            body = await request.body()
            if body:
                body_str = body.decode('utf-8', errors='ignore')
                violation = self._check_content(body_str)
                if violation:
                    return self._create_violation_response(violation)
            
            # Process the request
            response = await call_next(request)
            
            # Check response for inappropriate content if it's from an AI endpoint
            if response.status_code < 300 and response.headers.get("content-type", "").startswith("application/json"):
                response_body = b"".join([chunk async for chunk in response.body_iterator])
                response_body_str = response_body.decode('utf-8', errors='ignore')
                violation = self._check_content(response_body_str)
                if violation:
                    return self._create_violation_response(violation)
                
                # Reconstruct the response
                response = JSONResponse(
                    content=response_body,
                    status_code=response.status_code,
                    headers=dict(response.headers)
                )
            
            return response
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Content moderation error: {str(e)}", exc_info=True)
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"detail": "Internal server error during content moderation"}
            )
    
    def _check_content(self, text: str) -> Optional[Tuple[str, str]]:
        """Check content for policy violations."""
        for category, patterns in self.banned_patterns.items():
            for pattern in patterns:
                if pattern.search(text):
                    return (category, pattern.pattern)
        return None
    
    def _create_violation_response(self, violation: Tuple[str, str]) -> JSONResponse:
        """Create a standardized response for content violations."""
        category, pattern = violation
        logger.warning(f"Content moderation violation - {category}: {pattern}")
        
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "error": "content_violation",
                "category": category,
                "message": "Content violates our usage policies"
            }
        )

# Create a middleware instance for easy use in FastAPI
content_moderator = ContentModeration()

# For use with FastAPI's add_middleware
def get_content_moderation_middleware():
    """Get the content moderation middleware instance."""
    return content_moderator.__call__
