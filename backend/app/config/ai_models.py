from enum import Enum
from typing import Dict, Optional
from pydantic import BaseModel, Field

class AIModel(str, Enum):
    GPT_4 = "gpt-4"
    GPT_4_TURBO = "gpt-4-turbo-preview"
    GPT_3_5_TURBO = "gpt-3.5-turbo"
    # Add new models here as they become available
    GPT_5 = "gpt-5"

class AIModelConfig(BaseModel):
    """Configuration for an AI model."""
    name: str
    model_id: str
    max_tokens: int
    description: str
    default_api_key_env_var: str = "OPENAI_API_KEY"
    available: bool = True
    
# Model configurations
MODEL_CONFIGS: Dict[AIModel, AIModelConfig] = {
    AIModel.GPT_4: AIModelConfig(
        name="GPT-4",
        model_id="gpt-4",
        max_tokens=8192,
        description="Most capable GPT-4 model, optimized for complex tasks",
    ),
    AIModel.GPT_4_TURBO: AIModelConfig(
        name="GPT-4 Turbo",
        model_id="gpt-4-turbo-preview",
        max_tokens=128000,
        description="Latest GPT-4 model with improved capabilities and 128k context",
    ),
    AIModel.GPT_3_5_TURBO: AIModelConfig(
        name="GPT-3.5 Turbo",
        model_id="gpt-3.5-turbo",
        max_tokens=16385,
        description="Fast and capable model, good for most tasks",
    ),
    # Add new models here as they become available
    AIModel.GPT_5: AIModelConfig(
        name="GPT-5",
        model_id="gpt-5",
        max_tokens=128000,  # Update this based on actual specs
        description="Next generation model with advanced capabilities",
        available=False,  # Set to True when available
    ),
}

def get_model_config(model: AIModel) -> AIModelConfig:
    """Get configuration for a specific model."""
    return MODEL_CONFIGS[model]

def get_available_models() -> Dict[AIModel, AIModelConfig]:
    """Get all available models."""
    return {k: v for k, v in MODEL_CONFIGS.items() if v.available}

def get_default_model() -> AIModel:
    """Get the default model to use."""
    # Try to return the most advanced available model
    for model in [AIModel.GPT_5, AIModel.GPT_4_TURBO, AIModel.GPT_4, AIModel.GPT_3_5_TURBO]:
        if model in MODEL_CONFIGS and MODEL_CONFIGS[model].available:
            return model
    return AIModel.GPT_3_5_TURBO  # Fallback
