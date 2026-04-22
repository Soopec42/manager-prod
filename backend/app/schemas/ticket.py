from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict

from app.models.ticket import prioritets, Statuses


class TicketBase(BaseModel):
    title: str
    priority: prioritets
    customer_name: str
    customer_email: EmailStr
    due_at: datetime | None = None

class TicketCreate(TicketBase):
    description: str

class TicketUpdate(BaseModel):
    priority: prioritets
    status: Statuses

class TicketSummary(TicketBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    status: Statuses
    assigned_id: int | None = None
    assigned_name: str | None = None
    created_at: datetime
    updated_at: datetime

class TicketDetail(TicketSummary):
    description: str

class TicketListResponse(BaseModel):
    items: list[TicketSummary]
    total: int
    page: int
    page_size: int

class AssignTicketRequest(BaseModel):
    assigned_id: int

class MessageResponse(BaseModel):
    message: str








