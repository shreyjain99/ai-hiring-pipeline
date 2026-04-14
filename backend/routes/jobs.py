from fastapi import APIRouter, HTTPException
from typing import List
from database import get_db
from models import JobCreate, JobResponse, QuestionCreate, QuestionResponse, row_to_dict

router = APIRouter()


@router.post("/job", response_model=JobResponse)
def create_job(job: JobCreate):
    with get_db() as conn:
        cursor = conn.execute(
            "INSERT INTO jobs (title, description, requirements, shortlist_threshold) VALUES (?, ?, ?, ?)",
            (job.title, job.description, job.requirements, job.shortlist_threshold)
        )
        row = conn.execute("SELECT * FROM jobs WHERE id = ?", (cursor.lastrowid,)).fetchone()
        return row_to_dict(row)


@router.get("/jobs", response_model=List[JobResponse])
def get_jobs():
    with get_db() as conn:
        rows = conn.execute("SELECT * FROM jobs ORDER BY created_at DESC").fetchall()
        return [row_to_dict(r) for r in rows]


@router.post("/job/{job_id}/questions")
def create_questions(job_id: int, questions: List[QuestionCreate]):
    with get_db() as conn:
        job = conn.execute("SELECT id FROM jobs WHERE id = ?", (job_id,)).fetchone()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        conn.execute("DELETE FROM questions WHERE job_id = ?", (job_id,))
        for q in questions:
            conn.execute(
                "INSERT INTO questions (job_id, question_text, expected_answer, order_index) VALUES (?, ?, ?, ?)",
                (job_id, q.question_text, q.expected_answer, q.order_index)
            )
    return {"message": "Questions saved"}


@router.get("/job/{job_id}/questions", response_model=List[QuestionResponse])
def get_questions(job_id: int):
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM questions WHERE job_id = ? ORDER BY order_index", (job_id,)
        ).fetchall()
        return [row_to_dict(r) for r in rows]
