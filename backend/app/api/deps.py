from typing import Optional
from fastapi import Header
from app.core.database import get_db

async def get_groq_key(x_groq_api_key: Optional[str] = Header(default=None)) -> Optional[str]:
    return x_groq_api_key
