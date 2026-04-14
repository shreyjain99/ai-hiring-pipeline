from fastapi import APIRouter
from database import get_db
from services import email_service

router = APIRouter()


@router.post("/worker/check-reminders")
def check_reminders():
    """
    Called by Render Cron every hour.
    Finds candidates in questionnaire_sent stage where questionnaire_sent_at > 2 days ago
    and sends a reminder email (only once — we check if reminder was already sent by
    looking at whether questionnaire_sent_at is between 2-3 days ago to avoid repeat sends).
    """
    with get_db() as conn:
        # Find candidates who were sent questionnaire 2-3 days ago with no response
        candidates = conn.execute("""
            SELECT c.*, j.title as job_title
            FROM candidates c
            JOIN jobs j ON c.job_id = j.id
            WHERE c.stage = 'questionnaire_sent'
            AND c.questionnaire_sent_at <= datetime('now', '-2 days')
            AND c.questionnaire_sent_at > datetime('now', '-3 days')
        """).fetchall()

        reminded = 0
        for row in candidates:
            candidate = dict(row)
            job = dict(conn.execute(
                "SELECT * FROM jobs WHERE id = ?", (candidate["job_id"],)
            ).fetchone())
            questions = [dict(r) for r in conn.execute(
                "SELECT * FROM questions WHERE job_id = ? ORDER BY order_index",
                (candidate["job_id"],)
            ).fetchall()]

            try:
                email_service.send_reminder(candidate, job, questions)
                reminded += 1
            except Exception as e:
                print(f"Failed to send reminder to candidate {candidate['id']}: {e}")

    return {"message": f"Sent {reminded} reminder(s)"}
