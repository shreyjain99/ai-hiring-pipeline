from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from database import init_db
from routes import candidates, jobs, worker, webhook

load_dotenv()

app = FastAPI(title="AI Hiring Pipeline")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    init_db()


app.include_router(candidates.router)
app.include_router(jobs.router)
app.include_router(worker.router)
app.include_router(webhook.router)


@app.get("/health")
def health():
    return {"status": "ok"}
