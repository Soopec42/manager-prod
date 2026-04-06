import enum
from datetime import datetime

from sqlalchemy import String, Integer, Enum, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

class UserRole(str, enum.Enum):
    customer = "customer"
    agent = "agent"
    manager = "manager"

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), index=True, nullable=False, unique=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_roles"),
        default=UserRole.customer,
        nullable= False
    )
    is_active: Mapped[bool | None] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

