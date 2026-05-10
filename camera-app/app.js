const startBtn = document.getElementById("start-btn");
const switchBtn = document.getElementById("switch-btn");
const shutterBtn = document.getElementById("shutter-btn");
const retakeBtn = document.getElementById("retake-btn");
const saveBtn = document.getElementById("save-btn");
const downloadBtn = document.getElementById("download-btn");
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const previewImg = document.getElementById("preview-img");
const permissionScreen = document.getElementById("permission");
const cameraScreen = document.getElementById("camera");
const previewScreen = document.getElementById("preview");
const errorEl = document.getElementById("error");

let stream = null;
let facingMode = "environment";
let lastPhotoDataUrl = null;

async function startCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showError("当前浏览器不支持相机访问。请使用 Safari 或 Chrome。");
    return;
  }

  stopStream();

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: facingMode } },
      audio: false,
    });
    video.srcObject = stream;
    permissionScreen.hidden = true;
    cameraScreen.hidden = false;
  } catch (err) {
    if (err.name === "NotAllowedError") {
      showError("相机权限被拒绝。请到浏览器设置中允许访问相机。");
    } else if (err.name === "NotFoundError") {
      showError("没有找到相机设备。");
    } else if (err.name === "NotReadableError") {
      showError("相机被其他应用占用。");
    } else {
      showError("无法启动相机：" + err.message);
    }
  }
}

function stopStream() {
  if (stream) {
    stream.getTracks().forEach((t) => t.stop());
    stream = null;
  }
}

function showError(msg) {
  errorEl.textContent = msg;
  errorEl.hidden = false;
}

function takePhoto() {
  const w = video.videoWidth;
  const h = video.videoHeight;
  if (!w || !h) return;

  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");

  if (facingMode === "user") {
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(video, 0, 0, w, h);

  lastPhotoDataUrl = canvas.toDataURL("image/png");
  previewImg.src = lastPhotoDataUrl;
  previewScreen.hidden = false;
}

function retake() {
  previewScreen.hidden = true;
  lastPhotoDataUrl = null;
  downloadBtn.hidden = true;
}

function savePhoto() {
  if (!lastPhotoDataUrl) return;
  const a = document.createElement("a");
  a.href = lastPhotoDataUrl;
  a.download = `photo-${Date.now()}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  retake();
}

async function switchCamera() {
  facingMode = facingMode === "environment" ? "user" : "environment";
  video.style.transform = facingMode === "user" ? "scaleX(-1)" : "none";
  await startCamera();
}

startBtn.addEventListener("click", startCamera);
shutterBtn.addEventListener("click", takePhoto);
retakeBtn.addEventListener("click", retake);
saveBtn.addEventListener("click", savePhoto);
switchBtn.addEventListener("click", switchCamera);

document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopStream();
});
