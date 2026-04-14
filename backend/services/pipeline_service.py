import json
from database import get_db
from services import email_service, ai_service


def process_application(candidate_id: int):
    """
    After a candidate applies:
    1. Send thank you email
    2. Send questionnaire email
    3. Update stage to questionnaire_sent
    """
    with get_db() as conn:
        candidate = dict(conn.execute(
            "SELECT * FROM candidates WHERE id = ?", (candidate_id,)
        ).fetchone())

        job = dict(conn.execute(
            "SELECT * FROM jobs WHERE id = ?", (candidate["job_id"],)
        ).fetchone())

        questions = [dict(r) for r in conn.execute(
            "SELECT * FROM questions WHERE job_id = ? ORDER BY order_index", (job["id"],)
        ).fetchall()]

    email_service.send_thank_you(candidate, job)
    email_service.send_questionnaire(candidate, job, questions)

    with get_db() as conn:
        conn.execute(
            "UPDATE candidates SET stage = 'questionnaire_sent', questionnaire_sent_at = datetime('now') WHERE id = ?",
            (candidate_id,)
        )


def process_inbound_email(candidate_id: int, email_body: str):
    """
    After receiving a candidate's questionnaire reply:
    1. Run AI eligibility check
    2. Save response
    3. Update stage based on eligibility
    4. If eligible, score resume
    5. Auto-shortlist if score >= threshold
    """
    with get_db() as conn:
        candidate = dict(conn.execute(
            "SELECT * FROM candidates WHERE id = ?", (candidate_id,)
        ).fetchone())

        job = dict(conn.execute(
            "SELECT * FROM jobs WHERE id = ?", (candidate["job_id"],)
        ).fetchone())

        questions = [dict(r) for r in conn.execute(
            "SELECT * FROM questions WHERE job_id = ? ORDER BY order_index", (job["id"],)
        ).fetchall()]

    # Run AI eligibility check
    result = ai_service.check_eligibility(questions, email_body)
    eligible = result["eligible"]
    answers = result["answers"]
    reasoning = result["reasoning"]

    with get_db() as conn:
        # Save response
        conn.execute(
            """INSERT INTO responses (candidate_id, answers, parsed_result)
               VALUES (?, ?, ?)
               ON CONFLICT(candidate_id) DO UPDATE SET answers=excluded.answers, parsed_result=excluded.parsed_result""",
            (candidate_id, json.dumps(answers), reasoning)
        )
        conn.execute(
            "UPDATE candidates SET stage = 'questionnaire_completed' WHERE id = ?",
            (candidate_id,)
        )

    if not eligible:
        with get_db() as conn:
            conn.execute(
                "UPDATE candidates SET stage = 'rejected' WHERE id = ?",
                (candidate_id,)
            )
        email_service.send_rejection(candidate, job)
        return

    # Eligible — score the resume
    with get_db() as conn:
        conn.execute(
            "UPDATE candidates SET stage = 'eligible' WHERE id = ?",
            (candidate_id,)
        )

    resume_text = candidate.get("resume_text", "")
    if resume_text:
        score = ai_service.score_resume(resume_text, job)
    else:
        score = 0

    threshold = job["shortlist_threshold"]
    new_stage = "shortlisted" if score >= threshold else "scored"

    with get_db() as conn:
        conn.execute(
            "UPDATE candidates SET stage = ?, score = ? WHERE id = ?",
            (new_stage, score, candidate_id)
        )
