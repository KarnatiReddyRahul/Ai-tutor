import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any
from pydantic import BaseModel

# --- Question & Answer Schemas ---

class SessionQuestion(BaseModel):
    turn_number: int
    question_text: str

class AnswerSubmit(BaseModel):
    answer_text: str

class EvaluationResult(BaseModel):
    score: int
    correctness: str
    completeness: str
    depth: str
    missing_concepts: List[str]
    misconceptions: List[str]

class AnswerResponse(BaseModel):
    evaluation: EvaluationResult
    completed: bool
    next_question: Optional[SessionQuestion] = None

class TurnResponse(BaseModel):
    id: uuid.UUID
    turn_number: int
    question_text: str
    answer_text: Optional[str] = None
    score: Optional[float] = None
    correctness: Optional[str] = None
    completeness: Optional[str] = None
    depth: Optional[str] = None
    missing_concepts: Optional[List[str]] = None
    misconceptions: Optional[List[str]] = None
    created_at: datetime

    class Config:
        from_attributes = True


# --- Session Schemas ---

class SessionCreate(BaseModel):
    user_id: str
    topic: str
    language: str
    provider: str
    model: str
    max_turns: Optional[int] = 5

class SessionResponse(BaseModel):
    id: uuid.UUID
    topic: str
    language: str
    provider: str
    model: str
    max_turns: int
    created_at: datetime
    completed_at: Optional[datetime] = None
    overall_score: Optional[float] = None
    first_question: Optional[SessionQuestion] = None

    class Config:
        from_attributes = True

class SessionDetailResponse(BaseModel):
    id: uuid.UUID
    topic: str
    language: str
    provider: str
    model: str
    max_turns: int
    created_at: datetime
    completed_at: Optional[datetime] = None
    overall_score: Optional[float] = None
    turns: List[TurnResponse] = []

    class Config:
        from_attributes = True


# --- Report Schemas ---

class RoadmapWeek(BaseModel):
    week: int
    title: str
    description: str

class ReportResponse(BaseModel):
    id: uuid.UUID
    session_id: uuid.UUID
    summary: str
    skill_xray: Dict[str, float]
    strengths: List[str]
    weak_areas: List[str]
    roadmap: List[RoadmapWeek]
    created_at: datetime

    class Config:
        from_attributes = True

# --- User Schemas ---

class UserCreate(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: str          # str to match User model (stored as string UUID)
    username: str
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: str     # Return user_id so frontend can store it
    username: str    # Return username for display
