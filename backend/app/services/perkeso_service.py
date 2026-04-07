import json
import re
from datetime import date, timedelta

import httpx

from app.core.config import settings
from app.schemas.perkeso import PerkesoEmploymentRecord, PerkesoQueryResponse


def _format_month(value: date) -> str:
    return value.strftime("%Y-%m")


def _end_of_month(value: date) -> date:
    first_of_next_month = (value.replace(day=28) + timedelta(days=4)).replace(day=1)
    return first_of_next_month - timedelta(days=1)


def _add_months(value: date, months: int) -> date:
    month_index = value.month - 1 + months
    year = value.year + month_index // 12
    month = month_index % 12 + 1
    return date(year, month, 1)


def normalize_employment_rows(raw_rows: list[dict]) -> list[PerkesoEmploymentRecord]:
    normalized_rows: list[PerkesoEmploymentRecord] = []

    for raw_row in raw_rows:
        company = (raw_row.get("EMPLOYERNAME") or raw_row.get("employername") or "").strip()
        start = (raw_row.get("EMPLOYMENTSTARTDATE") or raw_row.get("employmentstartdate") or "").strip()
        paid = int(raw_row.get("PAID_CONTRIBUTION_COUNT") or raw_row.get("paid_contribution_count") or 0)

        start_month = start[:7] if start else ""
        last_month = "-"
        last_work_day = "-"
        estimated_loe = "-"

        if start_month and paid > 0:
            start_date = date.fromisoformat(f"{start_month}-01")
            last_contribution_month = _add_months(start_date, paid - 1)
            month_end = _end_of_month(last_contribution_month)
            loe_date = month_end + timedelta(days=1)

            last_month = _format_month(last_contribution_month)
            last_work_day = month_end.isoformat()
            estimated_loe = loe_date.isoformat()

        normalized_rows.append(
            PerkesoEmploymentRecord(
                company=company,
                start_month=start_month,
                paid_contribution_count=paid,
                last_contribution_month=last_month,
                estimated_last_working_day=last_work_day,
                estimated_loe=estimated_loe,
            )
        )

    normalized_rows.sort(key=lambda row: row.start_month or "", reverse=True)
    return normalized_rows


def _extract_csrf_tokens(html: str) -> tuple[str, str]:
    csrf_match = re.search(r'<meta name="_csrf" content="([^"]+)"', html)
    csrf_header_match = re.search(r'<meta name="_csrf_header" content="([^"]+)"', html)
    if not csrf_match or not csrf_header_match:
        raise ValueError("PERKESO page did not return CSRF tokens.")
    return csrf_match.group(1), csrf_header_match.group(1)


def query_perkeso(national_id: str, legacy_id: str = "") -> PerkesoQueryResponse:
    try:
        base_url = settings.perkeso_check_url.rsplit("/", 1)[0] + "/"
        with httpx.Client(follow_redirects=True, timeout=settings.perkeso_timeout_ms / 1000, trust_env=False) as client:
            page_response = client.get(settings.perkeso_check_url)
            page_response.raise_for_status()
            csrf_token, csrf_header = _extract_csrf_tokens(page_response.text)
            headers = {csrf_header: csrf_token}

            encrypted_response = client.post(
                base_url + "encrypt",
                data={"raw": json.dumps([national_id, legacy_id])},
                headers=headers,
            )
            encrypted_response.raise_for_status()
            encrypted_values = encrypted_response.json()
            if not isinstance(encrypted_values, list) or len(encrypted_values) < 2:
                raise ValueError("PERKESO encryption response was invalid.")

            eligibility_response = client.post(
                base_url + "isEligible",
                data={"newIc": encrypted_values[0], "idNo": encrypted_values[1]},
                headers=headers,
            )
            eligibility_response.raise_for_status()
            raw_records = eligibility_response.json()
    except httpx.TimeoutException as exc:
        raise RuntimeError("PERKESO query timed out. Please try again.") from exc
    except httpx.HTTPError as exc:
        raise RuntimeError(f"PERKESO query failed: {exc}") from exc

    if not raw_records:
        raise ValueError("No PERKESO record was returned for this IC number.")

    customer_name = (raw_records[0].get("NAME") or "").strip()
    if not customer_name:
        raise ValueError("PERKESO response did not include the customer name.")

    records = normalize_employment_rows(raw_records)

    return PerkesoQueryResponse(national_id=national_id, customer_name=customer_name, records=records)
