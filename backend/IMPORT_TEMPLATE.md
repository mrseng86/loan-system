# Bulk Import Template

Use one Excel workbook with these sheet names:

## Sheet 1: `customers`

Required columns:

- `customer_code`
- `full_name`
- `phone`

Optional columns:

- `email`
- `address`
- `national_id`

Example:

| customer_code | full_name          | phone      | email             | address     | national_id |
| --- | --- | --- | --- | --- | --- |
| C001 | Andy Wong Guan Ming | 0168919790 | andy@example.com | Klang       | 980101136047 |

## Sheet 2: `loans`

Required columns:

- `loan_code`
- `customer_code`
- `loan_amount`
- `monthly_interest_rate`
- `one_time_fee_rate`
- `tenure_months`
- `disbursed_at`

Optional columns:

- `installment_amount`
- `status`

Notes:

- `one_time_fee_rate` is the combined one-time fee percent (service + stamping).
- `disbursed_at` should be `YYYY-MM-DD`.
- If `installment_amount` is empty, the system will calculate it with the current formula.

Example:

| loan_code | customer_code | loan_amount | monthly_interest_rate | one_time_fee_rate | tenure_months | installment_amount | disbursed_at | status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| L001 | C001 | 1000 | 3 | 10 | 12 | 140 | 2026-04-01 | active |

## Sheet 3: `repayments`

Required columns:

- `loan_code`
- `amount`

Optional columns:

- `method`
- `paid_at`
- `note`

Notes:

- `paid_at` should be `YYYY-MM-DD HH:MM:SS`
- Add one row per repayment already collected.

Example:

| loan_code | amount | method | paid_at | note |
| --- | --- | --- | --- | --- |
| L001 | 140 | cash | 2026-04-07 10:30:00 | first installment |

## Run the import

From `backend/`:

```powershell
python -m scripts.import_workbook C:\path\to\your-workbook.xlsx
```
