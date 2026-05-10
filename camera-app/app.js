// ============================================================================
// 构图与姿势引导库
// 每个 guide 用 SVG 在 100x100 viewBox 上绘制，preserveAspectRatio=none 拉伸到画面
// ============================================================================

const GUIDES = [
  {
    id: "thirds",
    name: "三分构图",
    tip: "把人脸放在上 1/3 横线（黄色），身体压在左/右纵线",
    svg: `
      <line x1="33.3" y1="0" x2="33.3" y2="100" stroke="white" stroke-width="0.2" stroke-dasharray="1.5 1.5" opacity="0.7"/>
      <line x1="66.7" y1="0" x2="66.7" y2="100" stroke="white" stroke-width="0.2" stroke-dasharray="1.5 1.5" opacity="0.7"/>
      <line x1="0" y1="33.3" x2="100" y2="33.3" stroke="#ffd700" stroke-width="0.4"/>
      <line x1="0" y1="66.7" x2="100" y2="66.7" stroke="white" stroke-width="0.2" stroke-dasharray="1.5 1.5" opacity="0.7"/>
      <circle cx="33.3" cy="33.3" r="0.7" fill="#ffd700"/>
      <circle cx="66.7" cy="33.3" r="0.7" fill="#ffd700"/>
    `,
  },
  {
    id: "golden",
    name: "黄金分割",
    tip: "眼睛放在 38% 高度，比三分更有古典感",
    svg: `
      <line x1="38.2" y1="0" x2="38.2" y2="100" stroke="white" stroke-width="0.2" stroke-dasharray="1.5 1.5" opacity="0.6"/>
      <line x1="61.8" y1="0" x2="61.8" y2="100" stroke="white" stroke-width="0.2" stroke-dasharray="1.5 1.5" opacity="0.6"/>
      <line x1="0" y1="38.2" x2="100" y2="38.2" stroke="#ffd700" stroke-width="0.4"/>
      <text x="40" y="37" fill="#ffd700" font-size="2.6">眼睛</text>
    `,
  },
  {
    id: "fullbody",
    name: "全身构图",
    tip: "头顶留 8% 空白，脚底留 5%，膝盖处不要切",
    svg: `
      <rect x="20" y="3" width="60" height="92" fill="none" stroke="white" stroke-width="0.3" stroke-dasharray="1 0.6"/>
      <line x1="20" y1="33" x2="80" y2="33" stroke="#ffd700" stroke-width="0.4"/>
      <text x="21" y="32" fill="#ffd700" font-size="2.4">眼</text>
      <line x1="30" y1="40" x2="70" y2="40" stroke="white" stroke-width="0.2" opacity="0.6" stroke-dasharray="1 1"/>
      <text x="21" y="40" fill="white" font-size="2" opacity="0.6">肩</text>
      <line x1="35" y1="60" x2="65" y2="60" stroke="white" stroke-width="0.2" opacity="0.6" stroke-dasharray="1 1"/>
      <text x="21" y="60" fill="white" font-size="2" opacity="0.6">腰</text>
      <line x1="32" y1="80" x2="68" y2="80" stroke="#ff6464" stroke-width="0.25" opacity="0.7"/>
      <text x="21" y="80" fill="#ff6464" font-size="2" opacity="0.85">膝忌切</text>
      <line x1="30" y1="95" x2="70" y2="95" stroke="white" stroke-width="0.2" opacity="0.5" stroke-dasharray="1 1"/>
      <text x="21" y="95" fill="white" font-size="2" opacity="0.6">脚</text>
    `,
  },
  {
    id: "halfbody",
    name: "半身构图",
    tip: "切在腰和大腿中间，眼睛在 25% 线，避开手腕肘部切",
    svg: `
      <rect x="15" y="3" width="70" height="94" fill="none" stroke="white" stroke-width="0.3" stroke-dasharray="1 0.6"/>
      <line x1="15" y1="25" x2="85" y2="25" stroke="#ffd700" stroke-width="0.4"/>
      <text x="16" y="24" fill="#ffd700" font-size="2.4">眼</text>
      <line x1="30" y1="38" x2="70" y2="38" stroke="white" stroke-width="0.2" opacity="0.6" stroke-dasharray="1 1"/>
      <text x="16" y="38" fill="white" font-size="2" opacity="0.7">肩</text>
      <line x1="22" y1="80" x2="78" y2="80" stroke="#9affc4" stroke-width="0.3"/>
      <text x="16" y="79" fill="#9affc4" font-size="2.2">切此</text>
      <line x1="22" y1="65" x2="78" y2="65" stroke="#ff6464" stroke-width="0.2" opacity="0.5" stroke-dasharray="0.5 0.5"/>
      <text x="16" y="65" fill="#ff6464" font-size="2" opacity="0.7">肘忌切</text>
    `,
  },
  {
    id: "headshot",
    name: "头肩特写",
    tip: "微俯拍（10-20度），眼睛在 30% 线，藏双下巴显大眼",
    svg: `
      <ellipse cx="50" cy="40" rx="20" ry="25" fill="none" stroke="white" stroke-width="0.3" stroke-dasharray="1 0.6"/>
      <line x1="0" y1="30" x2="100" y2="30" stroke="#ffd700" stroke-width="0.4"/>
      <text x="2" y="29" fill="#ffd700" font-size="2.4">眼睛</text>
      <line x1="0" y1="55" x2="100" y2="55" stroke="white" stroke-width="0.2" opacity="0.5" stroke-dasharray="1 1"/>
      <text x="2" y="55" fill="white" font-size="2" opacity="0.6">下巴</text>
      <line x1="20" y1="85" x2="80" y2="85" stroke="#9affc4" stroke-width="0.3"/>
      <text x="2" y="85" fill="#9affc4" font-size="2.2">肩切此</text>
      <text x="50" y="14" text-anchor="middle" fill="white" font-size="2.5" opacity="0.7">↓ 微俯拍</text>
    `,
  },
  {
    id: "lookback",
    name: "回眸",
    tip: "肩膀转 45°，下巴微收，眼神看镜头，留白在脸方向",
    svg: `
      <rect x="22" y="3" width="56" height="92" fill="none" stroke="white" stroke-width="0.3" stroke-dasharray="1 0.6"/>
      <line x1="0" y1="33.3" x2="100" y2="33.3" stroke="#ffd700" stroke-width="0.3" opacity="0.7"/>
      <path d="M 50 35 Q 48 50 53 70 Q 50 85 52 95" fill="none" stroke="#ffd700" stroke-width="0.5" opacity="0.8"/>
      <circle cx="50" cy="30" r="6" fill="none" stroke="#ffd700" stroke-width="0.4"/>
      <text x="50" y="20" text-anchor="middle" fill="#ffd700" font-size="2.4">回头看我 ↗</text>
      <text x="78" y="50" fill="white" font-size="2" opacity="0.7">→ 留白方向</text>
    `,
  },
  {
    id: "lean",
    name: "倚墙",
    tip: "单肩靠墙，前脚贴近后脚交叉，重心放后腿，仰拍显腿长",
    svg: `
      <rect x="22" y="3" width="56" height="92" fill="none" stroke="white" stroke-width="0.3" stroke-dasharray="1 0.6"/>
      <line x1="78" y1="0" x2="78" y2="100" stroke="white" stroke-width="0.6" opacity="0.5"/>
      <text x="80" y="50" fill="white" font-size="2.2" opacity="0.7">墙</text>
      <line x1="60" y1="20" x2="55" y2="95" stroke="#ffd700" stroke-width="0.5" opacity="0.85"/>
      <circle cx="60" cy="20" r="5" fill="none" stroke="#ffd700" stroke-width="0.4"/>
      <line x1="55" y1="95" x2="50" y2="98" stroke="#ffd700" stroke-width="0.5"/>
      <line x1="55" y1="95" x2="48" y2="98" stroke="#ffd700" stroke-width="0.5"/>
      <text x="32" y="48" fill="white" font-size="2.2" opacity="0.7">↑ 仰拍 15°</text>
    `,
  },
  {
    id: "walking",
    name: "假装走路",
    tip: "后脚踮起，前脚自然落，眼神看远方，相机放低拍",
    svg: `
      <rect x="20" y="3" width="60" height="92" fill="none" stroke="white" stroke-width="0.3" stroke-dasharray="1 0.6"/>
      <line x1="0" y1="33.3" x2="100" y2="33.3" stroke="#ffd700" stroke-width="0.3" opacity="0.7"/>
      <line x1="50" y1="20" x2="50" y2="80" stroke="#ffd700" stroke-width="0.5" opacity="0.85"/>
      <circle cx="50" cy="20" r="5" fill="none" stroke="#ffd700" stroke-width="0.4"/>
      <line x1="50" y1="80" x2="42" y2="92" stroke="#ffd700" stroke-width="0.5"/>
      <line x1="50" y1="80" x2="58" y2="95" stroke="#ffd700" stroke-width="0.5"/>
      <text x="40" y="98" fill="#ffd700" font-size="2.2" text-anchor="end">前脚 ↘</text>
      <text x="60" y="98" fill="white" font-size="2" opacity="0.6">↙ 后脚踮</text>
      <text x="50" y="14" text-anchor="middle" fill="white" font-size="2.4" opacity="0.7">看向远方 →</text>
    `,
  },
  {
    id: "sit",
    name: "坐姿翘腿",
    tip: "远腿叠近腿，脚尖绷直延伸线条，平拍",
    svg: `
      <rect x="15" y="10" width="70" height="85" fill="none" stroke="white" stroke-width="0.3" stroke-dasharray="1 0.6"/>
      <line x1="0" y1="33" x2="100" y2="33" stroke="#ffd700" stroke-width="0.3" opacity="0.7"/>
      <circle cx="50" cy="22" r="4.5" fill="none" stroke="#ffd700" stroke-width="0.4"/>
      <line x1="50" y1="27" x2="50" y2="55" stroke="#ffd700" stroke-width="0.5" opacity="0.85"/>
      <line x1="50" y1="55" x2="78" y2="68" stroke="#ffd700" stroke-width="0.5"/>
      <line x1="78" y1="68" x2="30" y2="80" stroke="#ffd700" stroke-width="0.5"/>
      <line x1="30" y1="80" x2="22" y2="92" stroke="#ffd700" stroke-width="0.5"/>
      <text x="20" y="92" fill="#ffd700" font-size="2.2" text-anchor="end">脚尖↙</text>
    `,
  },
  {
    id: "squat",
    name: "蹲姿",
    tip: "半蹲膝盖并拢，手肘搭膝，下巴抬，平拍",
    svg: `
      <rect x="20" y="20" width="60" height="78" fill="none" stroke="white" stroke-width="0.3" stroke-dasharray="1 0.6"/>
      <line x1="0" y1="38" x2="100" y2="38" stroke="#ffd700" stroke-width="0.3" opacity="0.7"/>
      <circle cx="50" cy="32" r="5" fill="none" stroke="#ffd700" stroke-width="0.4"/>
      <line x1="50" y1="37" x2="50" y2="65" stroke="#ffd700" stroke-width="0.5" opacity="0.85"/>
      <line x1="50" y1="65" x2="40" y2="80" stroke="#ffd700" stroke-width="0.5"/>
      <line x1="50" y1="65" x2="60" y2="80" stroke="#ffd700" stroke-width="0.5"/>
      <line x1="40" y1="80" x2="35" y2="92" stroke="#ffd700" stroke-width="0.5"/>
      <line x1="60" y1="80" x2="65" y2="92" stroke="#ffd700" stroke-width="0.5"/>
      <text x="50" y="14" text-anchor="middle" fill="white" font-size="2.4" opacity="0.7">下巴抬高 ↑</text>
    `,
  },
  {
    id: "negspace",
    name: "留白小人",
    tip: "人小景大，人放在 1/3 线上，留白在脸朝向",
    svg: `
      <line x1="33.3" y1="0" x2="33.3" y2="100" stroke="white" stroke-width="0.2" stroke-dasharray="1.5 1.5" opacity="0.5"/>
      <line x1="66.7" y1="0" x2="66.7" y2="100" stroke="white" stroke-width="0.2" stroke-dasharray="1.5 1.5" opacity="0.5"/>
      <line x1="0" y1="66.7" x2="100" y2="66.7" stroke="#ffd700" stroke-width="0.4"/>
      <circle cx="33.3" cy="60" r="2" fill="none" stroke="#ffd700" stroke-width="0.4"/>
      <line x1="33.3" y1="62" x2="33.3" y2="72" stroke="#ffd700" stroke-width="0.4"/>
      <text x="60" y="55" fill="white" font-size="2.4" opacity="0.7">→ 留白 60% 在脸前方</text>
    `,
  },
];

