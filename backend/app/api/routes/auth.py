from fastapi import APIRouter, HTTPException, status, Depends


from app.schemas.auth import LoginRequest, TokenResponse, UserPublic
from app.services.auth_service import get_user_by_email, verify_password, authenticate_user
from app.core.security import create_access_token
from app.db.base import DBSession
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: DBSession):

    user = authenticate_user(db, payload.email, payload.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    access_token = create_access_token(subject=user.email)

    return TokenResponse(
        access_token=access_token,
        user= UserPublic(
            id = user.id,
            full_name=user.full_name,
            email = user.email,
            role = user.role
        )
    )



@router.get("/me",response_model=UserPublic)
def me(user: UserPublic = Depends(get_current_user())):
    return user

    