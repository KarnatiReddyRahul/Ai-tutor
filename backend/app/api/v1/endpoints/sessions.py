import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.api import deps
from app.core.logging import logger
from app.db.models import SessionModel, SessionTurn, Report
from app.schemas.schemas import (
    AnswerResponse,
    AnswerSubmit,
    EvaluationResult,
    SessionCreate,
    SessionDetailResponse,
    SessionQuestion,
    SessionResponse,
)
from app.services.ai import factory as ai_factory
from app.services.evaluation_engine import EvaluationEngine
from app.services.question_engine import QuestionEngine
from app.services.report_engine import ReportEngine

router = APIRouter()

@router.post("/", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(
    payload: SessionCreate,
    db: Session = Depends(deps.get_db),
    groq_key: Optional[str] = Depends(deps.get_groq_key),
    gemini_key: Optional[str] = Depends(deps.get_gemini_key)
):
    """
    Initializes a reverse tutoring session, generates the initial question, and persists to SQLite.
    """
    try:
        # Resolve LLM provider
        provider = ai_factory.get_provider(
            provider_name=payload.provider,
            model_name=payload.model,
            groq_key=groq_key,
            gemini_key=gemini_key
        )

        logger.info(f"Generating initial question for topic: {payload.topic}")
        
        # Generate initial question
        initial_question_text = await QuestionEngine.generate_next_question(
            provider=provider,
            topic=payload.topic,
            language=payload.language,
            turns=[]
        )

        # Create session record
        session_id = uuid.uuid4()
        session_db = SessionModel(
            id=session_id,
            user_id=payload.user_id,   # Fixed: was missing user_id
            topic=payload.topic,
            language=payload.language,
            provider=payload.provider,
            model=payload.model,
            max_turns=payload.max_turns or 5
        )
        db.add(session_db)

        # Create first turn record
        turn_db = SessionTurn(
            id=uuid.uuid4(),
            session_id=session_id,
            turn_number=1,
            question_text=initial_question_text
        )
        db.add(turn_db)
        
        db.commit()
        db.refresh(session_db)

        # Build response with first question embedded
        response = SessionResponse.model_validate(session_db)
        response.first_question = SessionQuestion(
            turn_number=1,
            question_text=initial_question_text
        )
        return response

    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except Exception as exc:
        logger.error(f"Failed to create session: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initialize session: {str(exc)}"
        )


@router.post("/{session_id}/answer", response_model=AnswerResponse)
async def submit_answer(
    session_id: uuid.UUID,
    payload: AnswerSubmit,
    db: Session = Depends(deps.get_db),
    groq_key: Optional[str] = Depends(deps.get_groq_key),
    gemini_key: Optional[str] = Depends(deps.get_gemini_key)
):
    """
    Submits a student's answer.
    1. Evaluates correctness and depth.
    2. Updates current turn records.
    3. Either generates the next adaptive question or triggers final report compiling.
    """
    # Find session
    session_db = db.get(SessionModel, session_id)
    if not session_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    
    if session_db.completed_at:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Session already completed")

    # Find the current turn (where answer_text is None)
    turns_sorted = sorted(session_db.turns, key=lambda t: t.turn_number)
    current_turn = next((t for t in turns_sorted if t.answer_text is None), None)
    
    if not current_turn:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="No active question found to answer. Session may be corrupted or finished."
        )

    try:
        # Resolve LLM provider
        provider = ai_factory.get_provider(
            provider_name=session_db.provider,
            model_name=session_db.model,
            groq_key=groq_key,
            gemini_key=gemini_key
        )

        logger.info(f"Evaluating answer for session {session_id}, turn {current_turn.turn_number}")
        
        # Evaluate current answer
        evaluation = await EvaluationEngine.evaluate_answer(
            provider=provider,
            topic=session_db.topic,
            language=session_db.language,
            question=current_turn.question_text,
            answer=payload.answer_text
        )

        # Update the current turn
        current_turn.answer_text = payload.answer_text
        current_turn.score = float(evaluation.score)
        current_turn.correctness = evaluation.correctness
        current_turn.completeness = evaluation.completeness
        current_turn.depth = evaluation.depth
        current_turn.missing_concepts = evaluation.missing_concepts
        current_turn.misconceptions = evaluation.misconceptions
        db.add(current_turn)
        db.commit()

        # Check if session is completed (reached max turns)
        is_completed = current_turn.turn_number >= session_db.max_turns
        
        next_question = None
        if is_completed:
            logger.info(f"Session {session_id} completed. Compiling final report.")
            
            # Refresh turns inside session
            db.refresh(session_db)
            turns_all = sorted(session_db.turns, key=lambda t: t.turn_number)
            
            # Generate Report
            report_data = await ReportEngine.generate_report(
                provider=provider,
                topic=session_db.topic,
                language=session_db.language,
                turns=turns_all
            )

            # Save report
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

            # Update Session as Completed
            session_db.completed_at = datetime.utcnow()
            scores = [t.score for t in turns_all if t.score is not None]
            session_db.overall_score = sum(scores) / len(scores) if scores else 0.0
            
            db.add(session_db)
            db.commit()
        else:
            # Generate next question
            logger.info(f"Generating next question for session {session_id}, turn {current_turn.turn_number + 1}")
            db.refresh(session_db)
            turns_completed = sorted(session_db.turns, key=lambda t: t.turn_number)
            
            next_question_text = await QuestionEngine.generate_next_question(
                provider=provider,
                topic=session_db.topic,
                language=session_db.language,
                turns=turns_completed
            )

            # Create next turn
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
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing answer submission: {str(exc)}"
        )


