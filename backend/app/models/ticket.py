import enum
from datetime import datetime

from sqlalchemy import String, Integer, Enum, DateTime, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

class Statuses(str, enum.Enum):
    new = "new"
    in_progress = "in_progress"
    waiting_customer = "waiting_customer"
    resolved = "resolved"

class prioritets(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"

class Ticket(Base):
    __tablename__ = "tickets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(256), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[Statuses] = mapped_column(
        Enum(Statuses, name="status"),
        default=Statuses.new,
        nullable= False
    )
    priority: Mapped[prioritets] = mapped_column(
        Enum(prioritets, name="priority"),
        default=prioritets.medium,
        nullable= False
    )
    customer_name: Mapped[str] = mapped_column(String(255), nullable=False)
    customer_email: Mapped[str] = mapped_column(String(255), nullable=False)

    created_by_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    assignee_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    due_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)



