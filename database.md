# DATABASE.md

## Overview
SQLite database for MVP

## Tables

### Job
- id
- title
- description
- requirements
- shortlist_threshold (score out of 100, set by recruiter)

### Question
- id
- job_id
- question_text
- expected_answer (recruiter's ideal answer — used by LLM for comparison)
- order_index

### Candidate
- id
- first_name
- last_name
- email
- resume_text
- resume_filename
- stage
- status
- score
- job_id
- created_at
- questionnaire_sent_at

### Response
- id
- candidate_id
- answers (JSON — array of {question_id, answer} pairs)
- parsed_result (AI eligibility decision + reasoning)

## Key Rule
Always include job_id for future multi-job support.
