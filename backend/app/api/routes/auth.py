from fastapi import APIRouter, HTTPException, status

from app.schemas.auth import LoginRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest):
    """
    TODO:
    1. Find user by email.
    2. Verify password.
    3. Create JWT.
    4. Return token + user.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="TODO: implement POST /auth/login",
    )


@router.get("/me")
def me():
    """
    TODO:
    Use dependency get_current_user and return current user profile.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="TODO: implement GET /auth/me",
    )