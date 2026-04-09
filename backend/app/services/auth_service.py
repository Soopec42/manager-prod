# - get_user_by_email()
# - authenticate_user()
# - build_token_response()

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User
from app.core.security import get_hash_password, verify_password


def get_user_by_email(db: Session, email: str) -> User | None:
    stmt = select(User).where(User.email == email)
    return db.execute(stmt).scalar_one_or_none()

def create_user(
    db: Session,
    *, 
    full_name: str,
    email: str,
    password: str,
    role: str = "user" 
) -> User:
    user = User(
        full_name = full_name, 
        email = email, 
        hashed_password = get_hash_password(password),
         
        role = role
    )
    db.add(user)
    db.commit() 
    db.refresh(user)
    return user

def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = get_user_by_email(db, email)
    if user is None:
        return None
    
    if not verify_password(password, user.hashed_password):
        return None

    return user


def build_token_response(access_token: str) -> dict[str, str]:
    return {
        "access_token": access_token,
        "token_type": "bearer",
    }