// ============================================================================
// DOM
// ============================================================================

const startBtn = document.getElementById("start-btn");
const fallbackBtn = document.getElementById("fallback-btn");
const captureInput = document.getElementById("capture-input");
const closeBtn = document.getElementById("close-btn");
const switchBtn = document.getElementById("switch-btn");
const shutterBtn = document.getElementById("shutter-btn");
const gridBtn = document.getElementById("grid-btn");
const retakeBtn = document.getElementById("retake-btn");
const saveBtn = document.getElementById("save-btn");
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const overlay = document.getElementById("overlay");
const tipEl = document.getElementById("tip");
const previewImg = document.getElementById("preview-img");
const homeScreen = document.getElementById("home");
const cameraScreen = document.getElementById("camera");
const previewScreen = document.getElementById("preview");
const errorEl = document.getElementById("error");
const posesScroll = document.getElementById("poses-scroll");

// ============================================================================
// State
// ============================================================================

let stream = null;
let facingMode = "environment";
let activeGuideIdx = 0;
let overlayVisible = true;
let lastPhotoUrl = null;

// ============================================================================
// Helpers
// ============================================================================

function withTimeout(promise, ms, label) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(label + " 超时（" + ms + "ms）")),
      ms
    );
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      }
    );
  });
}

function showError(msg) {
  errorEl.textContent = msg;
  errorEl.hidden = false;
}

