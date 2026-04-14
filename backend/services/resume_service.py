import io


def parse_resume(file_bytes: bytes, filename: str) -> str:
    filename_lower = filename.lower()

    if filename_lower.endswith(".pdf"):
        return _parse_pdf(file_bytes)
    elif filename_lower.endswith(".docx"):
        return _parse_docx(file_bytes)
    else:
        raise ValueError("Unsupported file type. Only PDF and DOCX are accepted.")


def _parse_pdf(file_bytes: bytes) -> str:
    import pdfplumber
    text_parts = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                text_parts.append(text)
    return "\n".join(text_parts).strip()


def _parse_docx(file_bytes: bytes) -> str:
    from docx import Document
    doc = Document(io.BytesIO(file_bytes))
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    return "\n".join(paragraphs).strip()
