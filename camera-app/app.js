// ============================================================================
// 构图与姿势引导库
// 每个 guide 用 SVG 在 100x100 viewBox 上绘制，preserveAspectRatio=none 拉伸到画面
// 虚线 + 半透明影子的人形轮廓示意姿势
// ============================================================================

const FIGURE_STYLE = `stroke="white" stroke-width="0.35" stroke-dasharray="1.4 0.9" fill="rgba(255,255,255,0.08)" opacity="0.85"`;
const FIGURE_LINE = `stroke="white" stroke-width="0.35" stroke-dasharray="1.4 0.9" fill="none" opacity="0.85"`;

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
      <line x1="32" y1="80" x2="68" y2="80" stroke="#ff6464" stroke-width="0.25" opacity="0.7"/>
      <text x="21" y="80" fill="#ff6464" font-size="2" opacity="0.85">膝忌切</text>
      <!-- 人体影子 -->
      <ellipse cx="50" cy="11" rx="3.2" ry="3.2" ${FIGURE_STYLE}/>
      <path d="M 50 14 L 50 17" ${FIGURE_LINE}/>
      <path d="M 44 17 L 56 17 L 54 42 L 46 42 Z" ${FIGURE_STYLE}/>
      <path d="M 46 42 L 54 42 L 56 56 L 44 56 Z" ${FIGURE_STYLE}/>
      <path d="M 47 56 L 46 94 L 44 94 L 43 56 Z" ${FIGURE_STYLE}/>
      <path d="M 53 56 L 54 94 L 56 94 L 57 56 Z" ${FIGURE_STYLE}/>
      <path d="M 44 19 L 40 45 L 42 45 L 46 21 Z" ${FIGURE_STYLE}/>
      <path d="M 56 19 L 60 45 L 58 45 L 54 21 Z" ${FIGURE_STYLE}/>
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
      <line x1="22" y1="80" x2="78" y2="80" stroke="#9affc4" stroke-width="0.3"/>
      <text x="16" y="79" fill="#9affc4" font-size="2.2">切此</text>
      <!-- 人体影子（半身放大）-->
      <ellipse cx="50" cy="18" rx="5" ry="5" ${FIGURE_STYLE}/>
      <path d="M 50 23 L 50 28" ${FIGURE_LINE}/>
      <path d="M 40 28 L 60 28 L 56 60 L 44 60 Z" ${FIGURE_STYLE}/>
      <path d="M 44 60 L 56 60 L 58 78 L 42 78 Z" ${FIGURE_STYLE}/>
      <path d="M 40 31 L 34 65 L 37 65 L 43 33 Z" ${FIGURE_STYLE}/>
      <path d="M 60 31 L 66 65 L 63 65 L 57 33 Z" ${FIGURE_STYLE}/>
    `,
  },
  {
    id: "headshot",
    name: "头肩特写",
    tip: "微俯拍（10-20度），眼睛在 30% 线，藏双下巴显大眼",
    svg: `
      <line x1="0" y1="30" x2="100" y2="30" stroke="#ffd700" stroke-width="0.4"/>
      <text x="2" y="29" fill="#ffd700" font-size="2.4">眼睛</text>
      <line x1="20" y1="85" x2="80" y2="85" stroke="#9affc4" stroke-width="0.3"/>
      <text x="2" y="85" fill="#9affc4" font-size="2.2">肩切此</text>
      <text x="50" y="10" text-anchor="middle" fill="white" font-size="2.5" opacity="0.7">↓ 微俯拍 15°</text>
      <!-- 头肩影子（大）-->
      <ellipse cx="50" cy="35" rx="14" ry="18" ${FIGURE_STYLE}/>
      <path d="M 36 38 Q 36 28 50 25 Q 64 28 64 38" ${FIGURE_LINE}/>
      <path d="M 22 78 Q 26 60 50 58 Q 74 60 78 78 L 78 98 L 22 98 Z" ${FIGURE_STYLE}/>
    `,
  },
  {
    id: "lookback",
    name: "回眸",
    tip: "肩膀转 45°，下巴微收，眼神看镜头，留白在脸方向",
    svg: `
      <line x1="0" y1="33.3" x2="100" y2="33.3" stroke="#ffd700" stroke-width="0.3" opacity="0.7"/>
      <text x="78" y="50" fill="white" font-size="2" opacity="0.7">→ 留白方向</text>
      <text x="50" y="10" text-anchor="middle" fill="#ffd700" font-size="2.6">回头看我 ↗</text>
      <!-- 背影人形，头转 45° 向镜头方向 -->
      <ellipse cx="48" cy="14" rx="4.5" ry="4" ${FIGURE_STYLE} transform="rotate(15 48 14)"/>
      <path d="M 44 8 Q 42 16 44 22 Q 48 18 52 16" fill="rgba(255,255,255,0.15)" stroke="white" stroke-width="0.3" stroke-dasharray="1 0.6" opacity="0.7"/>
      <path d="M 49 18 L 50 22" ${FIGURE_LINE}/>
      <path d="M 42 22 L 58 22 L 56 48 L 44 48 Z" ${FIGURE_STYLE}/>
      <path d="M 44 48 L 56 48 L 58 62 L 42 62 Z" ${FIGURE_STYLE}/>
      <path d="M 46 62 L 45 95 L 42 95 L 41 62 Z" ${FIGURE_STYLE}/>
      <path d="M 54 62 L 55 95 L 58 95 L 59 62 Z" ${FIGURE_STYLE}/>
      <path d="M 42 24 L 38 50 L 40 50 L 44 26 Z" ${FIGURE_STYLE}/>
      <path d="M 58 24 L 62 50 L 60 50 L 56 26 Z" ${FIGURE_STYLE}/>
    `,
  },
  {
    id: "lean",
    name: "倚墙",
    tip: "单肩靠墙，前脚贴近后脚交叉，重心放后腿，仰拍显腿长",
    svg: `
      <line x1="78" y1="0" x2="78" y2="100" stroke="white" stroke-width="0.6" opacity="0.5"/>
      <text x="80" y="50" fill="white" font-size="2.2" opacity="0.7">墙</text>
      <text x="20" y="10" fill="white" font-size="2.2" opacity="0.7">↑ 仰拍 15°</text>
      <!-- 倾斜身体靠墙，整体往墙倾 -->
      <g transform="rotate(-8 60 50)">
        <ellipse cx="60" cy="14" rx="3.5" ry="3.5" ${FIGURE_STYLE}/>
        <path d="M 60 17 L 60 20" ${FIGURE_LINE}/>
        <path d="M 54 20 L 66 20 L 64 44 L 56 44 Z" ${FIGURE_STYLE}/>
        <path d="M 56 44 L 64 44 L 66 58 L 54 58 Z" ${FIGURE_STYLE}/>
        <!-- 后腿（直，靠墙侧）-->
        <path d="M 63 58 L 64 92 L 61 92 L 60 58 Z" ${FIGURE_STYLE}/>
        <!-- 前腿交叉 -->
        <path d="M 57 58 Q 56 76 60 92 L 57 92 Q 53 76 54 58 Z" ${FIGURE_STYLE}/>
        <path d="M 54 22 L 50 48 L 52 48 L 56 24 Z" ${FIGURE_STYLE}/>
        <path d="M 66 22 L 70 48 L 68 48 L 64 24 Z" ${FIGURE_STYLE}/>
      </g>
    `,
  },
  {
    id: "walking",
    name: "假装走路",
    tip: "后脚踮起，前脚自然落，眼神看远方，相机放低拍",
    svg: `
      <line x1="0" y1="33.3" x2="100" y2="33.3" stroke="#ffd700" stroke-width="0.3" opacity="0.7"/>
      <text x="50" y="10" text-anchor="middle" fill="white" font-size="2.4" opacity="0.7">看向远方 →</text>
      <ellipse cx="50" cy="14" rx="3.2" ry="3.2" ${FIGURE_STYLE}/>
      <path d="M 50 17 L 50 20" ${FIGURE_LINE}/>
      <path d="M 44 20 L 56 20 L 54 44 L 46 44 Z" ${FIGURE_STYLE}/>
      <path d="M 46 44 L 54 44 L 56 58 L 44 58 Z" ${FIGURE_STYLE}/>
      <!-- 前腿伸出（左）-->
      <path d="M 47 58 Q 44 78 41 92 L 38 92 Q 41 78 44 58 Z" ${FIGURE_STYLE}/>
      <!-- 后腿踮起（右）-->
      <path d="M 53 58 Q 56 76 59 88 L 57 92 L 55 89 Q 53 76 50 58 Z" ${FIGURE_STYLE}/>
      <path d="M 44 22 Q 38 38 36 46 L 38 46 Q 41 38 46 24 Z" ${FIGURE_STYLE}/>
      <path d="M 56 22 Q 62 36 64 44 L 62 44 Q 59 36 54 24 Z" ${FIGURE_STYLE}/>
    `,
  },
  {
    id: "sit",
    name: "坐姿翘腿",
    tip: "远腿叠近腿，脚尖绷直延伸线条，平拍",
    svg: `
      <line x1="0" y1="33" x2="100" y2="33" stroke="#ffd700" stroke-width="0.3" opacity="0.7"/>
      <ellipse cx="50" cy="20" rx="3.5" ry="3.5" ${FIGURE_STYLE}/>
      <path d="M 50 23 L 50 27" ${FIGURE_LINE}/>
      <path d="M 44 27 L 56 27 L 54 50 L 46 50 Z" ${FIGURE_STYLE}/>
      <path d="M 46 50 L 54 50 L 58 62 L 42 62 Z" ${FIGURE_STYLE}/>
      <!-- 翘腿：上腿水平、下腿垂直 -->
      <path d="M 56 60 Q 70 60 76 64 Q 80 67 78 70 Q 70 67 56 64 Z" ${FIGURE_STYLE}/>
      <path d="M 78 70 Q 76 80 70 90 L 67 90 Q 73 80 75 68 Z" ${FIGURE_STYLE}/>
      <!-- 脚尖绷直 -->
      <path d="M 67 90 L 64 95 L 62 94 L 65 89 Z" ${FIGURE_STYLE}/>
      <path d="M 44 62 L 42 84 L 39 84 L 41 62 Z" ${FIGURE_STYLE}/>
      <path d="M 44 28 L 38 50 L 40 50 L 46 30 Z" ${FIGURE_STYLE}/>
      <path d="M 56 28 L 62 50 L 60 50 L 54 30 Z" ${FIGURE_STYLE}/>
    `,
  },
  {
    id: "squat",
    name: "蹲姿",
    tip: "半蹲膝盖并拢，手肘搭膝，下巴抬，平拍",
    svg: `
      <line x1="0" y1="38" x2="100" y2="38" stroke="#ffd700" stroke-width="0.3" opacity="0.7"/>
      <text x="50" y="10" text-anchor="middle" fill="white" font-size="2.4" opacity="0.7">下巴抬高 ↑</text>
      <ellipse cx="50" cy="30" rx="4" ry="4" ${FIGURE_STYLE}/>
      <path d="M 50 33 L 50 37" ${FIGURE_LINE}/>
      <path d="M 43 37 L 57 37 L 55 58 L 45 58 Z" ${FIGURE_STYLE}/>
      <path d="M 45 58 L 55 58 L 58 68 L 42 68 Z" ${FIGURE_STYLE}/>
      <!-- 蹲下双腿向前折 -->
      <path d="M 46 68 Q 42 76 36 80 L 33 80 Q 39 74 43 68 Z" ${FIGURE_STYLE}/>
      <path d="M 54 68 Q 58 76 64 80 L 67 80 Q 61 74 57 68 Z" ${FIGURE_STYLE}/>
      <!-- 小腿往下 -->
      <path d="M 36 80 L 38 92 L 35 92 L 33 80 Z" ${FIGURE_STYLE}/>
      <path d="M 64 80 L 62 92 L 65 92 L 67 80 Z" ${FIGURE_STYLE}/>
      <!-- 手臂搭膝 -->
      <path d="M 43 38 Q 38 50 36 78 L 38 78 Q 41 50 45 39 Z" ${FIGURE_STYLE}/>
      <path d="M 57 38 Q 62 50 64 78 L 62 78 Q 59 50 55 39 Z" ${FIGURE_STYLE}/>
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
      <text x="60" y="55" fill="white" font-size="2.4" opacity="0.7">→ 留白 60% 在脸前方</text>
      <!-- 小人立在 1/3 线 -->
      <ellipse cx="33.3" cy="55" rx="1.8" ry="1.8" ${FIGURE_STYLE}/>
      <path d="M 33.3 57 L 33.3 59" ${FIGURE_LINE}/>
      <path d="M 30 59 L 36.6 59 L 36 71 L 30.6 71 Z" ${FIGURE_STYLE}/>
      <path d="M 31.5 71 L 30.8 82 L 29 82 L 29.5 71 Z" ${FIGURE_STYLE}/>
      <path d="M 35 71 L 35.8 82 L 37.5 82 L 37 71 Z" ${FIGURE_STYLE}/>
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