function stopStream() {
  if (stream) {
    stream.getTracks().forEach((t) => t.stop());
    stream = null;
  }
}

function renderPoseChips() {
  posesScroll.innerHTML = "";
  GUIDES.forEach((g, i) => {
    const btn = document.createElement("button");
    btn.className = "pose-chip" + (i === activeGuideIdx ? " active" : "");
    btn.textContent = g.name;
    btn.addEventListener("click", () => {
      activeGuideIdx = i;
      renderPoseChips();
      renderOverlay();
    });
    posesScroll.appendChild(btn);
  });
}

function renderOverlay() {
  if (!overlayVisible) {
    overlay.innerHTML = "";
    tipEl.textContent = "";
    return;
  }
  const guide = GUIDES[activeGuideIdx];
  overlay.innerHTML = guide.svg;
  tipEl.textContent = guide.tip;
}

// ============================================================================
// Camera
// ============================================================================

async function startCamera() {
  errorEl.hidden = true;
  startBtn.disabled = true;
  const original = startBtn.textContent;
  startBtn.textContent = "启动中...";

  try {
    if (!window.isSecureContext) {
      showError("页面不在 HTTPS 下，浏览器禁止访问相机。");
      return;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showError("当前浏览器不支持实时相机，请用底部链接调用系统相机。");
      return;
    }

    stopStream();

    const constraintsList = [
      { video: { facingMode: facingMode }, audio: false },
      { video: true, audio: false },
    ];

    let lastErr = null;
    for (const c of constraintsList) {
      try {
        stream = await withTimeout(
          navigator.mediaDevices.getUserMedia(c),
          8000,
          "相机请求"
        );
        lastErr = null;
        break;
      } catch (err) {
        lastErr = err;
        if (err.name === "NotAllowedError") break;
      }
    }

    if (lastErr || !stream) {
      const err = lastErr || new Error("unknown");
      const code = err.name || "Error";
      if (err.name === "NotAllowedError") {
        showError("相机权限被拒绝。请到 设置 → Safari → 相机 允许。");
      } else if (err.name === "NotFoundError") {
        showError("没找到相机。");
      } else if (err.name === "NotReadableError") {
        showError("相机被其他应用占用。");
      } else {
        showError("无法启动 [" + code + "]：" + (err.message || ""));
      }
      return;
    }

    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "true");
    video.setAttribute("webkit-playsinline", "true");

    homeScreen.hidden = true;
    cameraScreen.hidden = false;
    renderPoseChips();
    renderOverlay();

    try {
      await withTimeout(video.play(), 5000, "视频播放");
    } catch (err) {
      showError("视频播放失败：" + (err.message || err.name));
    }
  } catch (err) {
    showError("意外错误：" + (err.message || String(err)));
  } finally {
    startBtn.disabled = false;
    startBtn.textContent = original;
  }
}

