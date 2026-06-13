from sqlmodel import create_engine, Session, SQLModel
from app.core.config import settings

# SQLite connection args for multi-threaded FastAPI execution
connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    echo=False,
    connect_args=connect_args
)

def init_db() -> None:
    # Import models here so that they are registered in SQLModel.metadata
    from app.db.models import User, SessionModel, SessionTurn, Report
    SQLModel.metadata.create_all(engine)

def get_db():
    with Session(engine) as session:
        yield session
