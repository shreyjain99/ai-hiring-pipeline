import sqlite3
import os
from contextlib import contextmanager
from dotenv import load_dotenv

load_dotenv()

DATABASE_PATH = os.getenv("DATABASE_PATH", "./hiring.db")


def get_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


@contextmanager
def get_db():
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db():
    with get_db() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS jobs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                requirements TEXT NOT NULL,
                shortlist_threshold INTEGER NOT NULL DEFAULT 70,
                created_at TEXT DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS questions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                job_id INTEGER NOT NULL,
                question_text TEXT NOT NULL,
                expected_answer TEXT NOT NULL,
                order_index INTEGER NOT NULL DEFAULT 0,
                FOREIGN KEY (job_id) REFERENCES jobs(id)
            );

            CREATE TABLE IF NOT EXISTS candidates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                email TEXT NOT NULL,
                resume_text TEXT,
                resume_filename TEXT,
                stage TEXT NOT NULL DEFAULT 'applied',
                score INTEGER,
                job_id INTEGER,
                created_at TEXT DEFAULT (datetime('now')),
                questionnaire_sent_at TEXT,
                FOREIGN KEY (job_id) REFERENCES jobs(id)
            );

            CREATE TABLE IF NOT EXISTS responses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                candidate_id INTEGER NOT NULL UNIQUE,
                answers TEXT,
                parsed_result TEXT,
                created_at TEXT DEFAULT (datetime('now')),
                FOREIGN KEY (candidate_id) REFERENCES candidates(id)
            );
        """)
