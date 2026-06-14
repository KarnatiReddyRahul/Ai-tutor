from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.api import deps
from app.services.ai import factory as ai_factory
from app.core.logging import logger

router = APIRouter()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    topic: str
    question: str
    history: List[ChatMessage] = []

class ChatResponse(BaseModel):
    answer: str

def _resolve_provider(
    provider_name: str,
    model_name: str,
    groq_key: Optional[str],
    gemini_key: Optional[str]
):
    return ai_factory.get_provider(
        provider_name=provider_name,
        model_name=model_name,
        groq_key=groq_key,
        gemini_key=gemini_key
    )

@router.post("/ask", response_model=ChatResponse)
async def chat_ask(
    payload: ChatRequest,
    provider_name: str = Depends(deps.get_provider_name),
    groq_key: Optional[str] = Depends(deps.get_groq_key),
    gemini_key: Optional[str] = Depends(deps.get_gemini_key)
):
    if provider_name == "groq" and not groq_key:
        raise HTTPException(status_code=400, detail="Groq API key is required")
    if provider_name == "gemini" and not gemini_key:
        raise HTTPException(status_code=400, detail="Gemini API key is required")

    try:
        model = "llama-3.1-8b-instant" if provider_name == "groq" else "gemini-1.5-flash"
        provider = _resolve_provider(provider_name, model, groq_key, gemini_key)

        system_prompt = (
            "You are a friendly, patient AI tutor. Your goal is to help the student understand concepts clearly. "
            "Use simple language, give real-world examples, and encourage questions. "
            "If the student is confused, break down the concept step by step. "
            "Be conversational and supportive — like a knowledgeable friend helping them learn.\n\n"
            f"Topic context: {payload.topic}\n"
            "Answer the student's question thoroughly but in simple terms."
        )

        messages = [{"role": "system", "content": system_prompt}]
        for msg in payload.history:
            messages.append({"role": msg.role, "content": msg.content})
        messages.append({"role": "user", "content": payload.question})

        response = await provider.generate_response(messages=messages, json_mode=False)
        return ChatResponse(answer=response.strip())

    except Exception as exc:
        logger.error(f"Chat request failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))
