from pydantic import BaseModel
from typing import Optional, List


class JobCreate(BaseModel):
    title: str
    description: str
    requirements: str
    shortlist_threshold: int


class JobResponse(BaseModel):
    id: int
    title: str
    description: str
    requirements: str
    shortlist_threshold: int
    created_at: Optional[str]


class QuestionCreate(BaseModel):
    question_text: str
    expected_answer: str
    order_index: int = 0


class QuestionResponse(BaseModel):
    id: int
    job_id: int
    question_text: str
    expected_answer: str
    order_index: int


class CandidateResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    resume_text: Optional[str]
    resume_filename: Optional[str]
    stage: str
    score: Optional[int]
    job_id: Optional[int]
    created_at: Optional[str]
    questionnaire_sent_at: Optional[str]
    response: Optional[dict] = None


def row_to_dict(row) -> dict:
    return dict(row) if row else None
