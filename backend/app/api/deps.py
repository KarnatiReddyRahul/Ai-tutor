from typing import Optional
from fastapi import Header
from app.core.database import get_db

async def get_groq_key(x_groq_api_key: Optional[str] = Header(default=None)) -> Optional[str]:
    return x_groq_api_key

async def get_gemini_key(x_gemini_api_key: Optional[str] = Header(default=None)) -> Optional[str]:
    return x_gemini_api_key

async def get_provider_name(x_provider: Optional[str] = Header(default="groq")) -> str:
    return (x_provider or "groq").lower()
