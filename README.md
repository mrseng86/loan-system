# Loan Management System

Full-stack web application for managing customers, loans, repayments, overdue tracking, and collection actions.

## Stack
- Frontend: React (Vite)
- Backend: FastAPI
- Database: PostgreSQL
- Auth: JWT (role-based: admin, staff, collector)

## Project Structure

```text
loan-management-system/
  backend/
    app/
      api/
      core/
      db/
      models/
      schemas/
      services/
      main.py
    .env.example
    requirements.txt
    main.py
  frontend/
    src/
      api/
      components/
      context/
      pages/
      styles/
    .env.example
    index.html
    package.json
    vite.config.js
  docker-compose.yml
  .gitignore
```

## Features Implemented

1. User login system
- Email + password JWT login
- Role model: admin, staff, collector
- Default admin seeded on startup (`admin@lms.com` / `admin123`)

2. Customer management
- Add customer
- Edit customer
- View customer profiles/list
- PERKESO / EIS lookup by National ID with automatic employment contribution summary

3. Loan management
- Create loan account
- Loan amount, interest, tenure
- Installment auto calculation
- Total payable and balance calculation
- Schedule mode with monthly breakdown:
  opening balance, principal paid, interest paid, service charge, stamp duty, total payment, closing balance

4. Repayment system
- Record repayment
- Auto updates loan paid amount and balance
- Auto closes loan on full repayment

5. Overdue detection
- Auto marks overdue based on next due date
- Calculates days overdue

6. Collection tracking
- Log actions: call, whatsapp, visit, legal notice
- View collection logs

7. Dashboard
- Total loans
- Overdue loans
- Bad debt count
- Repayment statistics

## Run Instructions

### 1) Start backend stack (PostgreSQL + FastAPI)

```bash
docker compose up -d --build postgres backend
```

Backend container startup automatically does:
- wait for PostgreSQL
- run `alembic upgrade head`
- run `python scripts/seed.py`
- start API at `http://localhost:8000`

### 2) Run frontend

```bash
cd frontend
npm.cmd install
copy .env.example .env
npm.cmd run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Database Migration (Alembic)

```bash
docker compose run --rm backend alembic revision --autogenerate -m "your change message"
docker compose run --rm backend alembic upgrade head
```

## Seed Demo Data

```bash
docker compose run --rm backend python scripts/seed.py
```

This creates sample users:
- `admin@lms.com / admin123`
- `staff@lms.com / staff123`
- `collector@lms.com / collector123`

## Tests

### Backend tests

```bash
docker compose --profile test run --rm backend-test
```

### Frontend tests

```bash
cd frontend
npm.cmd install
npm.cmd run test
```

## API Summary

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/users` (admin)
- `GET/POST /api/customers`
- `PUT /api/customers/{id}`
- `GET/POST /api/loans`
- `GET /api/loans/{id}`
- `GET /api/loans/{id}/schedule`
- `GET/POST /api/repayments`
- `GET/POST /api/collections`
- `GET /api/dashboard/stats`

## Notes

- The compose backend uses Alembic migrations (table auto-create is disabled in container env).
- If `docker compose` cannot connect to daemon, start Docker Desktop first.

