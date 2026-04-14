# FRONTEND.md

## Overview
React (Vite) app with two sections:
- Candidate
- Recruiter

## Routes

### Candidate
/candidate/login (gate before apply form — hardcoded credentials not required, just entry point)
/candidate/apply

### Recruiter
/admin/login (hardcoded username + password)
/admin/dashboard
/admin/job (create job — includes title, description, requirements, shortlist_threshold, and questionnaire questions)
/admin/candidates
/admin/candidate/:id

## Responsibilities
- Collect input
- Display data
- Call backend APIs

## No Responsibilities
- No AI logic
- No filtering
- No business decisions
- No real authentication

## Flow

Candidate:
Login → Apply (upload resume, submit form) → Submit

Recruiter:
Login → Dashboard → Job (create job + questions) → Candidates → Review → Action
