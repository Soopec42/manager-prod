from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserPublic(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str

class TokenResponse(BaseModel): 
    access_token: str
    token_type: str = "bearer"
    user: UserPublic