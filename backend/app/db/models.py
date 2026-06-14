import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from sqlalchemy import Column, JSON
from sqlmodel import Field, Relationship, SQLModel

class User(SQLModel, table=True):
    __tablename__ = "users"
    
    id: str = Field(primary_key=True, index=True) 
    username: str = Field(unique=True, index=True)
    password_hash: str  # In production, use real hashing

class SessionModel(SQLModel, table=True):
    __tablename__ = "sessions"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    topic: str
    language: str
    provider: str
    model: str
    max_turns: int = Field(default=5)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = Field(default=None)
    overall_score: Optional[float] = Field(default=None)
    
    # Relationships
    turns: List["SessionTurn"] = Relationship(
        back_populates="session", 
        sa_relationship_kwargs={"cascade": "all, delete-orphan", "lazy": "selectin"}
    )
    report: Optional["Report"] = Relationship(
        back_populates="session", 
        sa_relationship_kwargs={"cascade": "all, delete-orphan", "lazy": "selectin"}
    )
    user: User = Relationship() # Link back to User


class SessionTurn(SQLModel, table=True):
    __tablename__ = "session_turns"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    session_id: uuid.UUID = Field(foreign_key="sessions.id")
    turn_number: int
    question_text: str
    answer_text: Optional[str] = Field(default=None)
    score: Optional[float] = Field(default=None)
    correctness: Optional[str] = Field(default=None)
    completeness: Optional[str] = Field(default=None)
    depth: Optional[str] = Field(default=None)
    
    # JSON columns for arrays
    missing_concepts: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    misconceptions: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    session: SessionModel = Relationship(back_populates="turns")


class Report(SQLModel, table=True):
    __tablename__ = "reports"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    session_id: uuid.UUID = Field(foreign_key="sessions.id", unique=True)
    summary: str
    
    # JSON columns for nested maps, arrays
    skill_xray: Dict[str, float] = Field(sa_column=Column(JSON))
    strengths: List[str] = Field(sa_column=Column(JSON))
    weak_areas: List[str] = Field(sa_column=Column(JSON))
    roadmap: List[Dict[str, Any]] = Field(sa_column=Column(JSON))
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    session: SessionModel = Relationship(back_populates="report")


class LearningRoadmap(SQLModel, table=True):
    __tablename__ = "learning_roadmaps"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    session_id: uuid.UUID = Field(foreign_key="sessions.id", unique=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    topic: str
    language: str
    weak_areas: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    strengths: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    overall_score: float = Field(default=0.0)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    modules: List["LearningModule"] = Relationship(
        back_populates="roadmap",
        sa_relationship_kwargs={"cascade": "all, delete-orphan", "lazy": "selectin"}
    )


class LearningModule(SQLModel, table=True):
    __tablename__ = "learning_modules"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    roadmap_id: uuid.UUID = Field(foreign_key="learning_roadmaps.id")
    week_number: int
    title: str
    description: str
    focus_area: str = Field(default="")
    difficulty: str = Field(default="beginner")
    status: str = Field(default="locked")
    quiz_score: Optional[float] = Field(default=None)
    completed_at: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    concept_explanation: Optional[str] = Field(default=None)
    examples: Optional[str] = Field(default=None)
    practice_exercises: Optional[str] = Field(default=None)
    quiz_questions: Optional[str] = Field(default=None)
    revision_notes: Optional[str] = Field(default=None)

    roadmap: LearningRoadmap = Relationship(back_populates="modules")


class ChatMessage(SQLModel, table=True):
    __tablename__ = "chat_messages"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    session_id: uuid.UUID = Field(foreign_key="sessions.id", index=True)
    roadmap_id: Optional[uuid.UUID] = Field(default=None, foreign_key="learning_roadmaps.id")
    module_id: Optional[uuid.UUID] = Field(default=None, foreign_key="learning_modules.id")
    role: str
    content: str
    context_type: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
