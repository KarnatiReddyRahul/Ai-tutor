import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.api import deps
from app.core.logging import logger
from app.db.models import (
    LearningRoadmap, LearningModule, ChatMessage,
    SessionModel, SessionTurn, Report
)
from app.schemas.schemas import (
    GenerateRoadmapRequest, LearningRoadmapResponse,
    LearningModuleResponse, ModuleContentRequest,
    QuizSubmitRequest, LearningSearchRequest,
    LearningSearchResponse, LearningChatRequest, LearningChatResponse
)
from app.services.ai import factory as ai_factory
from app.services.ai.base import BaseLLMProvider
from app.services.learning_engine import LearningEngine

router = APIRouter()


def _resolve_provider(
    provider_name: str,
    model_name: str,
    groq_key: Optional[str],
    gemini_key: Optional[str]
) -> BaseLLMProvider:
    return ai_factory.get_provider(
        provider_name=provider_name,
        model_name=model_name,
        groq_key=groq_key,
        gemini_key=gemini_key
    )


@router.post("/roadmap/generate", response_model=LearningRoadmapResponse)
async def generate_roadmap(
    payload: GenerateRoadmapRequest,
    db: Session = Depends(deps.get_db),
    provider_name: str = Depends(deps.get_provider_name),
    groq_key: Optional[str] = Depends(deps.get_groq_key),
    gemini_key: Optional[str] = Depends(deps.get_gemini_key)
):
    session_db = db.get(SessionModel, payload.session_id)
    if not session_db:
        raise HTTPException(status_code=404, detail="Session not found")
    if not session_db.completed_at:
        raise HTTPException(status_code=400, detail="Assessment not completed yet")

    report = db.exec(select(Report).where(Report.session_id == payload.session_id)).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    existing = db.exec(select(LearningRoadmap).where(LearningRoadmap.session_id == payload.session_id)).first()
    if existing:
        return existing

    turns_sorted = sorted(session_db.turns, key=lambda t: t.turn_number)
    model = session_db.model if session_db.model else "llama-3.1-8b-instant"
    provider = _resolve_provider(provider_name, model, groq_key, gemini_key)

    roadmap_data = await LearningEngine.generate_roadmap(
        provider=provider, report=report, session=session_db, turns=turns_sorted
    )

    roadmap_db = LearningRoadmap(
        id=uuid.uuid4(),
        session_id=payload.session_id,
        user_id=session_db.user_id,
        topic=session_db.topic,
        language=payload.language,
        weak_areas=report.weak_areas,
        strengths=report.strengths,
        overall_score=session_db.overall_score or 0.0
    )
    db.add(roadmap_db)
    db.flush()

    modules_data = roadmap_data.get("modules", [])
    for i, mod_data in enumerate(modules_data):
        difficulty = mod_data.get("difficulty", "beginner")
        if difficulty not in ("beginner", "intermediate", "advanced"):
            difficulty = "beginner"
        week_number = mod_data.get("week_number", i + 1)
        module_db = LearningModule(
            id=uuid.uuid4(),
            roadmap_id=roadmap_db.id,
            week_number=week_number,
            title=mod_data.get("title", f"Week {week_number}"),
            description=mod_data.get("description", ""),
            focus_area=mod_data.get("focus_area", ""),
            difficulty=difficulty,
            status="available" if i == 0 else "locked"
        )
        db.add(module_db)

    db.commit()
    db.refresh(roadmap_db)
    return roadmap_db


@router.get("/roadmap/{session_id}", response_model=LearningRoadmapResponse)
async def get_roadmap(session_id: uuid.UUID, db: Session = Depends(deps.get_db)):
    roadmap = db.exec(select(LearningRoadmap).where(LearningRoadmap.session_id == session_id)).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found. Generate one first.")
    return roadmap


