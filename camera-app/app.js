const captureInput = document.getElementById("capture-input");
const galleryInput = document.getElementById("gallery-input");
const homeScreen = document.getElementById("home");
const previewScreen = document.getElementById("preview");
const previewImg = document.getElementById("preview-img");
const retakeBtn = document.getElementById("retake-btn");
const saveBtn = document.getElementById("save-btn");

let currentObjectUrl = null;

function showPreview(file) {
  if (!file) return;
  if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
  currentObjectUrl = URL.createObjectURL(file);
  previewImg.src = currentObjectUrl;
  saveBtn.href = currentObjectUrl;
  saveBtn.download = file.name || `photo-${Date.now()}.jpg`;
  homeScreen.hidden = true;
  previewScreen.hidden = false;
}

function reset() {
  previewScreen.hidden = true;
  homeScreen.hidden = false;
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }
  captureInput.value = "";
  galleryInput.value = "";
}

captureInput.addEventListener("change", (e) => showPreview(e.target.files[0]));
galleryInput.addEventListener("change", (e) => showPreview(e.target.files[0]));
retakeBtn.addEventListener("click", reset);
