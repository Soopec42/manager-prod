from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

security_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security_scheme),
):
    """
    TODO:
    1. Read the Bearer token.
    2. Decode JWT in core/security.py.
    3. Load user from DB by payload["sub"].
    4. Return current user object.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )

    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="TODO: implement get_current_user in app/api/deps.py",
    )


def require_manager_or_agent(user=Depends(get_current_user)):
    """
    TODO:
    Allow roles: manager, agent
    """
    return user


def require_manager(user=Depends(get_current_user)):
    """
    TODO:
    Allow only manager
    """
    return user