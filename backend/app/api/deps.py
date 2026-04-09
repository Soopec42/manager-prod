from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.orm import Session

from app.services.auth_service import get_user_by_email
from app.core.security import decode_access_token
from app.db.base import get_db
from app.models.user import User
security_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security_scheme), db: Session = Depends(get_db)
) -> User:
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    # 1. Read the Bearer token.
    # 2. Decode JWT in core/security.py.
    # 3. Load user from DB by payload["sub"].
    # 4. Return current user object.

    if credentials is None:
        raise credentials_exception
    
    if credentials.schema.lower() != "bearer":
        raise credentials_exception

    try:
        payload = decode_access_token(credentials)
    except JWTError:
        raise credentials_exception

    subject = payload.get("sub")
    if subject is None:
        raise credentials_exception
    
    user = get_user_by_email(db, subject)
    if user is None:
        raise credentials_exception

    return user


def require_manager_or_agent(
    user: User = Depends(get_current_user),
) -> User:
    if user.role not in {"manager", "agent"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    return user


def require_manager(
    user: User = Depends(get_current_user),
) -> User:
    if user.role != "manager":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    return user