import pytest

from app.services.ai_moderation_service import (
    AIModerationError,
    _extract_json_object,
    _level_from_score,
    _normalize_result,
)


def test_extract_json_object_handles_plain_json():
    payload = _extract_json_object('{"risk_score": 42}')
    assert payload == {"risk_score": 42}


def test_extract_json_object_strips_code_fences():
    raw = "```json\n{\"risk_score\": 70, \"risk_level\": \"high\"}\n```"
    payload = _extract_json_object(raw)
    assert payload["risk_level"] == "high"


def test_extract_json_object_finds_embedded_object():
    raw = "Sure! Here is the JSON: {\"risk_score\": 30, \"risk_level\": \"low\"} done."
    payload = _extract_json_object(raw)
    assert payload["risk_score"] == 30


def test_extract_json_object_raises_when_missing():
    with pytest.raises(AIModerationError):
        _extract_json_object("no json here")


def test_level_from_score_thresholds():
    assert _level_from_score(10) == "low"
    assert _level_from_score(50) == "medium"
    assert _level_from_score(90) == "high"


def test_normalize_result_clamps_score_and_defaults():
    result = _normalize_result(
        {"risk_score": 999, "recommendation": "nope"},
        provider="ollama",
        model="gemma2:2b",
        raw="{}",
    )
    assert result.risk_score == 100
    assert result.risk_level == "high"
    assert result.recommendation == "review"
    assert result.reasoning


def test_normalize_result_keeps_valid_payload():
    result = _normalize_result(
        {
            "risk_score": 25,
            "risk_level": "low",
            "recommendation": "approve",
            "reasoning": "Clean repayment history.",
            "red_flags": [],
            "positive_signals": ["No overdue loans", "Stable employer"],
        },
        provider="ollama",
        model="gemma2:2b",
        raw="{}",
    )
    assert result.risk_score == 25
    assert result.risk_level == "low"
    assert result.recommendation == "approve"
    assert "Stable employer" in result.positive_signals
