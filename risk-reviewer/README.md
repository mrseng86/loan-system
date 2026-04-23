# Local Risk Reviewer

A tiny standalone web app that runs on your own computer. You upload a
customer document (PDF, image, or text), a free local AI model reads it, and
it gives you a risk opinion you can use alongside your manual review.

No cloud. No API keys. No Docker required. No Node.js required.

## What it does

- Accepts PDF / JPG / PNG / WEBP / TXT / CSV / MD up to 25 MB
- PDFs: extracts the text with `pypdf`
- Images: sends the image directly to a local vision model (LLaVA)
- Asks a local Ollama model to return structured JSON:
  document type, key findings, red flags, positive signals, risk score,
  risk level (low / medium / high), and a recommendation
  (approve / review / reject)
- Saves every review into a small SQLite file so you can review history later

Everything stays on this machine. Disk usage: the app itself is ~1 MB. The
models are ~1.6 GB (Gemma 2 2B) and ~4.7 GB (LLaVA 7B).

## One-time setup (Windows)

1. **Install Python 3.11+** — https://www.python.org/downloads/windows/
   (tick "Add python.exe to PATH" during install)
2. **Install Ollama** — https://ollama.com/download
   Starts automatically in the system tray.
3. **Pull the free models** in PowerShell:

   ```powershell
   ollama pull gemma2:2b
   ollama pull llava:7b        # skip this if you only need PDF / text
   ```

4. **Install the app's Python packages:**

   ```powershell
   cd C:\Users\user\Documents\Playground\loan-system\risk-reviewer
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```

   (If PowerShell blocks `Activate.ps1`, run once:
   `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` and try again.)

## Run

```powershell
cd C:\Users\user\Documents\Playground\loan-system\risk-reviewer
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload --port 8080
```

Then open http://localhost:8080 in your browser. Upload a document, give the
customer name, click **Analyse**.

The very first analysis will be slow (Ollama has to load the model into
memory). After that each review takes a few seconds.

## Run (macOS / Linux)

```bash
cd risk-reviewer
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8080
```

## Configuration

All optional. Copy `.env.example` to `.env` to override any of:

| Variable             | Default                          | Purpose                           |
|----------------------|----------------------------------|-----------------------------------|
| `OLLAMA_BASE_URL`    | `http://localhost:11434`         | Where Ollama is running           |
| `TEXT_MODEL`         | `gemma2:2b`                      | Model used for PDFs / text        |
| `VISION_MODEL`       | `llava:7b`                       | Model used for images             |
| `AI_TIMEOUT_SECONDS` | `120`                            | Per-request timeout               |
| `MAX_UPLOAD_MB`      | `25`                             | Upload size limit                 |
| `DATABASE_URL`       | `sqlite:///./data/reviews.db`    | SQLite file path                  |
| `UPLOAD_DIR`         | `./data/uploads`                 | Where original files are kept     |

Want a different model? Any Ollama tag works. Examples:

- Even smaller / faster: `TEXT_MODEL=qwen2.5:1.5b`
- Better reasoning (bigger): `TEXT_MODEL=gemma2:9b`
- Vision alternatives: `VISION_MODEL=llama3.2-vision:11b` or `minicpm-v:8b`

## API

- `GET /api/health` — check Ollama connectivity and whether models are pulled
- `POST /api/reviews` — multipart upload: `file` (required), `subject_name` (optional)
- `GET /api/reviews` — list summaries
- `GET /api/reviews/{id}` — full detail
- `GET /api/reviews/{id}/file` — download the original file
- `DELETE /api/reviews/{id}` — remove a review and its stored file

## Important disclaimer

This tool is **advisory only**. A local 2B / 7B model can misread messy
scans, miss context, or produce confident-sounding mistakes. Always keep a
human in the loop for final credit decisions.

## Tests

```powershell
cd risk-reviewer
.\.venv\Scripts\Activate.ps1
pytest
```
