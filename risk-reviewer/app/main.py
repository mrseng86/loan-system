"""FastAPI entry point for the local risk reviewer."""

from __future__ import annotations

import os
import uuid
from decimal import Decimal
from pathlib import Path

from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from app.ai import AIError, analyse, check_health
from app.config import settings
from app.db import get_db, init_db
from app.extract import UnsupportedFileError, extract
from app.models import Review
from app.schemas import HealthStatus, ReviewRead, ReviewSummary

app = FastAPI(title="Local Risk Reviewer", version="0.1.0")


@app.on_event("startup")
def _startup() -> None:
    init_db()


STATIC_DIR = Path(__file__).resolve().parent / "static"
app.mount("/ui", StaticFiles(directory=STATIC_DIR, html=True), name="ui")


@app.get("/")
def index():
    return FileResponse(STATIC_DIR / "index.html")


@app.get("/api/health", response_model=HealthStatus)
def health():
    return HealthStatus(**check_health())


@app.post("/api/reviews", response_model=ReviewRead)
def create_review(
    file: UploadFile = File(...),
    subject_name: str | None = Form(None),
    db: Session = Depends(get_db),
):
    data = file.file.read()
    size = len(data)
    if size == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    if size > settings.max_upload_mb * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail=f"File too large (max {settings.max_upload_mb} MB).",
        )

    try:
        payload = extract(file.filename or "upload", file.content_type or "", data)
    except UnsupportedFileError as exc:
        raise HTTPException(status_code=415, detail=str(exc)) from exc

    stored_name = _save_upload(file.filename or "upload", data)

    review = Review(
        subject_name=(subject_name or "").strip() or None,
        original_filename=file.filename or "upload",
        stored_filename=stored_name,
        content_type=file.content_type or "application/octet-stream",
        file_size_bytes=size,
        extracted_text=payload.text,
    )

    try:
        result = analyse(payload, subject_name=review.subject_name)
    except AIError as exc:
        review.error_message = str(exc)
        db.add(review)
        db.commit()
        db.refresh(review)
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    review.document_type = result.document_type
    review.risk_score = Decimal(str(round(result.risk_score, 2)))
    review.risk_level = result.risk_level
    review.recommendation = result.recommendation
    review.reasoning = result.reasoning
    review.key_findings = result.key_findings
    review.red_flags = result.red_flags
    review.positive_signals = result.positive_signals
    review.provider = result.provider
    review.model = result.model
    review.raw_ai_response = result.raw_response

    db.add(review)
    db.commit()
    db.refresh(review)
    return review


@app.get("/api/reviews", response_model=list[ReviewSummary])
def list_reviews(db: Session = Depends(get_db)):
    return db.query(Review).order_by(Review.id.desc()).all()


@app.get("/api/reviews/{review_id}", response_model=ReviewRead)
def get_review(review_id: int, db: Session = Depends(get_db)):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    return review


@app.get("/api/reviews/{review_id}/file")
def download_original(review_id: int, db: Session = Depends(get_db)):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    path = Path(settings.upload_dir) / review.stored_filename
    if not path.exists():
        raise HTTPException(status_code=404, detail="Stored file missing")
    return FileResponse(path, media_type=review.content_type, filename=review.original_filename)


@app.delete("/api/reviews/{review_id}", status_code=204)
def delete_review(review_id: int, db: Session = Depends(get_db)):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    path = Path(settings.upload_dir) / review.stored_filename
    if path.exists():
        try:
            path.unlink()
        except OSError:
            pass

    db.delete(review)
    db.commit()
    return None


def _save_upload(original_filename: str, data: bytes) -> str:
    os.makedirs(settings.upload_dir, exist_ok=True)
    suffix = Path(original_filename).suffix
    stored_name = f"{uuid.uuid4().hex}{suffix}"
    (Path(settings.upload_dir) / stored_name).write_bytes(data)
    return stored_name