@router.post("/module/generate-content", response_model=LearningModuleResponse)
async def generate_module_content(
    payload: ModuleContentRequest,
    db: Session = Depends(deps.get_db),
    provider_name: str = Depends(deps.get_provider_name),
    groq_key: Optional[str] = Depends(deps.get_groq_key),
    gemini_key: Optional[str] = Depends(deps.get_gemini_key)
):
    module_db = db.get(LearningModule, payload.module_id)
    if not module_db:
        raise HTTPException(status_code=404, detail="Module not found")

    if module_db.concept_explanation and module_db.quiz_questions:
        return module_db

    roadmap = db.get(LearningRoadmap, module_db.roadmap_id)
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")

    model = "llama-3.1-8b-instant" if provider_name == "groq" else "gemini-1.5-flash"
    provider = _resolve_provider(provider_name, model, groq_key, gemini_key)
    content = await LearningEngine.generate_module_content(
        provider=provider, module=module_db, topic=roadmap.topic, language=roadmap.language
    )

    module_db.concept_explanation = content["concept_explanation"]
    module_db.examples = content["examples"]
    module_db.practice_exercises = content["practice_exercises"]
    module_db.quiz_questions = content["quiz_questions"]
    module_db.revision_notes = content["revision_notes"]
    module_db.status = "available"
    db.add(module_db)
    db.commit()
    db.refresh(module_db)
    return module_db


@router.post("/module/{module_id}/complete", response_model=LearningModuleResponse)
async def complete_module(module_id: uuid.UUID, db: Session = Depends(deps.get_db)):
    module_db = db.get(LearningModule, module_id)
    if not module_db:
        raise HTTPException(status_code=404, detail="Module not found")

    module_db.status = "completed"
    module_db.completed_at = datetime.utcnow()
    db.add(module_db)

    roadmap = db.get(LearningRoadmap, module_db.roadmap_id)
    if roadmap:
        next_modules = db.exec(
            select(LearningModule)
            .where(LearningModule.roadmap_id == roadmap.id)
            .where(LearningModule.week_number == module_db.week_number + 1)
        ).all()
        for nm in next_modules:
            nm.status = "available"
            db.add(nm)

    db.commit()
    db.refresh(module_db)
    return module_db


@router.post("/quiz/submit", response_model=LearningModuleResponse)
async def submit_quiz(
    payload: QuizSubmitRequest,
    db: Session = Depends(deps.get_db),
    provider_name: str = Depends(deps.get_provider_name),
    groq_key: Optional[str] = Depends(deps.get_groq_key),
    gemini_key: Optional[str] = Depends(deps.get_gemini_key)
):
    module_db = db.get(LearningModule, payload.module_id)
    if not module_db:
        raise HTTPException(status_code=404, detail="Module not found")

    module_db.quiz_score = payload.score
    db.add(module_db)

    if payload.score < 70:
        roadmap = db.get(LearningRoadmap, module_db.roadmap_id)
        if roadmap:
            model = "llama-3.1-8b-instant" if provider_name == "groq" else "gemini-1.5-flash"
            provider = _resolve_provider(provider_name, model, groq_key, gemini_key)
            revision = await LearningEngine.generate_revision_content(
                provider=provider, module=module_db, topic=roadmap.topic, language=roadmap.language
            )
            module_db.concept_explanation = revision["concept_explanation"]
            module_db.examples = revision["examples"]
            module_db.practice_exercises = revision["practice_exercises"]
            module_db.quiz_questions = revision["quiz_questions"]
            module_db.revision_notes = revision["revision_notes"]
            module_db.status = "available"
            db.add(module_db)

    db.commit()
    db.refresh(module_db)
    return module_db


