# Поля:
# - `id`
# - `ticket_id`
# - `author_id`
# - `body`
# - `is_internal`
# - `created_at`


from datetime import datetime
from sqlalchemy import Integer, ForeignKey, Text, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base

class Comment(Base):
    __tablename__ = "comments"

    id: Mapped[int] = mapped_column(Integer, index=True, primary_key=True)
    ticked_id: Mapped[int] = mapped_column(ForeignKey("tickets.id", ondelete="CASCADE"), nullable=False, index=True)
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    is_internal: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)



