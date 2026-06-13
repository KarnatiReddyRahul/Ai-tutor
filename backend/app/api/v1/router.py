from fastapi import APIRouter
from app.api.v1.endpoints import sessions, reports, assessments, auth

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(sessions.router, prefix="/sessions", tags=["sessions"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(assessments.router, prefix="/assessments", tags=["assessments"])
