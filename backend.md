# BACKEND.md

## Overview
Python (FastAPI) backend handles all business logic, AI processing, email workflows, and state transitions.

## Responsibilities
- Candidate pipeline management
- Email sending (Resend)
- AI processing (Claude claude-sonnet-4-6 via Anthropic SDK)
- Resume parsing (PDF/DOCX → text)
- Stage transitions
- Eligibility checking (rule-based first, then AI confirms)
- Resume scoring (AI scores resume vs. job description)
- Auto-shortlisting (candidates above job's shortlist_threshold are promoted automatically)

## Core API Endpoints

### Candidate
POST /apply (multipart/form-data — includes resume file upload)
POST /candidate/:id/response
POST /candidate/:id/reject
POST /candidate/:id/approve

### Job
POST /job
GET /jobs

### Questions
POST /job/:id/questions
GET /job/:id/questions

### Data Fetch
GET /candidates
GET /candidate/:id

### Worker (triggered by Render Cron)
POST /worker/check-reminders

## Architecture
- API Layer (routes)
- Service Layer (logic)
- AI Layer (Claude API calls — eligibility confirmation + resume scoring)
- Worker Layer (emails, reminders — Render Cron Job hits POST /worker/check-reminders every hour; sends 1 reminder if candidate is in questionnaire_sent stage and questionnaire_sent_at is >2 days ago with no response)

## Eligibility Logic
1. Claude compares candidate's answers against recruiter's expected answers for each question
2. If LLM deems answers sufficiently aligned → stage moves to eligible
3. If not → candidate is rejected, rejection email sent

## Scoring Logic
- Triggered after candidate reaches eligible stage
- Claude scores resume_text against job description + requirements
- Score stored on candidate (0–100)
- If score >= job's shortlist_threshold → stage moves to shortlisted automatically

## Key Rule
All decisions must be made in backend.
