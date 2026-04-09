import enum
from datetime import datetime

from sqlalchemy import String, Integer, Enum, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class UserRole(str, enum.Enum):
    customer = "customer"
    agent = "agent"
    manager = "manager"

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), index=True, nullable=False, index=True, unique=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_roles"),
        default=UserRole.customer,
        nullable= False
    )
    is_active: Mapped[bool | None] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    created_tickets = relationship("Ticket", back_populates="created_by", foreign_keys="Ticket.created_by_id")
    assigned_tickets = relationship("Ticket", back_populates="assignee", foreign_keys="Ticket.assignee_id")
    comments = relationship("Comment", back_populates="author")
