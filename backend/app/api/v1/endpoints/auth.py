import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.api import deps
from app.db.models import User
from app.schemas.schemas import UserCreate, UserResponse, Token
from app.core.logging import logger

# --- Password hashing using a simple but consistent approach ---
# NOTE: For production, replace with passlib[bcrypt]:
#   from passlib.context import CryptContext
#   pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
#   hash_password = pwd_context.hash
#   verify_password = pwd_context.verify
import hashlib

def hash_password(password: str) -> str:
    """Hash password using SHA-256. Replace with bcrypt in production."""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against stored hash."""
    return hash_password(plain_password) == hashed_password

# ---------------------------------------------------------------------------------------------------

router = APIRouter()

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup_user(
    user_create: UserCreate,
    db: Session = Depends(deps.get_db)
) -> UserResponse:
    """
    Register a new user.
    """
    existing_user = db.exec(select(User).where(User.username == user_create.username)).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already registered")
    
    hashed_password = hash_password(user_create.password)
    new_user = User(
        id=str(uuid.uuid4()),   # Store as string UUID
        username=user_create.username,
        password_hash=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    logger.info(f"New user registered: {new_user.username} with ID {new_user.id}")
    return new_user

@router.post("/login", response_model=Token)
async def login_user(
    user_create: UserCreate,
    db: Session = Depends(deps.get_db)
) -> Token:
    """
    Log in an existing user and return a token with user information.
    """
    user = db.exec(select(User).where(User.username == user_create.username)).first()
    if not user or not verify_password(user_create.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")
    
    # NOTE: In production, generate a real JWT with python-jose or fastapi-users.
    access_token = f"token_{user.id}_{uuid.uuid4().hex[:8]}"
    logger.info(f"User logged in: {user.username} with ID {user.id}")
    return Token(
        access_token=access_token,
        token_type="bearer",
        user_id=str(user.id),
        username=user.username
    )
