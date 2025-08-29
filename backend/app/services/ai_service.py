import os
from typing import Dict, Any, Optional
import openai
from openai import OpenAI
from ..config.ai_models import AIModel, get_model_config, get_default_model, get_available_models

class AIService:
    """Service for handling AI model interactions and version management."""
    
    def __init__(self, api_key: Optional[str] = None, default_model: Optional[AIModel] = None):
        """Initialize the AI service.
        
        Args:
            api_key: Optional API key. If not provided, will use OPENAI_API_KEY from environment.
            default_model: Optional default model to use. If not provided, will use the most advanced available model.
        """
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.client = OpenAI(api_key=self.api_key)
        self.default_model = default_model or get_default_model()
        
    def set_api_key(self, api_key: str):
        """Update the API key for the AI service."""
        self.api_key = api_key
        self.client = OpenAI(api_key=api_key)
        
    def set_model(self, model: AIModel):
        """Set the default model to use for completions."""
        if model not in get_available_models():
            raise ValueError(f"Model {model} is not available or not supported.")
        self.default_model = model
        
    def get_available_models(self) -> Dict[str, Dict[str, Any]]:
        """Get information about all available models."""
        models = {}
        for model_enum, config in get_available_models().items():
            models[model_enum.value] = {
                "name": config.name,
                "description": config.description,
                "max_tokens": config.max_tokens,
                "default_api_key_env_var": config.default_api_key_env_var
            }
        return models
    
    async def generate_text(
        self, 
        prompt: str, 
        model: Optional[AIModel] = None,
        **kwargs
    ) -> str:
        """Generate text using the specified or default model.
        
        Args:
            prompt: The prompt to send to the model
            model: Optional model to use. If not provided, uses the default model.
            **kwargs: Additional arguments to pass to the completion API
            
        Returns:
            The generated text
        """
        model_to_use = model or self.default_model
        config = get_model_config(model_to_use)
        
        # Set default parameters if not provided
        if "temperature" not in kwargs:
            kwargs["temperature"] = 0.7
        if "max_tokens" not in kwargs:
            kwargs["max_tokens"] = min(4000, config.max_tokens - len(prompt) // 4)  # Rough estimate
            
        try:
            response = self.client.chat.completions.create(
                model=model_to_use.value,
                messages=[{"role": "user", "content": prompt}],
                **kwargs
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            # Handle API errors gracefully
            error_msg = str(e)
            if "rate limit" in error_msg.lower():
                raise Exception("Rate limit exceeded. Please try again later.") from e
            elif "authentication" in error_msg.lower():
                raise Exception("Invalid API key. Please check your API key and try again.") from e
            else:
                raise Exception(f"AI service error: {error_msg}") from e
    
    def get_model_info(self, model: AIModel) -> Dict[str, Any]:
        """Get information about a specific model."""
        config = get_model_config(model)
        return {
            "id": model.value,
            "name": config.name,
            "description": config.description,
            "max_tokens": config.max_tokens,
            "available": config.available
        }

# Global instance for easy import
ai_service = AIService()