@router.post("/search", response_model=LearningSearchResponse)
async def search_concept(
    payload: LearningSearchRequest,
    provider_name: str = Depends(deps.get_provider_name),
    groq_key: Optional[str] = Depends(deps.get_groq_key),
    gemini_key: Optional[str] = Depends(deps.get_gemini_key)
):
    if provider_name == "groq" and not groq_key:
        raise HTTPException(status_code=400, detail="Groq API key is required")
    if provider_name == "gemini" and not gemini_key:
        raise HTTPException(status_code=400, detail="Gemini API key is required")

    model = "llama-3.1-8b-instant" if provider_name == "groq" else "gemini-1.5-flash"
    provider = _resolve_provider(provider_name, model, groq_key, gemini_key)
    result = await LearningEngine.search_concept(
        provider=provider,
        query=payload.query,
        topic=payload.topic,
        difficulty=payload.difficulty,
        language=payload.language
    )
    return LearningSearchResponse(**result)


@router.post("/chat", response_model=LearningChatResponse)
async def learning_chat(
    payload: LearningChatRequest,
    db: Session = Depends(deps.get_db),
    provider_name: str = Depends(deps.get_provider_name),
    groq_key: Optional[str] = Depends(deps.get_groq_key),
    gemini_key: Optional[str] = Depends(deps.get_gemini_key)
):
    if provider_name == "groq" and not groq_key:
        raise HTTPException(status_code=400, detail="Groq API key is required")
    if provider_name == "gemini" and not gemini_key:
        raise HTTPException(status_code=400, detail="Gemini API key is required")

    roadmap = db.get(LearningRoadmap, payload.roadmap_id)
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")

    module_title = ""
    focus_area = ""
    if payload.module_id:
        module = db.get(LearningModule, payload.module_id)
        if module:
            module_title = module.title
            focus_area = module.focus_area

    model = "llama-3.1-8b-instant" if provider_name == "groq" else "gemini-1.5-flash"
    provider = _resolve_provider(provider_name, model, groq_key, gemini_key)
    answer = await LearningEngine.chat_with_context(
        provider=provider,
        question=payload.question,
        history=payload.history,
        topic=roadmap.topic,
        focus_area=focus_area,
        module_title=module_title,
        weak_areas=roadmap.weak_areas,
        strengths=roadmap.strengths,
        overall_score=roadmap.overall_score,
        language=roadmap.language
    )

    msg_user = ChatMessage(
        id=uuid.uuid4(), session_id=payload.session_id,
        roadmap_id=payload.roadmap_id, module_id=payload.module_id,
        role="user", content=payload.question, context_type="chat"
    )
    msg_assistant = ChatMessage(
        id=uuid.uuid4(), session_id=payload.session_id,
        roadmap_id=payload.roadmap_id, module_id=payload.module_id,
        role="assistant", content=answer, context_type="chat"
    )
    db.add(msg_user)
    db.add(msg_assistant)
    db.commit()

    return LearningChatResponse(answer=answer)


@router.get("/progress/{session_id}")
async def get_progress(session_id: uuid.UUID, db: Session = Depends(deps.get_db)):
    roadmap = db.exec(select(LearningRoadmap).where(LearningRoadmap.session_id == session_id)).first()
    if not roadmap:
        return {"exists": False, "message": "No roadmap generated yet"}

    modules = db.exec(
        select(LearningModule).where(LearningModule.roadmap_id == roadmap.id)
        .order_by(LearningModule.week_number)
    ).all()

    total = len(modules)
    completed = sum(1 for m in modules if m.status == "completed")
    available = sum(1 for m in modules if m.status == "available")
    avg_quiz = sum(m.quiz_score or 0 for m in modules if m.quiz_score is not None)
    quiz_count = sum(1 for m in modules if m.quiz_score is not None)
    avg_quiz_score = round(avg_quiz / quiz_count, 1) if quiz_count > 0 else None

    return {
        "exists": True,
        "total_modules": total,
        "completed_modules": completed,
        "available_modules": available,
        "progress_percent": round((completed / total) * 100, 1) if total > 0 else 0,
        "average_quiz_score": avg_quiz_score,
        "modules": [
            {
                "id": str(m.id),
                "week_number": m.week_number,
                "title": m.title,
                "status": m.status,
                "quiz_score": m.quiz_score,
                "completed_at": m.completed_at.isoformat() if m.completed_at else None
            }
            for m in modules
        ]
    }
