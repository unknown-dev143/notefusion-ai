"""
AI-related API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
import os
import openai
from app.core.security import get_current_active_user
from app.models.user import UserInDB

router = APIRouter()

class OpenAIRequest(BaseModel):
    prompt: str
    max_tokens: Optional[int] = 150
    temperature: Optional[float] = 0.7

@router.post("/ai/generate")
async def generate_text(
    request: OpenAIRequest,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """
    Generate text using OpenAI's API
    """
    try:
        # Get API key from environment variables
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(
                status_code=500,
                detail="OpenAI API key not configured"
            )
        
        # Initialize OpenAI client
        client = openai.OpenAI(api_key=api_key)
        
        # Make the API call
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "user", "content": request.prompt}
            ],
            max_tokens=request.max_tokens,
            temperature=request.temperature
        )
        
        return {"response": response.choices[0].message.content}
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating text: {str(e)}"
        )
