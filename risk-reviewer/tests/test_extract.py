import base64

import pytest

from app.extract import UnsupportedFileError, extract


def test_plain_text_extraction():
    payload = extract("notes.txt", "text/plain", b"hello world")
    assert payload.kind == "text"
    assert payload.text == "hello world"
    assert payload.image_b64 is None


def test_image_payload_is_base64_encoded():
    raw = b"\x89PNG\r\n\x1a\nfake"
    payload = extract("scan.png", "image/png", raw)
    assert payload.kind == "image"
    assert payload.image_b64 == base64.b64encode(raw).decode("ascii")
    assert payload.text is None


def test_unsupported_content_type_raises():
    with pytest.raises(UnsupportedFileError):
        extract("exec.bin", "application/octet-stream", b"\x00\x01")


def test_classifies_by_extension_when_content_type_missing():
    payload = extract("statement.txt", "", b"line 1\nline 2")
    assert payload.kind == "text"
    assert payload.text == "line 1\nline 2"
