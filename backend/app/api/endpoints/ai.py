<<<<<<< HEAD
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field
from ...config.ai_models import AIModel, get_available_models, get_default_model
from ...services.ai_service import AIService, ai_service
from ...core.security import get_current_active_user
from ...services.ai_services import (
    SummaryRequest, 
    SummaryResponse,
    Flashcard,
    FlashcardDeck,
    AIServiceError
)
=======
from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, Optional
from pydantic import BaseModel
from ...config.ai_models import AIModel, get_available_models, get_default_model
from ...services.ai_service import AIService, ai_service
from ...core.security import get_current_active_user
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e

router = APIRouter()

class AIModelInfo(BaseModel):
    id: str
    name: str
    description: str
    max_tokens: int
    available: bool

class AIConfigUpdate(BaseModel):
    api_key: Optional[str] = None
    default_model: Optional[str] = None

<<<<<<< HEAD
class FlashcardRequest(BaseModel):
    content: str = Field(..., min_length=100, description="Content to generate flashcards from")
    num_cards: int = Field(5, ge=1, le=20, description="Number of flashcards to generate")
    difficulty: Optional[str] = Field("medium", description="Difficulty level (easy, medium, hard)")

class FlashcardResponse(FlashcardDeck):
    pass

# AI Models Endpoints

=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
@router.get("/models", response_model=Dict[str, AIModelInfo])
async def list_models():
    """List all available AI models and their configurations."""
    models = {}
    for model_enum, config in get_available_models().items():
        models[model_enum.value] = {
            "id": model_enum.value,
            "name": config.name,
            "description": config.description,
            "max_tokens": config.max_tokens,
            "available": config.available
        }
    return models

@router.get("/models/default", response_model=AIModelInfo)
async def get_default_ai_model():
    """Get the default AI model configuration."""
    default_model = get_default_model()
    config = ai_service.get_model_info(default_model)
    return config

@router.post("/config", response_model=Dict[str, Any])
async def update_ai_config(
    config_update: AIConfigUpdate,
    current_user: dict = Depends(get_current_active_user)
):
    """Update AI configuration (API key and/or default model).
    
    Requires authentication and admin privileges.
    """
    if not current_user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Admin privileges required")
    
    updates = {}
    
    if config_update.api_key is not None:
        ai_service.set_api_key(config_update.api_key)
        updates["api_key_updated"] = True
        
    if config_update.default_model is not None:
        try:
            model_enum = AIModel(config_update.default_model)
            ai_service.set_model(model_enum)
            updates["default_model_updated"] = True
            updates["default_model"] = model_enum.value
        except ValueError as e:
            raise HTTPException(status_code=400, detail=f"Invalid model: {str(e)}")
    
    return {"status": "success", "updates": updates}

<<<<<<< HEAD
@router.get("/config", response_model=Dict[str, Any])
async def get_current_config(
    current_user: dict = Depends(get_current_active_user)
):
    """Get the current AI configuration.
    
    Requires authentication.
    """
    if not current_user.get("is_superuser", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return {
        "api_key_configured": bool(ai_service.api_key),
        "default_model": get_default_model().value,
        "available_models": [m.value for m in get_available_models()]
    }

# AI Features Endpoints

@router.post("/summarize", response_model=SummaryResponse)
async def summarize_text(
    request: SummaryRequest,
    current_user: dict = Depends(get_current_active_user)
):
    """
    Generate a summary of the provided text.
    
    - **text**: The text to summarize (minimum 50 characters)
    - **summary_length**: Desired length of the summary (short, medium, long)
    - **focus**: Optional focus area for the summary
    """
    try:
        return await ai_service.generate_summary(request)
    except AIServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error in summarize_text: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while generating the summary"
        )

@router.post("/flashcards/generate", response_model=FlashcardResponse)
async def generate_flashcards(
    request: FlashcardRequest,
    current_user: dict = Depends(get_current_active_user)
):
    """
    Generate flashcards from the provided content.
    
    - **content**: The content to generate flashcards from (minimum 100 characters)
    - **num_cards**: Number of flashcards to generate (1-20)
    - **difficulty**: Desired difficulty level (easy, medium, hard)
    """
    try:
        return await ai_service.generate_flashcards(
            content=request.content,
            num_cards=request.num_cards
        )
    except AIServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error in generate_flashcards: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while generating flashcards"
        )

@router.post("/flashcards/save", status_code=status.HTTP_201_CREATED)
async def save_flashcards(
    deck: FlashcardDeck,
    current_user: dict = Depends(get_current_active_user)
):
    """
    Save a deck of flashcards to the user's collection.
    
    - **title**: Title of the flashcard deck
    - **description**: Description of the deck
    - **cards**: List of flashcards, each with front, back, tags, and difficulty
    """
    try:
        # TODO: Implement flashcard saving logic
        # This would typically save to your database
        return {"message": "Flashcards saved successfully", "deck_id": "generated-deck-id"}
    except Exception as e:
        logger.error(f"Error saving flashcards: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save flashcards"
        )
=======
@router.get("/config/current", response_model=Dict[str, Any])
async def get_current_config(
    current_user: dict = Depends(get_current_active_user)
):
    """Get the current AI configuration."""
    if not current_user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Admin privileges required")
    
    return {
        "default_model": ai_service.default_model.value,
        "available_models": {
            m.value: m.name for m in get_available_models().keys()
        },
        "api_key_configured": bool(ai_service.api_key)
    }
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
