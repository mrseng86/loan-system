# One-click local launcher for Windows PowerShell.
# Creates a virtualenv on first run, installs deps, then starts the server.

$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

if (-not (Test-Path ".venv")) {
    Write-Host "Creating Python virtualenv (.venv)..."
    python -m venv .venv
}

& .\.venv\Scripts\Activate.ps1

Write-Host "Installing / updating dependencies..."
pip install --quiet -r requirements.txt

Write-Host ""
Write-Host "Starting Local Risk Reviewer at http://localhost:8080"
Write-Host "Press Ctrl+C to stop."
Write-Host ""

python -m uvicorn app.main:app --host 127.0.0.1 --port 8080
