#!/usr/bin/env bash
# One-click local launcher for macOS / Linux.
set -euo pipefail
cd "$(dirname "$0")"

if [ ! -d ".venv" ]; then
    echo "Creating Python virtualenv (.venv)..."
    python3 -m venv .venv
fi

# shellcheck disable=SC1091
source .venv/bin/activate

echo "Installing / updating dependencies..."
pip install --quiet -r requirements.txt

echo
echo "Starting Local Risk Reviewer at http://localhost:8080"
echo "Press Ctrl+C to stop."
echo

exec python -m uvicorn app.main:app --host 127.0.0.1 --port 8080