async function switchCamera() {
  facingMode = facingMode === "environment" ? "user" : "environment";
  video.style.transform = facingMode === "user" ? "scaleX(-1)" : "none";
  await startCamera();
  cameraScreen.hidden = false;
  homeScreen.hidden = true;
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
  canvas.toBlob(
    (blob) => {
      if (lastPhotoUrl) URL.revokeObjectURL(lastPhotoUrl);
      lastPhotoUrl = URL.createObjectURL(blob);
      previewImg.src = lastPhotoUrl;
      saveBtn.href = lastPhotoUrl;
      saveBtn.download = `photo-${Date.now()}.jpg`;
      cameraScreen.hidden = true;
      previewScreen.hidden = false;
    },
    "image/jpeg",
    0.92
  );
}

function backToCamera() {
  previewScreen.hidden = true;
  cameraScreen.hidden = false;
}

function closeCamera() {
  stopStream();
  cameraScreen.hidden = true;
  homeScreen.hidden = false;
}

function toggleOverlay() {
  overlayVisible = !overlayVisible;
  gridBtn.style.opacity = overlayVisible ? "1" : "0.4";
  renderOverlay();
}

// Fallback: native camera via input capture
function fallbackCapture() {
  captureInput.click();
}

captureInput.addEventListener("change", (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  if (lastPhotoUrl) URL.revokeObjectURL(lastPhotoUrl);
  lastPhotoUrl = URL.createObjectURL(file);
  previewImg.src = lastPhotoUrl;
  saveBtn.href = lastPhotoUrl;
  saveBtn.download = file.name || `photo-${Date.now()}.jpg`;
  homeScreen.hidden = true;
  previewScreen.hidden = false;
  captureInput.value = "";
});

// ============================================================================
// Wire up
// ============================================================================

startBtn.addEventListener("click", startCamera);
fallbackBtn.addEventListener("click", fallbackCapture);
closeBtn.addEventListener("click", closeCamera);
switchBtn.addEventListener("click", switchCamera);
shutterBtn.addEventListener("click", takePhoto);
gridBtn.addEventListener("click", toggleOverlay);
retakeBtn.addEventListener("click", () => {
  previewScreen.hidden = true;
  if (stream) {
    cameraScreen.hidden = false;
  } else {
    homeScreen.hidden = false;
  }
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopStream();
});
