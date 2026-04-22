from fastapi import HTTPException, status, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select, or_, func

from app.db.base import DBSession
from app.schemas.ticket import TicketCreate, TicketDetail, TicketListResponse, TicketSummary
from app.models.ticket import Ticket
from app.models.user import User
from app.api.deps import get_current_user

# def validate_status_transittion(old_status, new_status):



def create_ticket(db: Session, payload: TicketCreate, current_user: User = Depends(get_current_user)) -> TicketDetail:

    if not payload.title.strip():
        raise ValueError("Title cannot be empty.")
    
    if not payload.customer_name.strip():
        raise ValueError("Customer name cannot be empty.")
    
    ticket = Ticket(
        title = payload.title.strip(),
        description = payload.description.strip(),
        customer_name = payload.customer_name,
        customer_email = payload.customer_email,
        priorety = payload.priority,
        due_at = payload.due_at
    )

    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    return ticket


def load_tikets(
    db: Session,
    page: int,
    page_size: int,
    status_filter: str | None = None,
    priority: str | None = None,
    search: str | None = None,
    user: User = Depends(get_current_user)
) -> TicketListResponse:
    
    if page < 1:
        raise ValueError("Page must be >= 1.")

    if page_size < 1:
        raise ValueError("Page size must be >= 1.")

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

        total = db.scalar(select(func.count()).select_from(query.subquery())) or 0

        query = (query.order_by(Ticket.created_at.desc()).offset((page-1) * page_size).limit(page_size))
        tickets = list(db.scalars(query).all())

        return TicketListResponse(
            items=[TicketSummary.model_validate(ticket) for ticket in tickets],
            total=total,
            page=page,
            page_size=page_size,
        )



