"""Extract text or prepare images from uploaded files."""

from __future__ import annotations

import base64
import io
from dataclasses import dataclass
from pathlib import Path

from pypdf import PdfReader

IMAGE_CONTENT_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"}
PDF_CONTENT_TYPES = {"application/pdf"}
TEXT_CONTENT_TYPES = {"text/plain", "text/csv", "text/markdown", "application/json"}

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
PDF_EXTS = {".pdf"}
TEXT_EXTS = {".txt", ".csv", ".md", ".json", ".log"}


@dataclass
class ExtractedPayload:
    """Result of reading an uploaded file."""

    kind: str  # "text" or "image"
    text: str | None
    image_b64: str | None
    page_count: int | None = None


class UnsupportedFileError(ValueError):
    """Raised when the uploaded file type is not supported."""


def _classify(filename: str, content_type: str) -> str:
    ct = (content_type or "").lower()
    ext = Path(filename).suffix.lower()

    if ct in PDF_CONTENT_TYPES or ext in PDF_EXTS:
        return "pdf"
    if ct in IMAGE_CONTENT_TYPES or ext in IMAGE_EXTS:
        return "image"
    if ct in TEXT_CONTENT_TYPES or ext in TEXT_EXTS:
        return "text"
    return "unknown"


def extract(filename: str, content_type: str, data: bytes) -> ExtractedPayload:
    kind = _classify(filename, content_type)

    if kind == "pdf":
        return _extract_pdf(data)
    if kind == "text":
        return ExtractedPayload(kind="text", text=_decode_text(data), image_b64=None)
    if kind == "image":
        return ExtractedPayload(
            kind="image",
            text=None,
            image_b64=base64.b64encode(data).decode("ascii"),
        )

    raise UnsupportedFileError(
        f"Unsupported file type ({content_type or 'unknown'}). "
        "Upload PDF, plain text, or an image (jpg / png / webp)."
    )


def _extract_pdf(data: bytes) -> ExtractedPayload:
    reader = PdfReader(io.BytesIO(data))
    chunks: list[str] = []
    for page in reader.pages:
        try:
            text = page.extract_text() or ""
        except Exception:  # pypdf occasionally raises on malformed pages
            text = ""
        if text.strip():
            chunks.append(text)

    joined = "\n\n".join(chunks).strip()
    return ExtractedPayload(kind="text", text=joined, image_b64=None, page_count=len(reader.pages))


def _decode_text(data: bytes) -> str:
    for encoding in ("utf-8", "utf-16", "latin-1"):
        try:
            return data.decode(encoding)
        except UnicodeDecodeError:
            continue
    return data.decode("utf-8", errors="replace")
