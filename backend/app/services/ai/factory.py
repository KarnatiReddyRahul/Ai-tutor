from typing import Optional
from app.core.config import settings
from app.services.ai.base import BaseLLMProvider
from app.services.ai.ollama import OllamaProvider
from app.services.ai.gemini import GeminiProvider
from app.services.ai.groq import GroqProvider

def get_provider(
    provider_name: str,
    model_name: str,
    gemini_key: Optional[str] = None,
    groq_key: Optional[str] = None
) -> BaseLLMProvider:
    provider_lower = provider_name.lower()
    
    if provider_lower == "ollama":
        return OllamaProvider(model=model_name, base_url=settings.OLLAMA_API_URL)
    elif provider_lower == "gemini":
        if not gemini_key:
            raise ValueError("Gemini API key is required.")
        return GeminiProvider(model=model_name, api_key=gemini_key)
    elif provider_lower == "groq":
        if not groq_key:
            raise ValueError("Groq API key is required.")
        return GroqProvider(model=model_name, api_key=groq_key)
    else:
        raise ValueError(f"Unknown AI provider: {provider_name}")
