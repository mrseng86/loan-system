import pytest

from app.ai import AIError, _coerce_list, _extract_json_object, _level_from_score, _normalise


def test_extract_json_handles_fenced_output():
    raw = "```json\n{\"risk_score\": 80, \"risk_level\": \"high\"}\n```"
    assert _extract_json_object(raw)["risk_level"] == "high"


def test_extract_json_finds_embedded_object():
    raw = "Here you go: {\"risk_score\": 10, \"risk_level\": \"low\"} thanks."
    assert _extract_json_object(raw)["risk_score"] == 10


def test_extract_json_raises_when_missing():
    with pytest.raises(AIError):
        _extract_json_object("no json here")


def test_level_from_score_thresholds():
    assert _level_from_score(5) == "low"
    assert _level_from_score(55) == "medium"
    assert _level_from_score(85) == "high"


def test_coerce_list_keeps_non_empty_strings():
    assert _coerce_list(["  a  ", "", None, "b"]) == ["a", "b"]
    assert _coerce_list("single item") == ["single item"]
    assert _coerce_list(None) == []


def test_normalise_clamps_score_and_defaults_bad_values():
    result = _normalise(
        {"risk_score": 500, "recommendation": "maybe"},
        model="gemma2:2b",
        raw="{}",
    )
    assert result.risk_score == 100
    assert result.risk_level == "high"
    assert result.recommendation == "review"
    assert result.document_type == "unknown"


def test_normalise_accepts_well_formed_payload():
    result = _normalise(
        {
            "document_type": "pay_slip",
            "risk_score": 20,
            "risk_level": "low",
            "recommendation": "approve",
            "reasoning": "Stable salary for 2 years.",
            "key_findings": ["Employer: ACME", "Net pay RM3500"],
            "red_flags": [],
            "positive_signals": ["Consistent monthly credit"],
        },
        model="gemma2:2b",
        raw="{}",
    )
    assert result.document_type == "pay_slip"
    assert result.risk_score == 20
    assert result.risk_level == "low"
    assert result.recommendation == "approve"
    assert "Employer: ACME" in result.key_findings
    assert "Consistent monthly credit" in result.positive_signals
