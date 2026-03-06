#!/bin/sh
set -eu

export PYTHONPATH=/app

echo "Waiting for database..."
python -c "import time; from sqlalchemy import create_engine, text; from app.core.config import settings; engine=create_engine(settings.database_url); ok=False
for _ in range(30):
    try:
        with engine.connect() as conn:
            conn.execute(text('SELECT 1'))
        ok=True
        break
    except Exception:
        time.sleep(2)
if not ok:
    raise SystemExit('Database is not ready')"

echo "Running migrations..."
alembic upgrade head

echo "Seeding demo data..."
python /app/scripts/seed.py

echo "Starting API..."
uvicorn main:app --host 0.0.0.0 --port 8000
