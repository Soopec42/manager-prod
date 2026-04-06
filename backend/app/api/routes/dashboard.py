from fastapi import APIRouter, HTTPException, status

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/overview")
def dashboard_overview():
    """
    TODO:
    Return:
    - open_tickets
    - in_progress_tickets
    - overdue_tickets
    - resolved_today
    - avg_first_response_minutes

    At first you may calculate them in a very simple way.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="TODO: implement GET /dashboard/overview",
    )