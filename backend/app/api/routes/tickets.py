
from fastapi import APIRouter, Query, Depends, HTTPException, status
from sqlalchemy import select, or_
from sqlalchemy.orm import Session

from app.db.base import DBSession
from app.api.deps import get_current_user
from app.models.user import User
from app.models.ticket import Ticket
router = APIRouter(prefix="/tickets", tags=["Tickets"])

@router.get("")
def load_tikets(
    page: int = Query(default= 1, ge=1),
    page_size: int = Query(default=20, ge=1, le= 100),
    status_filter: str | None = Query(default=None, alias="status"),
    priority: str | None = Query(default=None),
    search: str | None = Query(default=None),
    db: Session = DBSession,
    user: User = Depends(get_current_user)
):
    query = select(Ticket)
    if user.role == "customer":
        query.where(Ticket.created_by_id == user.id)
    elif "agent" | "manager":
        pass
    else:
        raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions")

    if status_filter is not None:
        query = query.where(Ticket.status == status_filter)

    if priority is not None:
        query = query.where(Ticket.priority == priority)

    if search.strip():
        term = search.strip()
        pattern = f"{term}"

        search_condition = or_(
            Ticket.title.ilike(pattern),
            Ticket.description.ilike(pattern),
            Ticket.customer_name.ilike(pattern),
            Ticket.customer_email.ilike(pattern)
        )

        if term.isdigit():
            search_condition = or_(search_condition, Ticket.id == int(term))

        query = query.where(search_condition)







