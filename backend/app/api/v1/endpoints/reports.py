import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.api import deps
from app.db.models import Report
from app.schemas.schemas import ReportResponse

router = APIRouter()

@router.get("/{session_id}", response_model=ReportResponse)
async def get_report_by_session(session_id: uuid.UUID, db: Session = Depends(deps.get_db)):
    """
    Fetches the generated diagnostic report (Skill X-Ray, Gaps, Roadmap) for a session.
    """
    statement = select(Report).where(Report.session_id == session_id)
    report_db = db.exec(statement).first()
    
    if not report_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Report not found. Session may not be completed or compiled yet."
        )
        
    return report_db