@router.post("/{session_id}/complete", response_model=SessionDetailResponse)
async def complete_session_early(
    session_id: uuid.UUID,
    db: Session = Depends(deps.get_db),
    groq_key: Optional[str] = Depends(deps.get_groq_key),
    gemini_key: Optional[str] = Depends(deps.get_gemini_key)
):
    """
    Concludes the session early. Aggregates answered questions, compiles the final report.
    """
    session_db = db.get(SessionModel, session_id)
    if not session_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    
    if session_db.completed_at:
        return session_db

    turns_answered = sorted([t for t in session_db.turns if t.answer_text is not None], key=lambda t: t.turn_number)
    
    empty_turn = next((t for t in session_db.turns if t.answer_text is None), None)
    if empty_turn:
        db.delete(empty_turn)
        db.commit()
        db.refresh(session_db)
        turns_answered = sorted([t for t in session_db.turns if t.answer_text is not None], key=lambda t: t.turn_number)

    if not turns_answered:
        session_db.completed_at = datetime.utcnow()
        session_db.overall_score = 0.0
        
        report_db = Report(
            id=uuid.uuid4(),
            session_id=session_id,
            summary="Session was completed early without answers.",
            skill_xray={},
            strengths=[],
            weak_areas=[],
            roadmap=[]
        )
        db.add(report_db)
        db.add(session_db)
        db.commit()
        db.refresh(session_db)
        return session_db

    try:
        provider = ai_factory.get_provider(
            provider_name=session_db.provider,
            model_name=session_db.model,
            groq_key=groq_key,
            gemini_key=gemini_key
        )

        logger.info(f"Generating early exit report for session {session_id}")
        
        report_data = await ReportEngine.generate_report(
            provider=provider,
            topic=session_db.topic,
            language=session_db.language,
            turns=turns_answered
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
        scores = [t.score for t in turns_answered if t.score is not None]
        session_db.overall_score = sum(scores) / len(scores) if scores else 0.0
        
        db.add(session_db)
        db.commit()
        db.refresh(session_db)
        
        return session_db

    except Exception as exc:
        logger.error(f"Failed to complete session early: {exc}", exc_info=True)
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error completing session early: {str(exc)}"
        )


@router.get("/", response_model=List[SessionResponse])
async def list_sessions(db: Session = Depends(deps.get_db)):
    """
    Returns history list of all sessions.
    """
    statement = select(SessionModel).order_by(SessionModel.created_at.desc())
    sessions_db = db.exec(statement).all()
    return sessions_db


@router.get("/{session_id}", response_model=SessionDetailResponse)
async def get_session_detail(session_id: uuid.UUID, db: Session = Depends(deps.get_db)):
    """
    Returns detailed configuration, questions, answers, and scores for a specific session.
    """
    session_db = db.get(SessionModel, session_id)
    if not session_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return session_db
