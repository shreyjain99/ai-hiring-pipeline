import os
import json
import anthropic
from dotenv import load_dotenv

load_dotenv()

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
MODEL = "claude-sonnet-4-6"


def check_eligibility(questions: list, email_body: str) -> dict:
    """
    Parse candidate's email reply and check eligibility by comparing
    their answers against the recruiter's expected answers.

    Returns:
        {
            "eligible": bool,
            "answers": [{"question_text": str, "answer": str}],
            "reasoning": str
        }
    """
    questions_block = "\n".join([
        f"{i+1}. Question: {q['question_text']}\n   Expected answer: {q['expected_answer']}"
        for i, q in enumerate(questions)
    ])

    prompt = f"""You are evaluating a job application. The candidate replied to a questionnaire email.

QUESTIONS AND EXPECTED ANSWERS:
{questions_block}

CANDIDATE'S EMAIL REPLY:
{email_body}

Your tasks:
1. Extract the candidate's answer for each question from their email reply.
2. Compare each answer against the expected answer.
3. Determine if the candidate is eligible to proceed (their answers should be reasonably aligned with the expected answers - use judgment, not exact matching).

Respond with ONLY valid JSON in this exact format:
{{
  "eligible": true or false,
  "answers": [
    {{"question_text": "question here", "answer": "candidate's extracted answer"}},
    ...
  ],
  "reasoning": "Brief explanation of your eligibility decision"
}}"""

    message = client.messages.create(
        model=MODEL,
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}]
    )

    content = message.content[0].text.strip()
    # Strip markdown code blocks if present
    if content.startswith("```"):
        content = content.split("```")[1]
        if content.startswith("json"):
            content = content[4:]
    return json.loads(content.strip())


def score_resume(resume_text: str, job: dict) -> int:
    """
    Score a resume against the job description and requirements.
    Returns a score from 0 to 100.
    """
    prompt = f"""You are an expert recruiter scoring a candidate's resume.

JOB TITLE: {job['title']}

JOB DESCRIPTION:
{job['description']}

REQUIREMENTS:
{job['requirements']}

CANDIDATE'S RESUME:
{resume_text}

Score this resume from 0 to 100 based on how well the candidate matches the job requirements and description.
Consider: relevant experience, skills match, education, and overall fit.

Respond with ONLY valid JSON in this exact format:
{{
  "score": <integer from 0 to 100>,
  "reasoning": "Brief explanation of the score"
}}"""

    message = client.messages.create(
        model=MODEL,
        max_tokens=512,
        messages=[{"role": "user", "content": prompt}]
    )

    content = message.content[0].text.strip()
    if content.startswith("```"):
        content = content.split("```")[1]
        if content.startswith("json"):
            content = content[4:]
    result = json.loads(content.strip())
    return int(result["score"])
