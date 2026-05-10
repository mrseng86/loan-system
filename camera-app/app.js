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
  errorEl.hidden = true;
  startBtn.disabled = true;
  const originalLabel = startBtn.textContent;
  startBtn.textContent = "启动中...";

  try {
    if (!window.isSecureContext) {
      showError("页面不在 HTTPS 下，浏览器禁止访问相机。请用 https:// 打开。");
      return;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showError("当前浏览器不支持相机访问。请使用 Safari 或 Chrome。");
      return;
    }

    stopStream();

    const constraintsList = [
      { video: { facingMode: { exact: facingMode } }, audio: false },
      { video: { facingMode: facingMode }, audio: false },
      { video: true, audio: false },
    ];

    let lastErr = null;
    for (const constraints of constraintsList) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        lastErr = null;
        break;
      } catch (err) {
        lastErr = err;
        if (err.name === "NotAllowedError") break;
      }
    }

    if (lastErr || !stream) {
      const err = lastErr || new Error("unknown");
      if (err.name === "NotAllowedError") {
        showError("相机权限被拒绝。请到 设置 → Safari → 相机 允许，或重新加载页面再试。");
      } else if (err.name === "NotFoundError") {
        showError("没有找到相机设备。");
      } else if (err.name === "NotReadableError") {
        showError("相机被其他应用占用，请关闭后重试。");
      } else {
        showError("无法启动相机 [" + err.name + "]：" + (err.message || ""));
      }
      return;
    }

    video.srcObject = stream;
    video.setAttribute("playsinline", "true");
    video.setAttribute("webkit-playsinline", "true");
    video.muted = true;
    video.playsInline = true;

    permissionScreen.hidden = true;
    cameraScreen.hidden = false;

    try {
      await video.play();
    } catch (err) {
      showError("视频播放失败 [" + err.name + "]：" + (err.message || "") + "（点屏幕再试）");
    }
  } catch (err) {
    showError("意外错误 [" + (err.name || "Error") + "]：" + (err.message || String(err)));
  } finally {
    startBtn.disabled = false;
    startBtn.textContent = originalLabel;
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
