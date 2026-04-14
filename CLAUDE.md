# CLAUDE.md

## Project Overview

This project is a minimal AI-powered hiring pipeline that automates candidate screening from application to shortlist.

The system:
- Accepts candidate applications (via frontend form)
- Sends thank you for applying email and questionnaire emails
- Processes responses using an LLM
- Applies rule-based filtering
- Scores resumes using AI
- Produces a shortlist for human review

This is an MVP (prototype) with a single job, but must support:
- Multiple jobs (future)
- Assessment stage (future)
- External integrations like LinkedIn (future)

## Core Principle

The system MUST be built as a stage-based pipeline (state machine).

applied → questionnaire_sent → questionnaire_completed → eligible → scored → shortlisted → human_review

## Hard Rules

1. Backend is source of truth
2. Frontend is UI only
3. Use stage-based design
4. Include job_id everywhere
5. Keep AI logic modular
6. Email handled in backend
7. Use async operations
8. Keep database simple
9. Store resume text separately
10. API-first design
11. Avoid unnecessary complexity

## Tech Stack

Frontend: React (Vite), GitHub Pages  
Backend: Node.js (Express) or Python (FastAPI), Render  
Database: SQLite  
Email: Resend  
AI: LLM (TBD)  
Storage: Local backend

## MVP Flow

Apply → Questionnaire → Follow-ups → Parse → Filter → Score → Shortlist → Human Review

## Future Additions

- Assessment stage
- Multiple jobs
- LinkedIn integration
- Interview scheduling
