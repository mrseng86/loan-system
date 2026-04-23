"""Ollama client + response normalization for risk review."""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from typing import Any

import httpx

from app.config import settings
from app.extract import ExtractedPayload

SYSTEM_PROMPT = (
    "You are a careful credit risk analyst for a small loan company. You will "
    "be given the content of a document that a borrower has submitted "
    "(e.g. national ID, pay slip, bank statement, utility bill, contract). "
    "Your job is to identify what the document is, summarise the key facts, "
    "and flag anything that increases credit risk or looks tampered / "
    "inconsistent. Always respond with a single valid JSON object and nothing "
    "else. Schema:\n"
    "{\n"
    '  "document_type": short label like "national_id", "pay_slip", "bank_statement", "utility_bill", "contract", "unknown",\n'
    '  "key_findings": array of short strings capturing the useful facts you extracted,\n'
    '  "red_flags": array of short strings describing concrete concerns,\n'
    '  "positive_signals": array of short strings of mitigating factors,\n'
    '  "risk_score": number from 0 to 100 where higher means riskier,\n'
    '  "risk_level": one of "low" | "medium" | "high",\n'
    '  "recommendation": one of "approve" | "review" | "reject",\n'
    '  "reasoning": short plain-language paragraph explaining the score\n'
    "}\n"
    "Be conservative: when the document is blurry, incomplete, or ambiguous, "
    "suggest \"review\" rather than \"approve\". Never invent facts."
)

TEXT_TRUNCATE_CHARS = 12000


@dataclass
class AIResult:
    document_type: str
    key_findings: list[str]
    red_flags: list[str]
    positive_signals: list[str]
    risk_score: float
    risk_level: str
    recommendation: str
    reasoning: str
    provider: str
    model: str
    raw_response: str


class AIError(RuntimeError):
    pass


def analyse(payload: ExtractedPayload, subject_name: str | None = None) -> AIResult:
    if payload.kind == "text":
        return _analyse_text(payload.text or "", subject_name)
    if payload.kind == "image":
        if not payload.image_b64:
            raise AIError("Image payload missing.")
        return _analyse_image(payload.image_b64, subject_name)
    raise AIError(f"Unknown payload kind: {payload.kind}")


def _build_user_prompt(body: str, subject_name: str | None) -> str:
    header = "Subject: " + (subject_name or "Unknown") + "\n\nDocument content:\n"
    trimmed = body.strip()
    if len(trimmed) > TEXT_TRUNCATE_CHARS:
        trimmed = trimmed[:TEXT_TRUNCATE_CHARS] + "\n\n[...truncated...]"
    return header + trimmed + "\n\nReturn only the JSON object."


def _analyse_text(text: str, subject_name: str | None) -> AIResult:
    if not text.strip():
        raise AIError(
            "No readable text could be extracted from this document. "
            "If it is a scanned image, upload it as an image instead."
        )
    prompt = _build_user_prompt(text, subject_name)
    raw = _call_ollama_chat(model=settings.text_model, user_content=prompt, images=None)
    payload = _extract_json_object(raw)
    return _normalise(payload, model=settings.text_model, raw=raw)


def _analyse_image(image_b64: str, subject_name: str | None) -> AIResult:
    prompt = (
        "Subject: " + (subject_name or "Unknown") + "\n\n"
        "A document image is attached. Read the image carefully and return only the JSON object."
    )
    raw = _call_ollama_chat(model=settings.vision_model, user_content=prompt, images=[image_b64])
    payload = _extract_json_object(raw)
    return _normalise(payload, model=settings.vision_model, raw=raw)


def _call_ollama_chat(*, model: str, user_content: str, images: list[str] | None) -> str:
    url = f"{settings.ollama_base_url.rstrip('/')}/api/chat"
    user_message: dict[str, Any] = {"role": "user", "content": user_content}
    if images:
        user_message["images"] = images

    body = {
        "model": model,
        "stream": False,
        "format": "json",
        "options": {"temperature": 0.2},
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            user_message,
        ],
    }

    try:
        response = httpx.post(url, json=body, timeout=settings.ai_timeout_seconds)
    except httpx.HTTPError as exc:
        raise AIError(
            f"Could not reach Ollama at {settings.ollama_base_url}. "
            "Make sure Ollama is running (it usually starts automatically "
            "after install)."
        ) from exc

    if response.status_code == 404:
        raise AIError(
            f"Model '{model}' is not available on this Ollama server. "
            f"Run `ollama pull {model}` in a terminal and try again."
        )
    if response.status_code >= 400:
        raise AIError(f"Ollama responded with HTTP {response.status_code}: {response.text}")

    data = response.json()
    message = (data.get("message") or {}).get("content") or ""
    if not message:
        raise AIError("Ollama returned an empty response.")
    return message


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
            raise AIError("AI response was not valid JSON. Try again.")
        return json.loads(match.group(0))


def _level_from_score(score: float) -> str:
    if score >= 70:
        return "high"
    if score >= 40:
        return "medium"
    return "low"


def _coerce_list(value: Any, limit: int = 10) -> list[str]:
    if value is None:
        return []
    if isinstance(value, list):
        items = value
    else:
        items = [value]
    return [str(item).strip() for item in items if str(item).strip()][:limit]


def _normalise(payload: dict[str, Any], *, model: str, raw: str) -> AIResult:
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

    document_type = str(payload.get("document_type", "unknown")).strip().lower() or "unknown"
    reasoning = str(payload.get("reasoning", "")).strip() or "No reasoning provided."

    return AIResult(
        document_type=document_type,
        key_findings=_coerce_list(payload.get("key_findings")),
        red_flags=_coerce_list(payload.get("red_flags")),
        positive_signals=_coerce_list(payload.get("positive_signals")),
        risk_score=score,
        risk_level=level,
        recommendation=recommendation,
        reasoning=reasoning,
        provider="ollama",
        model=model,
        raw_response=raw,
    )


def check_health() -> dict[str, Any]:
    url = f"{settings.ollama_base_url.rstrip('/')}/api/tags"
    try:
        response = httpx.get(url, timeout=5)
        response.raise_for_status()
    except httpx.HTTPError as exc:
        return {
            "ollama_reachable": False,
            "text_model": settings.text_model,
            "vision_model": settings.vision_model,
            "text_model_pulled": False,
            "vision_model_pulled": False,
            "base_url": settings.ollama_base_url,
            "message": f"Cannot reach Ollama: {exc}",
        }

    data = response.json() or {}
    models = {m.get("name", "") for m in (data.get("models") or [])}

    def _pulled(name: str) -> bool:
        if not name:
            return False
        return name in models or any(m.startswith(name + ":") or m.split(":")[0] == name.split(":")[0] for m in models)

    return {
        "ollama_reachable": True,
        "text_model": settings.text_model,
        "vision_model": settings.vision_model,
        "text_model_pulled": _pulled(settings.text_model),
        "vision_model_pulled": _pulled(settings.vision_model),
        "base_url": settings.ollama_base_url,
        "message": None,
    }
