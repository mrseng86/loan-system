from app.services.perkeso_service import normalize_employment_rows


def test_normalize_employment_rows_sorts_and_calculates_dates():
    rows = normalize_employment_rows(
        [
            {
                "EMPLOYERNAME": "GOH MOTOR COMPANY",
                "EMPLOYMENTSTARTDATE": "2015-03-12",
                "PAID_CONTRIBUTION_COUNT": 98,
            },
            {
                "EMPLOYERNAME": "KBB MONEY LENDER SDN BHD",
                "EMPLOYMENTSTARTDATE": "2020-09-01",
                "PAID_CONTRIBUTION_COUNT": 66,
            },
        ]
    )

    assert [row.company for row in rows] == ["KBB MONEY LENDER SDN BHD", "GOH MOTOR COMPANY"]
    assert rows[0].last_contribution_month == "2026-02"
    assert rows[0].estimated_last_working_day == "2026-02-28"
    assert rows[0].estimated_loe == "2026-03-01"
    assert rows[1].last_contribution_month == "2023-04"


def test_normalize_employment_rows_handles_missing_dates():
    rows = normalize_employment_rows(
        [
            {
                "EMPLOYERNAME": "NO CONTRIBUTION SDN BHD",
                "EMPLOYMENTSTARTDATE": "",
                "PAID_CONTRIBUTION_COUNT": 0,
            }
        ]
    )

    assert rows[0].last_contribution_month == "-"
    assert rows[0].estimated_last_working_day == "-"
    assert rows[0].estimated_loe == "-"
