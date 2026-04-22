
from fastapi import APIRouter, Query, Depends, HTTPException, status
from sqlalchemy import select, or_
from sqlalchemy.orm import Session

from app.db.base import DBSession
from app.api.deps import get_current_user
from app.models.user import User
from app.models.ticket import Ticket
from app.services.ticket_service import load_tikets, create_ticket
from app.schemas.ticket import TicketListResponse, TicketCreate, TicketDetail
router = APIRouter(prefix="/tickets", tags=["Tickets"])

@router.get("", response_model=TicketListResponse)
def list_tikets(
    page: int = Query(default= 1, ge=1),
    page_size: int = Query(default=20, ge=1, le= 100),
    status_filter: str | None = Query(default=None, alias="status"),
    priority: str | None = Query(default=None),
    search: str | None = Query(default=None),
    db: Session = DBSession,
):
    return load_tikets(
        db = db, 
        page = page,
        page_size = page_size,
        status_filter= status_filter,
        priority=priority,
        search=search    
    )


@router.post("", response_model=TicketDetail)
def create_ticket(payload: TicketCreate, db: Session = DBSession):
    return create_ticket(payload=payload, db = db)


@router.get("/{ticket_id}")
def get_ticket(ticket_id: int):
    """
    TODO:
    1. Load ticket by id.
    2. Check access.
    3. Return TicketDetail.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="TODO: implement GET /tickets/{ticket_id}",
    )


@router.patch("/{ticket_id}")
def update_ticket(ticket_id: int, payload: TicketUpdate):
    """
    TODO:
    1. Load ticket.
    2. Validate status transition.
    3. Update status/priority.
    4. Save and return updated ticket.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="TODO: implement PATCH /tickets/{ticket_id}",
    )


@router.post("/{ticket_id}/assign")
def assign_ticket(ticket_id: int, payload: AssignTicketRequest):
    """
    TODO:
    1. Allow only manager.
    2. Load ticket.
    3. Load agent by payload.assignee_id.
    4. Set assignee_id.
    5. Return {"message": "Ticket assigned successfully"}
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="TODO: implement POST /tickets/{ticket_id}/assign",
    )


@router.get("/{ticket_id}/comments")
def list_comments(ticket_id: int):
    """
    TODO:
    1. Load ticket.
    2. Load comments by ticket_id.
    3. If current user is customer -> hide is_internal comments.
    4. Return list[CommentResponse].
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="TODO: implement GET /tickets/{ticket_id}/comments",
    )


@router.post("/{ticket_id}/comments")
def create_comment(ticket_id: int, payload: CommentCreate):
    """
    TODO:
    1. Load ticket.
    2. Check role:
       - customer cannot create internal comments
       - agent/manager can
    3. Create comment.
    4. Update ticket.updated_at.
    5. Return created comment.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="TODO: implement POST /tickets/{ticket_id}/comments",
    )
   







