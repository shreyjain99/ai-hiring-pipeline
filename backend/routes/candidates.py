from fastapi import APIRouter, HTTPException, UploadFile, File, Form, BackgroundTasks
from typing import List, Optional
from database import get_db
from models import row_to_dict
from services.resume_service import parse_resume
from services.pipeline_service import process_application

router = APIRouter()


@router.post("/apply")
async def apply(
    background_tasks: BackgroundTasks,
    first_name: str = Form(...),
    last_name: str = Form(...),
    email: str = Form(...),
    resume: UploadFile = File(...),
):
    # Parse resume
    file_bytes = await resume.read()
    try:
        resume_text = parse_resume(file_bytes, resume.filename)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Get the most recent job
    with get_db() as conn:
        job = conn.execute("SELECT * FROM jobs ORDER BY created_at DESC LIMIT 1").fetchone()
        if not job:
            raise HTTPException(status_code=400, detail="No jobs available at this time.")
        job_id = job["id"]

        cursor = conn.execute(
            """INSERT INTO candidates (first_name, last_name, email, resume_text, resume_filename, stage, job_id)
               VALUES (?, ?, ?, ?, ?, 'applied', ?)""",
            (first_name, last_name, email, resume_text, resume.filename, job_id)
        )
        candidate_id = cursor.lastrowid

    # Process application in background (send emails, update stage)
    background_tasks.add_task(process_application, candidate_id)

    return {"message": "Application received", "candidate_id": candidate_id}


@router.get("/candidates")
def get_candidates():
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM candidates ORDER BY created_at DESC"
        ).fetchall()
        return [row_to_dict(r) for r in rows]


@router.get("/candidate/{candidate_id}")
def get_candidate(candidate_id: int):
    with get_db() as conn:
        row = conn.execute(
            "SELECT * FROM candidates WHERE id = ?", (candidate_id,)
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Candidate not found")
        candidate = row_to_dict(row)

        response = conn.execute(
            "SELECT * FROM responses WHERE candidate_id = ?", (candidate_id,)
        ).fetchone()
        candidate["response"] = row_to_dict(response)

        return candidate


@router.post("/candidate/{candidate_id}/approve")
def approve_candidate(candidate_id: int):
    with get_db() as conn:
        candidate = conn.execute(
            "SELECT * FROM candidates WHERE id = ?", (candidate_id,)
        ).fetchone()
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found")
        conn.execute(
            "UPDATE candidates SET stage = 'human_review' WHERE id = ?", (candidate_id,)
        )
        updated = conn.execute(
            "SELECT * FROM candidates WHERE id = ?", (candidate_id,)
        ).fetchone()
        return row_to_dict(updated)


@router.post("/candidate/{candidate_id}/reject")
def reject_candidate(candidate_id: int):
    with get_db() as conn:
        candidate = conn.execute(
            "SELECT * FROM candidates WHERE id = ?", (candidate_id,)
        ).fetchone()
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found")
        conn.execute(
            "UPDATE candidates SET stage = 'rejected' WHERE id = ?", (candidate_id,)
        )
        updated = conn.execute(
            "SELECT * FROM candidates WHERE id = ?", (candidate_id,)
        ).fetchone()
        return row_to_dict(updated)
