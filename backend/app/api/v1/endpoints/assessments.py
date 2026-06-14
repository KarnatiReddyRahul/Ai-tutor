import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.api import deps
from app.core.logging import logger
from app.db.models import SessionModel, SessionTurn, Report
from app.schemas.schemas import (
    SessionCreate,
    SessionResponse,
    AnswerSubmit,
    AnswerResponse,
    ReportResponse,
    SessionDetailResponse,
    SessionQuestion,
    EvaluationResult
)
from app.services.ai import factory as ai_factory
from app.services.evaluation_engine import EvaluationEngine
from app.services.question_engine import QuestionEngine
from app.services.report_engine import ReportEngine
from datetime import datetime

router = APIRouter()

@router.post("/start", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def start_assessment(
    payload: SessionCreate,
    db: Session = Depends(deps.get_db),
    groq_key: Optional[str] = Depends(deps.get_groq_key),
    gemini_key: Optional[str] = Depends(deps.get_gemini_key)
) -> SessionResponse:
    try:
        provider = ai_factory.get_provider(
            provider_name=payload.provider,
            model_name=payload.model,
            groq_key=groq_key,
            gemini_key=gemini_key
        )
        logger.info(f"Assessment start: Generating initial question for topic: {payload.topic}")

        initial_question_text = await QuestionEngine.generate_next_question(
            provider=provider,
            topic=payload.topic,
            language=payload.language,
            turns=[]
        )

        session_id = uuid.uuid4()
        session_db = SessionModel(
            id=session_id,
            user_id=payload.user_id,
            topic=payload.topic,
            language=payload.language,
            provider=payload.provider,
            model=payload.model,
            max_turns=payload.max_turns or 5
        )
        db.add(session_db)

        turn_db = SessionTurn(
            id=uuid.uuid4(),
            session_id=session_id,
            turn_number=1,
            question_text=initial_question_text
        )
        db.add(turn_db)
        
        db.commit()
        db.refresh(session_db)

        response = SessionResponse.model_validate(session_db)
        response.first_question = SessionQuestion(
            turn_number=1,
            question_text=initial_question_text
        )
        return response

    except ValueError as exc:
        logger.warning(f"Failed to start assessment due to invalid provider/model: {exc}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except Exception as exc:
        logger.error(f"Failed to start assessment: {exc}", exc_info=True)
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initialize assessment: {str(exc)}"
        )

@router.post("/{session_id}/evaluate", response_model=AnswerResponse)
async def evaluate_assessment_answer(
    session_id: uuid.UUID,
    payload: AnswerSubmit,
    db: Session = Depends(deps.get_db),
    groq_key: Optional[str] = Depends(deps.get_groq_key),
    gemini_key: Optional[str] = Depends(deps.get_gemini_key)
) -> AnswerResponse:
    session_db = db.get(SessionModel, session_id)
    if not session_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment session not found")
    
    if session_db.completed_at:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Assessment session already completed")

    turns_sorted = sorted(session_db.turns, key=lambda t: t.turn_number)
    current_turn = next((t for t in turns_sorted if t.answer_text is None), None)
    
    if not current_turn:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No active question found to answer.")

    try:
        provider = ai_factory.get_provider(
            provider_name=session_db.provider,
            model_name=session_db.model,
            groq_key=groq_key,
            gemini_key=gemini_key
        )
        
        evaluation = await EvaluationEngine.evaluate_answer(
            provider=provider,
            topic=session_db.topic,
            language=session_db.language,
            question=current_turn.question_text,
            answer=payload.answer_text
        )

        current_turn.answer_text = payload.answer_text
        current_turn.score = float(evaluation.score)
        current_turn.correctness = evaluation.correctness
        current_turn.completeness = evaluation.completeness
        current_turn.depth = evaluation.depth
        current_turn.missing_concepts = evaluation.missing_concepts
        current_turn.misconceptions = evaluation.misconceptions
        db.add(current_turn)
        db.commit()

        is_completed = current_turn.turn_number >= session_db.max_turns
        next_question = None

        if is_completed:
            db.refresh(session_db)
            turns_all = sorted(session_db.turns, key=lambda t: t.turn_number)
            
            report_data = await ReportEngine.generate_report(
                provider=provider,
                topic=session_db.topic,
                language=session_db.language,
                turns=turns_all
            )

            report_db = Report(
                id=uuid.uuid4(),
                session_id=session_id,
                summary=report_data["summary"],
                skill_xray=report_data["skill_xray"],
                strengths=report_data["strengths"],
                weak_areas=report_data["weak_areas"],
                roadmap=report_data["roadmap"]
            )
            db.add(report_db)

            session_db.completed_at = datetime.utcnow()
            scores = [t.score for t in turns_all if t.score is not None]
            session_db.overall_score = sum(scores) / len(scores) if scores else 0.0
            
            db.add(session_db)
            db.commit()
        else:
            db.refresh(session_db)
            turns_completed = sorted(session_db.turns, key=lambda t: t.turn_number)
            
            next_question_text = await QuestionEngine.generate_next_question(
                provider=provider,
                topic=session_db.topic,
                language=session_db.language,
                turns=turns_completed
            )

            next_turn_db = SessionTurn(
                id=uuid.uuid4(),
                session_id=session_id,
                turn_number=current_turn.turn_number + 1,
                question_text=next_question_text
            )
            db.add(next_turn_db)
            db.commit()

            next_question = SessionQuestion(
                turn_number=next_turn_db.turn_number,
                question_text=next_question_text
            )

        return AnswerResponse(
            evaluation=evaluation,
            completed=is_completed,
            next_question=next_question
        )

    except Exception as exc:
        logger.error(f"Failed to process answer submission: {exc}", exc_info=True)
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))

@router.get("/{session_id}/results", response_model=ReportResponse)
async def get_assessment_results(
    session_id: uuid.UUID, 
    db: Session = Depends(deps.get_db)
) -> ReportResponse:
    session_db = db.get(SessionModel, session_id)
    if not session_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment session not found.")

    if not session_db.completed_at:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Assessment session not yet completed.")

    statement = select(Report).where(Report.session_id == session_id)
    report_db = db.exec(statement).first()
    
    if not report_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")
        
    return report_db
