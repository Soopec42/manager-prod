from datetime import datetime
from pydantic import BaseModel, EmailStr

from app.models.ticket import prioritets, Statuses


class TicketBase(BaseModel):
    title: str
    priority: prioritets
    customer_name: str
    customer_email: EmailStr

class TicketCreate(TicketBase):
    description: str | None

class TicketUpdate(BaseModel):
    priority: prioritets
    status: Statuses

class TicketSummary(TicketBase):
    id: int
    status: Statuses
    assigned_id: int | None = None
    assigned_name: str | None = None
    created_at: datetime
    updated_at: datetime
    due_at: datetime | None = None

class TicketDetail(TicketSummary):
    description: str

class TicketListResponse(BaseModel):
    items: list[TicketSummary]
    total: int
    page: int
    page_size: int

class AssignTicketRequest(BaseModel):
    assignee_id: int

class MessageResponse(BaseModel):
    message: str








