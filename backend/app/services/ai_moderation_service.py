"""AI-assisted loan/customer risk moderation.

Pluggable providers — defaults to free local Ollama (Gemma 2). Optional Google
Gemini provider for environments without a local model server. The output is
strictly advisory; final approval still relies on human review.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from datetime import date, datetime
from decimal import Decimal
from typing import Any

import httpx
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.customer import Customer
from app.models.loan import Loan
from app.models.repayment import Repayment
from app.models.short_term_loan import ShortTermLoan


SYSTEM_PROMPT = (
    "You are a careful credit risk assistant for a small loan company. "
    "You receive structured information about a borrower and an optional loan "
    "request. Always respond with a single valid JSON object and nothing else. "
    "Schema: {\"risk_score\": number 0-100 where higher means riskier, "
    "\"risk_level\": one of \"low\" | \"medium\" | \"high\", "
    "\"recommendation\": one of \"approve\" | \"review\" | \"reject\", "
    "\"reasoning\": short paragraph explaining the score in plain language, "
    "\"red_flags\": array of short strings describing concrete concerns, "
    "\"positive_signals\": array of short strings of mitigating factors}. "
    "Be conservative: when data is missing or ambiguous, suggest \"review\" "
    "rather than \"approve\". Never invent facts."
)


@dataclass
class ModerationResult:
    risk_score: float
    risk_level: str
    recommendation: str
    reasoning: str
    red_flags: list[str]
    positive_signals: list[str]
    provider: str
    model: str
    raw_response: str


class AIModerationError(RuntimeError):
    """Raised when the upstream AI provider cannot fulfil the request."""


def _decimal(value: Any) -> float:
    if value is None:
        return 0.0
    if isinstance(value, Decimal):
        return float(value)
    return float(value)


def _safe_iso(value: date | datetime | None) -> str | None:
    if value is None:
        return None
    return value.isoformat()


def build_customer_snapshot(db: Session, customer: Customer) -> dict[str, Any]:
    loans: list[Loan] = list(customer.loans or [])
    short_terms: list[ShortTermLoan] = list(customer.short_term_loans or [])

    loan_summaries = []
    repayment_total = Decimal("0")
    on_time = 0
    late = 0
    overdue_loans = 0

    for loan in loans:
        if loan.status and str(loan.status).endswith("overdue"):
            overdue_loans += 1
        loan_summaries.append(
            {
                "id": loan.id,
                "amount": _decimal(loan.loan_amount),
                "tenure_months": loan.tenure_months,
                "installment": _decimal(loan.installment_amount),
                "current_balance": _decimal(loan.current_balance),
                "status": str(loan.status),
                "days_overdue": loan.days_overdue,
                "disbursed_at": _safe_iso(loan.disbursed_at),
                "next_due_date": _safe_iso(loan.next_due_date),
            }
        )

        repayments: list[Repayment] = (
            db.query(Repayment).filter(Repayment.loan_id == loan.id).all()
        )
        for rep in repayments:
            repayment_total += rep.amount or Decimal("0")
            if getattr(rep, "is_late", None) is True:
                late += 1
            else:
                on_time += 1

    short_term_summaries = [
        {
            "id": st.id,
            "principal": _decimal(st.principal_amount),
            "interest_rate": _decimal(st.interest_rate),
            "current_balance": _decimal(st.current_balance),
            "status": str(st.status),
            "due_date": _safe_iso(st.due_date),
        }
        for st in short_terms
    ]

    return {
        "customer": {
            "id": customer.id,
            "full_name": customer.full_name,
            "phone": customer.phone,
            "email": customer.email,
            "national_id": customer.national_id,
            "address": customer.address,
            "registered_on": _safe_iso(customer.created_at),
        },
        "history": {
            "active_loans": len(loans),
            "overdue_loans": overdue_loans,
            "total_repayments_recorded": on_time + late,
            "total_repayment_amount": float(repayment_total),
            "short_term_loans": len(short_terms),
        },
        "loans": loan_summaries,
        "short_term_loans": short_term_summaries,
    }


def build_loan_snapshot(db: Session, loan: Loan) -> dict[str, Any]:
    snapshot = build_customer_snapshot(db, loan.customer)
    snapshot["focus_loan"] = {
        "id": loan.id,
        "amount": _decimal(loan.loan_amount),
        "interest_rate": _decimal(loan.interest_rate),
        "monthly_interest_rate": _decimal(loan.monthly_interest_rate),
        "tenure_months": loan.tenure_months,
        "installment": _decimal(loan.installment_amount),
        "total_payable": _decimal(loan.total_payable),
        "current_balance": _decimal(loan.current_balance),
        "status": str(loan.status),
        "days_overdue": loan.days_overdue,
        "disbursed_at": _safe_iso(loan.disbursed_at),
        "next_due_date": _safe_iso(loan.next_due_date),
    }
    return snapshot


def _build_user_prompt(snapshot: dict[str, Any]) -> str:
    return (
        "Evaluate the following borrower record. Return only the JSON object "
        "described in the system instructions.\n\n"
        f"DATA:\n{json.dumps(snapshot, ensure_ascii=False, indent=2)}"
    )


def _extract_json_object(text: str) -> dict[str, Any]:
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if not match:
            raise AIModerationError("AI provider returned no parseable JSON.")
        return json.loads(match.group(0))


def _normalize_result(payload: dict[str, Any], *, provider: str, model: str, raw: str) -> ModerationResult:
    try:
        score = float(payload.get("risk_score", 50))
    except (TypeError, ValueError):
        score = 50.0
    score = max(0.0, min(100.0, score))

    level = str(payload.get("risk_level", "")).strip().lower() or _level_from_score(score)
    if level not in {"low", "medium", "high"}:
        level = _level_from_score(score)

    recommendation = str(payload.get("recommendation", "review")).strip().lower()
    if recommendation not in {"approve", "review", "reject"}:
        recommendation = "review"

    reasoning = str(payload.get("reasoning", "")).strip() or "No reasoning provided."

    red_flags = payload.get("red_flags") or []
    positive_signals = payload.get("positive_signals") or []
    if not isinstance(red_flags, list):
        red_flags = [str(red_flags)]
    if not isinstance(positive_signals, list):
        positive_signals = [str(positive_signals)]

    return ModerationResult(
        risk_score=score,
        risk_level=level,
        recommendation=recommendation,
        reasoning=reasoning,
        red_flags=[str(item) for item in red_flags][:10],
        positive_signals=[str(item) for item in positive_signals][:10],
        provider=provider,
        model=model,
        raw_response=raw,
    )


def _level_from_score(score: float) -> str:
    if score >= 70:
        return "high"
    if score >= 40:
        return "medium"
    return "low"


def _call_ollama(prompt: str) -> str:
    url = f"{settings.ollama_base_url.rstrip('/')}/api/chat"
    payload = {
        "model": settings.ai_model,
        "stream": False,
        "format": "json",
        "options": {"temperature": 0.2},
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
    }
    try:
        response = httpx.post(url, json=payload, timeout=settings.ai_timeout_seconds)
        response.raise_for_status()
    except httpx.HTTPError as exc:
        raise AIModerationError(f"Ollama request failed: {exc}") from exc

    data = response.json()
    message = (data.get("message") or {}).get("content")
    if not message:
        raise AIModerationError("Ollama returned an empty response.")
    return message


def _call_gemini(prompt: str) -> str:
    if not settings.gemini_api_key:
        raise AIModerationError("GEMINI_API_KEY is not configured.")

    url = (
        f"{settings.gemini_base_url.rstrip('/')}/models/"
        f"{settings.ai_model}:generateContent?key={settings.gemini_api_key}"
    )
    payload = {
        "systemInstruction": {"parts": [{"text": SYSTEM_PROMPT}]},
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.2,
            "responseMimeType": "application/json",
        },
    }
    try:
        response = httpx.post(url, json=payload, timeout=settings.ai_timeout_seconds)
        response.raise_for_status()
    except httpx.HTTPError as exc:
        raise AIModerationError(f"Gemini request failed: {exc}") from exc

    data = response.json()
    candidates = data.get("candidates") or []
    if not candidates:
        raise AIModerationError("Gemini returned no candidates.")
    parts = (candidates[0].get("content") or {}).get("parts") or []
    text = "".join(part.get("text", "") for part in parts)
    if not text:
        raise AIModerationError("Gemini returned an empty response.")
    return text


def run_moderation(snapshot: dict[str, Any]) -> ModerationResult:
    provider = settings.ai_provider.lower()
    if provider == "disabled":
        raise AIModerationError("AI moderation is disabled. Set AI_PROVIDER to enable it.")

    prompt = _build_user_prompt(snapshot)

    if provider == "ollama":
        raw = _call_ollama(prompt)
    elif provider == "gemini":
        raw = _call_gemini(prompt)
    else:
        raise AIModerationError(f"Unknown AI_PROVIDER: {settings.ai_provider}")

    payload = _extract_json_object(raw)
    return _normalize_result(payload, provider=provider, model=settings.ai_model, raw=raw)
