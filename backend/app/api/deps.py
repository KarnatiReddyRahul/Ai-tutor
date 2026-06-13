from typing import Optional
from fastapi import Header
from app.core.database import get_db

async def get_gemini_key(x_gemini_api_key: Optional[str] = Header(default=None)) -> Optional[str]:
    """
    Retrieves Gemini API Key from request headers
    """
    return x_gemini_api_key

async def get_groq_key(x_groq_api_key: Optional[str] = Header(default=None)) -> Optional[str]:
    """
    Retrieves Groq API Key from request headers
    """
    return x_groq_api_key
