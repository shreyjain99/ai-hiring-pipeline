import re
from fastapi import APIRouter, Request, BackgroundTasks
from database import get_db
from services.pipeline_service import process_inbound_email

router = APIRouter()


def extract_candidate_id(to_addresses: list) -> int | None:
    """
    Extract candidate ID from reply+{id}@hiringpipeline.org address.
    """
    for address in to_addresses:
        match = re.search(r'reply\+(\d+)@', address)
        if match:
            return int(match.group(1))
    return None


@router.post("/webhook/inbound-email")
async def inbound_email(request: Request, background_tasks: BackgroundTasks):
    payload = await request.json()

    # Resend inbound payload structure
    to = payload.get("to", [])
    if isinstance(to, str):
        to = [to]

    email_body = payload.get("text") or payload.get("html") or ""

    candidate_id = extract_candidate_id(to)
    if not candidate_id:
        return {"message": "No candidate ID found in recipient address"}

    # Verify candidate exists and is waiting for questionnaire response
    with get_db() as conn:
        candidate = conn.execute(
            "SELECT * FROM candidates WHERE id = ? AND stage = 'questionnaire_sent'",
            (candidate_id,)
        ).fetchone()

    if not candidate:
        return {"message": "Candidate not found or not awaiting questionnaire"}

    # Process in background so we return 200 quickly to Resend
    background_tasks.add_task(process_inbound_email, candidate_id, email_body)

    return {"message": "Processing"}
