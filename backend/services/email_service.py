import os
import resend
from dotenv import load_dotenv

load_dotenv()

resend.api_key = os.getenv("RESEND_API_KEY")
FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@hiringpipeline.org")
REPLY_TO_DOMAIN = os.getenv("REPLY_TO_DOMAIN", "hiringpipeline.org")


def send_thank_you(candidate: dict, job: dict):
    name = candidate["first_name"]
    resend.Emails.send({
        "from": FROM_EMAIL,
        "to": candidate["email"],
        "subject": f"Thank you for applying — {job['title']}",
        "html": f"""
        <p>Hi {name},</p>
        <p>Thank you for applying for the <strong>{job['title']}</strong> position. We have received your application and resume.</p>
        <p>You will receive a separate email shortly with a short questionnaire. Please reply to that email with your answers.</p>
        <p>Best regards,<br/>The Hiring Team</p>
        """,
    })


def send_questionnaire(candidate: dict, job: dict, questions: list):
    name = candidate["first_name"]
    candidate_id = candidate["id"]
    reply_to = f"reply+{candidate_id}@{REPLY_TO_DOMAIN}"

    questions_text = "\n".join(
        [f"{i+1}. {q['question_text']}" for i, q in enumerate(questions)]
    )
    questions_html = "".join(
        [f"<p><strong>{i+1}.</strong> {q['question_text']}</p>" for i, q in enumerate(questions)]
    )

    resend.Emails.send({
        "from": FROM_EMAIL,
        "to": candidate["email"],
        "reply_to": reply_to,
        "subject": f"Questionnaire — {job['title']}",
        "html": f"""
        <p>Hi {name},</p>
        <p>As part of your application for <strong>{job['title']}</strong>, please answer the following questions.</p>
        <p><strong>Simply reply to this email with your numbered answers.</strong></p>
        {questions_html}
        <p>Example format:</p>
        <pre>1. Your answer here
2. Your answer here</pre>
        <p>Best regards,<br/>The Hiring Team</p>
        """,
        "text": f"""Hi {name},

As part of your application for {job['title']}, please answer the following questions.
Simply reply to this email with your numbered answers.

{questions_text}

Example format:
1. Your answer here
2. Your answer here

Best regards,
The Hiring Team""",
    })


def send_reminder(candidate: dict, job: dict, questions: list):
    name = candidate["first_name"]
    candidate_id = candidate["id"]
    reply_to = f"reply+{candidate_id}@{REPLY_TO_DOMAIN}"

    questions_text = "\n".join(
        [f"{i+1}. {q['question_text']}" for i, q in enumerate(questions)]
    )
    questions_html = "".join(
        [f"<p><strong>{i+1}.</strong> {q['question_text']}</p>" for i, q in enumerate(questions)]
    )

    resend.Emails.send({
        "from": FROM_EMAIL,
        "to": candidate["email"],
        "reply_to": reply_to,
        "subject": f"Reminder: Questionnaire — {job['title']}",
        "html": f"""
        <p>Hi {name},</p>
        <p>This is a friendly reminder to complete the questionnaire for <strong>{job['title']}</strong>.</p>
        <p><strong>Please reply to this email with your numbered answers.</strong></p>
        {questions_html}
        <p>Best regards,<br/>The Hiring Team</p>
        """,
        "text": f"""Hi {name},

This is a friendly reminder to complete the questionnaire for {job['title']}.
Please reply to this email with your numbered answers.

{questions_text}

Best regards,
The Hiring Team""",
    })


def send_rejection(candidate: dict, job: dict):
    name = candidate["first_name"]
    resend.Emails.send({
        "from": FROM_EMAIL,
        "to": candidate["email"],
        "subject": f"Application Update — {job['title']}",
        "html": f"""
        <p>Hi {name},</p>
        <p>Thank you for your interest in the <strong>{job['title']}</strong> position and for taking the time to complete our questionnaire.</p>
        <p>After careful consideration, we have decided not to move forward with your application at this time.</p>
        <p>We appreciate your interest and wish you the best in your job search.</p>
        <p>Best regards,<br/>The Hiring Team</p>
        """,
    })
