from typing import Optional
from app.core.config import settings
from app.services.ai.base import BaseLLMProvider
from app.services.ai.groq import GroqProvider
from app.services.ai.gemini import GeminiProvider

def get_provider(
    provider_name: str,
    model_name: str,
    gemini_key: Optional[str] = None,
    groq_key: Optional[str] = None
) -> BaseLLMProvider:
    provider_lower = provider_name.lower()
    
    if provider_lower == "groq":
        if not groq_key:
            raise ValueError("Groq API key is required.")
        return GroqProvider(model=model_name, api_key=groq_key)
    elif provider_lower == "gemini":
        if not gemini_key:
            raise ValueError("Gemini API key is required.")
        return GeminiProvider(model=model_name, api_key=gemini_key)
    else:
        raise ValueError(f"Unsupported AI provider: {provider_name}")
