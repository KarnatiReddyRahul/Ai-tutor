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
