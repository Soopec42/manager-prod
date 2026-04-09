from datetime import datetime, timedelta, timezone
from typing import Any

from jose import jwt
from passlib.context import CryptContext

from app.core.config import setting

ALGORITHM = "HS256"
password_context = CryptContext(schemes=["bcrypt"], deprecated = "auto")

def get_hash_password(password: str) -> str:
    return password_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return password_context.verify(plain_password, hashed_password)

def create_access_token(subject: str | int, expires_minutes: int | None = None) -> str:
    expire = datetime.now() + timedelta(
        minutes=expires_minutes or setting.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload: dict[str, Any] = {"sub": str(subject), "exp": expire}
    return jwt.encode(payload, setting.SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str) -> dict[str: Any]:
    return jwt.decode(token, setting.SECRET_KEY, algorithms=[ALGORITHM])