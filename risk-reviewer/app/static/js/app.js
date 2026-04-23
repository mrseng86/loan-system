const form = document.getElementById("upload-form");
const submitBtn = document.getElementById("submit-btn");
const submitStatus = document.getElementById("submit-status");
const resultSection = document.getElementById("result-section");
const resultBody = document.getElementById("result-body");
const closeResult = document.getElementById("close-result");
const historyBody = document.getElementById("history-body");
const refreshBtn = document.getElementById("refresh-btn");
const healthBox = document.getElementById("health");

async function refreshHealth() {
  healthBox.textContent = "Checking local AI...";
  healthBox.className = "health";
  try {
    const res = await fetch("/api/health");
    const data = await res.json();
    if (!data.ollama_reachable) {
      healthBox.className = "health bad";
      healthBox.textContent =
        "Ollama is not reachable at " + data.base_url +
        ". Start Ollama (install from https://ollama.com/download).";
      return;
    }
    const missing = [];
    if (!data.text_model_pulled) missing.push(data.text_model);
    if (!data.vision_model_pulled) missing.push(data.vision_model);
    if (missing.length) {
      healthBox.className = "health warn";
      healthBox.textContent =
        "Ollama OK, but these models are not pulled yet: " + missing.join(", ") +
        ". Run `ollama pull " + missing[0] + "` to use them.";
    } else {
      healthBox.className = "health ok";
      healthBox.textContent =
        "Ollama OK. Text model: " + data.text_model + " — Vision model: " + data.vision_model + ".";
    }
  } catch (err) {
    healthBox.className = "health bad";
    healthBox.textContent = "Health check failed: " + err.message;
  }
}

function badge(kind, value) {
  if (!value) return "-";
  const span = document.createElement("span");
  span.className = "badge " + value;
  span.textContent = value;
  return span;
}

function appendBadge(parent, cls, text) {
  const span = document.createElement("span");
  span.className = "badge " + cls;
  span.textContent = text;
  parent.appendChild(span);
  parent.appendChild(document.createTextNode(" "));
}

function appendList(container, title, items) {
  if (!items || !items.length) return;
  const wrap = document.createElement("div");
  const heading = document.createElement("h3");
  heading.textContent = title;
  wrap.appendChild(heading);
  const ul = document.createElement("ul");
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    ul.appendChild(li);
  });
  wrap.appendChild(ul);
  container.appendChild(wrap);
}

function renderResult(review) {
  resultBody.innerHTML = "";

  const grid = document.createElement("div");
  grid.className = "result-grid";

  const head = document.createElement("div");
  head.innerHTML =
    "<strong>File:</strong> " + escapeHtml(review.original_filename) +
    " &nbsp; <strong>Subject:</strong> " + escapeHtml(review.subject_name || "-") +
    " &nbsp; <strong>Document type:</strong> " + escapeHtml(review.document_type || "unknown");
  grid.appendChild(head);

  const scoreRow = document.createElement("div");
  scoreRow.className = "score-row";
  const scoreNum = document.createElement("span");
  scoreNum.className = "score-number";
  scoreNum.textContent = review.risk_score != null ? Math.round(Number(review.risk_score)) + " / 100" : "-";
  scoreRow.appendChild(scoreNum);
  if (review.risk_level) appendBadge(scoreRow, review.risk_level, review.risk_level);
  if (review.recommendation) appendBadge(scoreRow, review.recommendation, review.recommendation);
  grid.appendChild(scoreRow);

  if (review.reasoning) {
    const p = document.createElement("p");
    p.innerHTML = "<strong>Reasoning:</strong> " + escapeHtml(review.reasoning);
    grid.appendChild(p);
  }

  appendList(grid, "Key findings", review.key_findings);
  appendList(grid, "Red flags", review.red_flags);
  appendList(grid, "Positive signals", review.positive_signals);

  const footer = document.createElement("p");
  footer.className = "muted";
  footer.textContent =
    "Reviewed by " + (review.provider || "?") + " / " + (review.model || "?") +
    " at " + new Date(review.created_at).toLocaleString();
  grid.appendChild(footer);

  resultBody.appendChild(grid);
  resultSection.classList.remove("hidden");
  resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[ch]));
}

function formatDate(value) {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

async function refreshHistory() {
  try {
    const res = await fetch("/api/reviews");
    const rows = await res.json();
    historyBody.innerHTML = "";
    if (!rows.length) {
      historyBody.innerHTML = '<tr><td colspan="8" class="muted">No reviews yet.</td></tr>';
      return;
    }
    rows.forEach((row) => {
      const tr = document.createElement("tr");
      const riskCell = row.risk_level
        ? '<span class="badge ' + row.risk_level + '">' +
          row.risk_level + " (" + Math.round(Number(row.risk_score || 0)) + ")</span>"
        : "-";
      const recCell = row.recommendation
        ? '<span class="badge ' + row.recommendation + '">' + row.recommendation + "</span>"
        : "-";
      tr.innerHTML =
        "<td>" + row.id + "</td>" +
        "<td>" + formatDate(row.created_at) + "</td>" +
        "<td>" + escapeHtml(row.subject_name || "-") + "</td>" +
        '<td><a href="/api/reviews/' + row.id + '/file" target="_blank">' +
        escapeHtml(row.original_filename) + "</a></td>" +
        "<td>" + escapeHtml(row.document_type || "-") + "</td>" +
        "<td>" + riskCell + "</td>" +
        "<td>" + recCell + "</td>" +
        '<td><button class="secondary" data-open="' + row.id + '">Open</button>' +
        ' <button class="danger" data-delete="' + row.id + '">Delete</button></td>';
      historyBody.appendChild(tr);
    });
  } catch (err) {
    historyBody.innerHTML =
      '<tr><td colspan="8" class="muted">Failed to load history: ' + escapeHtml(err.message) + "</td></tr>";
  }
}

historyBody.addEventListener("click", async (event) => {
  const openId = event.target.getAttribute("data-open");
  const deleteId = event.target.getAttribute("data-delete");
  if (openId) {
    const res = await fetch("/api/reviews/" + openId);
    if (res.ok) {
      renderResult(await res.json());
    }
  } else if (deleteId) {
    if (!confirm("Delete review #" + deleteId + "?")) return;
    await fetch("/api/reviews/" + deleteId, { method: "DELETE" });
    refreshHistory();
  }
});

closeResult.addEventListener("click", () => resultSection.classList.add("hidden"));
refreshBtn.addEventListener("click", refreshHistory);

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  submitStatus.className = "status";
  submitStatus.textContent = "Uploading and analysing (first run may take a while)...";
  submitBtn.disabled = true;

  const formData = new FormData(form);
  try {
    const res = await fetch("/api/reviews", { method: "POST", body: formData });
    if (!res.ok) {
      const detail = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(detail.detail || res.statusText);
    }
    const review = await res.json();
    submitStatus.textContent = "Done.";
    renderResult(review);
    form.reset();
    refreshHistory();
  } catch (err) {
    submitStatus.className = "status error";
    submitStatus.textContent = "Failed: " + err.message;
  } finally {
    submitBtn.disabled = false;
  }
});

refreshHealth();
refreshHistory();
