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
  // ============== 亲子构图 ==============
  {
    id: "duo-hold",
    name: "亲子·牵手并立",
    tip: "蹲到孩子眼睛高度拍，全身入镜，两人手牵手在画面中心",
    svg: `
      <line x1="33.3" y1="0" x2="33.3" y2="100" stroke="white" stroke-width="0.15" stroke-dasharray="1 1" opacity="0.4"/>
      <line x1="66.7" y1="0" x2="66.7" y2="100" stroke="white" stroke-width="0.15" stroke-dasharray="1 1" opacity="0.4"/>
      <line x1="0" y1="33.3" x2="100" y2="33.3" stroke="#ffd700" stroke-width="0.3" opacity="0.7"/>
      <text x="50" y="10" text-anchor="middle" fill="white" font-size="2.2" opacity="0.7">蹲低拍 ↓ 与孩子同高</text>
      <!-- 大人 -->
      <ellipse cx="36" cy="14" rx="3" ry="3" ${FIGURE_STYLE}/>
      <path d="M 36 17 L 36 19" ${FIGURE_LINE}/>
      <path d="M 31 19 L 41 19 L 39 42 L 33 42 Z" ${FIGURE_STYLE}/>
      <path d="M 33 42 L 39 42 L 40 56 L 32 56 Z" ${FIGURE_STYLE}/>
      <path d="M 34 56 L 33 93 L 31 93 L 31 56 Z" ${FIGURE_STYLE}/>
      <path d="M 38 56 L 39 93 L 41 93 L 41 56 Z" ${FIGURE_STYLE}/>
      <path d="M 31 21 L 27 48 L 29 48 L 33 21 Z" ${FIGURE_STYLE}/>
      <path d="M 41 21 L 45 56 L 47 56 L 43 21 Z" ${FIGURE_STYLE}/>
      <!-- 孩子（更小，肩在大人腰部） -->
      <ellipse cx="62" cy="38" rx="2.4" ry="2.4" ${FIGURE_STYLE}/>
      <path d="M 62 40.4 L 62 42" ${FIGURE_LINE}/>
      <path d="M 58 42 L 66 42 L 65 60 L 59 60 Z" ${FIGURE_STYLE}/>
      <path d="M 59 60 L 65 60 L 66 71 L 58 71 Z" ${FIGURE_STYLE}/>
      <path d="M 60 71 L 59 92 L 57 92 L 57 71 Z" ${FIGURE_STYLE}/>
      <path d="M 64 71 L 65 92 L 67 92 L 67 71 Z" ${FIGURE_STYLE}/>
      <path d="M 58 44 L 53 56 L 55 56 L 60 44 Z" ${FIGURE_STYLE}/>
      <path d="M 66 44 L 70 60 L 72 60 L 68 44 Z" ${FIGURE_STYLE}/>
      <!-- 牵手交点 -->
      <circle cx="49" cy="55" r="1.4" fill="#ffd700" opacity="0.85"/>
      <text x="50" y="51" text-anchor="middle" fill="#ffd700" font-size="2.2">牵手</text>
    `,
  },
  {
    id: "duo-hug",
    name: "亲子·蹲抱",
    tip: "大人蹲到孩子身高，半身构图，捕捉拥抱瞬间和表情",
    svg: `
      <line x1="0" y1="33.3" x2="100" y2="33.3" stroke="#ffd700" stroke-width="0.3" opacity="0.7"/>
      <text x="50" y="10" text-anchor="middle" fill="white" font-size="2.2" opacity="0.7">脸贴脸，眼睛在 1/3 线</text>
      <!-- 大人（蹲下）头偏左 -->
      <ellipse cx="40" cy="28" rx="5" ry="5" ${FIGURE_STYLE}/>
      <path d="M 40 33 L 41 38" ${FIGURE_LINE}/>
      <path d="M 32 38 L 48 38 L 46 62 L 34 62 Z" ${FIGURE_STYLE}/>
      <path d="M 34 62 L 46 62 L 50 80 L 30 80 Z" ${FIGURE_STYLE}/>
      <!-- 蹲下小腿向前折 -->
      <path d="M 30 80 Q 25 88 22 92 L 20 92 Q 23 86 28 78 Z" ${FIGURE_STYLE}/>
      <path d="M 50 80 Q 55 88 58 92 L 56 92 Q 51 86 48 78 Z" ${FIGURE_STYLE}/>
      <!-- 抱孩子的手臂 -->
      <path d="M 48 40 Q 60 42 68 50" ${FIGURE_LINE} stroke-width="0.5"/>
      <!-- 孩子（被抱住，更小） -->
      <ellipse cx="62" cy="32" rx="4" ry="4" ${FIGURE_STYLE}/>
      <path d="M 62 36 L 62 40" ${FIGURE_LINE}/>
      <path d="M 56 40 L 68 40 L 67 60 L 57 60 Z" ${FIGURE_STYLE}/>
      <path d="M 57 60 L 67 60 L 70 75 L 54 75 Z" ${FIGURE_STYLE}/>
      <!-- 孩子小手搭大人 -->
      <path d="M 56 42 Q 50 45 45 50" ${FIGURE_LINE} stroke-width="0.4"/>
    `,
  },
  {
    id: "duo-kiss",
    name: "亲子·亲额头",
    tip: "近景特写，大人低头吻孩子额头，光线打侧脸",
    svg: `
      <line x1="0" y1="33.3" x2="100" y2="33.3" stroke="#ffd700" stroke-width="0.3" opacity="0.7"/>
      <text x="50" y="10" text-anchor="middle" fill="white" font-size="2.2" opacity="0.7">两人头部为画面中心</text>
      <!-- 大人头（顶部偏左，低头） -->
      <ellipse cx="42" cy="28" rx="11" ry="14" ${FIGURE_STYLE} transform="rotate(-15 42 28)"/>
      <!-- 大人肩 -->
      <path d="M 24 60 Q 28 50 42 50 Q 50 50 56 56 L 60 90 L 16 90 Z" ${FIGURE_STYLE}/>
      <!-- 孩子头（右下，仰头被亲） -->
      <ellipse cx="58" cy="42" rx="8" ry="10" ${FIGURE_STYLE} transform="rotate(15 58 42)"/>
      <!-- 接触点 -->
      <circle cx="50" cy="32" r="1.6" fill="#ffd700" opacity="0.85"/>
      <text x="50" y="20" text-anchor="middle" fill="#ffd700" font-size="2.2">💋</text>
      <!-- 孩子肩 -->
      <path d="M 50 60 Q 55 55 64 56 Q 75 58 80 70 L 84 95 L 50 95 Z" ${FIGURE_STYLE}/>
    `,
  },
  {
    id: "duo-lift",
    name: "亲子·举高高",
    tip: "仰拍，大人把孩子举过头顶，背景找蓝天/天花板",
    svg: `
      <text x="50" y="10" text-anchor="middle" fill="white" font-size="2.2" opacity="0.7">仰拍，相机几乎贴地</text>
      <!-- 孩子（顶部，举高） -->
      <ellipse cx="50" cy="14" rx="3.5" ry="3.5" ${FIGURE_STYLE}/>
      <path d="M 44 18 L 56 18 L 55 32 L 45 32 Z" ${FIGURE_STYLE}/>
      <!-- 孩子手臂张开（飞翔感） -->
      <path d="M 44 19 L 32 26 L 33 28 L 45 22 Z" ${FIGURE_STYLE}/>
      <path d="M 56 19 L 68 26 L 67 28 L 55 22 Z" ${FIGURE_STYLE}/>
      <!-- 孩子腿 -->
      <path d="M 46 32 L 44 44 L 46 44 L 48 32 Z" ${FIGURE_STYLE}/>
      <path d="M 54 32 L 56 44 L 54 44 L 52 32 Z" ${FIGURE_STYLE}/>
      <!-- 大人手臂上举到孩子 -->
      <path d="M 36 50 L 47 32 L 49 33 L 38 51 Z" ${FIGURE_STYLE}/>
      <path d="M 64 50 L 53 32 L 51 33 L 62 51 Z" ${FIGURE_STYLE}/>
      <!-- 大人头 -->
      <ellipse cx="50" cy="56" rx="4" ry="4" ${FIGURE_STYLE}/>
      <!-- 大人身体 -->
      <path d="M 42 60 L 58 60 L 56 88 L 44 88 Z" ${FIGURE_STYLE}/>
      <path d="M 44 88 L 56 88 L 58 95 L 42 95 Z" ${FIGURE_STYLE}/>
    `,
  },
  {
    id: "duo-back",
    name: "亲子·背影牵手",
    tip: "从两人后方拍，留白在前方，大人比孩子高一头",
    svg: `
      <line x1="33.3" y1="0" x2="33.3" y2="100" stroke="white" stroke-width="0.15" stroke-dasharray="1 1" opacity="0.4"/>
      <line x1="66.7" y1="0" x2="66.7" y2="100" stroke="white" stroke-width="0.15" stroke-dasharray="1 1" opacity="0.4"/>
      <text x="50" y="10" text-anchor="middle" fill="white" font-size="2.2" opacity="0.7">背影 → 留白在前方</text>
      <!-- 大人背影 -->
      <ellipse cx="36" cy="20" rx="3.5" ry="3.5" ${FIGURE_STYLE}/>
      <path d="M 30 25 L 42 25 L 40 50 L 32 50 Z" ${FIGURE_STYLE}/>
      <path d="M 32 50 L 40 50 L 41 65 L 31 65 Z" ${FIGURE_STYLE}/>
      <path d="M 33 65 L 32 95 L 30 95 L 30 65 Z" ${FIGURE_STYLE}/>
      <path d="M 39 65 L 40 95 L 42 95 L 42 65 Z" ${FIGURE_STYLE}/>
      <path d="M 30 27 L 26 55 L 28 55 L 32 27 Z" ${FIGURE_STYLE}/>
      <path d="M 42 27 L 46 65 L 48 65 L 44 27 Z" ${FIGURE_STYLE}/>
      <!-- 孩子背影（小、矮） -->
      <ellipse cx="56" cy="42" rx="2.7" ry="2.7" ${FIGURE_STYLE}/>
      <path d="M 52 46 L 60 46 L 59 62 L 53 62 Z" ${FIGURE_STYLE}/>
      <path d="M 53 62 L 59 62 L 60 73 L 52 73 Z" ${FIGURE_STYLE}/>
      <path d="M 54 73 L 53 92 L 51 92 L 51 73 Z" ${FIGURE_STYLE}/>
      <path d="M 58 73 L 59 92 L 61 92 L 61 73 Z" ${FIGURE_STYLE}/>
      <path d="M 52 48 L 48 62 L 50 62 L 54 48 Z" ${FIGURE_STYLE}/>
      <path d="M 60 48 L 63 65 L 65 65 L 62 48 Z" ${FIGURE_STYLE}/>
      <!-- 牵手 -->
      <circle cx="46" cy="62" r="1.2" fill="#ffd700" opacity="0.85"/>
      <circle cx="48" cy="62" r="1.2" fill="#ffd700" opacity="0.85"/>
    `,
  },
  {
    id: "duo-look",
    name: "亲子·同看远方",
    tip: "两人背影并立，大景小人，把镜头放在第三分线",
    svg: `
      <line x1="0" y1="33.3" x2="100" y2="33.3" stroke="white" stroke-width="0.2" stroke-dasharray="1.5 1.5" opacity="0.5"/>
      <line x1="0" y1="66.7" x2="100" y2="66.7" stroke="#ffd700" stroke-width="0.4"/>
      <line x1="33.3" y1="0" x2="33.3" y2="100" stroke="white" stroke-width="0.15" stroke-dasharray="1 1" opacity="0.4"/>
      <line x1="66.7" y1="0" x2="66.7" y2="100" stroke="white" stroke-width="0.15" stroke-dasharray="1 1" opacity="0.4"/>
      <text x="50" y="14" text-anchor="middle" fill="white" font-size="2.2" opacity="0.7">大景 / 远方</text>
      <!-- 大人小背影 -->
      <ellipse cx="44" cy="65" rx="2" ry="2" ${FIGURE_STYLE}/>
      <path d="M 41 67 L 47 67 L 46 80 L 42 80 Z" ${FIGURE_STYLE}/>
      <path d="M 42.5 80 L 42 92 L 40.5 92 L 41 80 Z" ${FIGURE_STYLE}/>
      <path d="M 45.5 80 L 46 92 L 47.5 92 L 47 80 Z" ${FIGURE_STYLE}/>
      <!-- 孩子更小背影 -->
      <ellipse cx="55" cy="71" rx="1.5" ry="1.5" ${FIGURE_STYLE}/>
      <path d="M 52.5 73 L 57.5 73 L 57 83 L 53 83 Z" ${FIGURE_STYLE}/>
      <path d="M 53.5 83 L 53 92 L 51.8 92 L 52.2 83 Z" ${FIGURE_STYLE}/>
      <path d="M 56.5 83 L 57 92 L 58.2 92 L 57.8 83 Z" ${FIGURE_STYLE}/>
      <!-- 牵手 -->
      <circle cx="49" cy="78" r="0.8" fill="#ffd700" opacity="0.85"/>
      <circle cx="50" cy="78" r="0.8" fill="#ffd700" opacity="0.85"/>
    `,
  },
  // ============== 女友视角 / 男友必学 ==============
  {
    id: "low-feet",
    name: "低机位脚尖",
    tip: "蹲到脚踝高度，镜头对脚尖向上拍，腿占画面 2/3",
    svg: `
      <text x="50" y="10" text-anchor="middle" fill="white" font-size="2.2" opacity="0.7">↑ 仰拍脚踝高</text>
      <line x1="0" y1="33.3" x2="100" y2="33.3" stroke="white" stroke-width="0.15" stroke-dasharray="1 1" opacity="0.4"/>
      <ellipse cx="50" cy="20" rx="2.4" ry="2.4" ${FIGURE_STYLE}/>
      <path d="M 50 22 L 50 25" ${FIGURE_LINE}/>
      <!-- 缩小上身 -->
      <path d="M 47 25 L 53 25 L 52 33 L 48 33 Z" ${FIGURE_STYLE}/>
      <path d="M 48 33 L 52 33 L 54 40 L 46 40 Z" ${FIGURE_STYLE}/>
      <!-- 放大的腿（占画面 2/3） -->
      <path d="M 47 40 Q 38 70 32 100 L 24 100 Q 32 65 44 40 Z" ${FIGURE_STYLE}/>
      <path d="M 53 40 Q 62 70 68 100 L 76 100 Q 68 65 56 40 Z" ${FIGURE_STYLE}/>
      <text x="50" y="80" text-anchor="middle" fill="#ffd700" font-size="2.4" opacity="0.85">腿占 2/3</text>
    `,
  },
  {
    id: "top-bottom",
    name: "顶天立地",
    tip: "头贴顶、脚踩底，把人拉满整个画面竖屏",
    svg: `
      <rect x="20" y="0" width="60" height="100" fill="none" stroke="#ffd700" stroke-width="0.4"/>
      <text x="50" y="10" text-anchor="middle" fill="#ffd700" font-size="2.4">头贴顶 ↑</text>
      <ellipse cx="50" cy="6" rx="3.5" ry="4" ${FIGURE_STYLE}/>
      <path d="M 50 10 L 50 13" ${FIGURE_LINE}/>
      <path d="M 44 13 L 56 13 L 54 38 L 46 38 Z" ${FIGURE_STYLE}/>
      <path d="M 46 38 L 54 38 L 56 52 L 44 52 Z" ${FIGURE_STYLE}/>
      <path d="M 47 52 L 46 99 L 44 99 L 43 52 Z" ${FIGURE_STYLE}/>
      <path d="M 53 52 L 54 99 L 56 99 L 57 52 Z" ${FIGURE_STYLE}/>
      <path d="M 44 15 L 38 48 L 40 48 L 46 16 Z" ${FIGURE_STYLE}/>
      <path d="M 56 15 L 62 48 L 60 48 L 54 16 Z" ${FIGURE_STYLE}/>
      <text x="50" y="98" text-anchor="middle" fill="#ffd700" font-size="2.4">↓ 脚踩底</text>
    `,
  },
  {
    id: "jump",
    name: "一字马跳跃",
    tip: "起跳瞬间连拍，膝盖伸直脚尖绷直",
    svg: `
      <text x="50" y="10" text-anchor="middle" fill="white" font-size="2.2" opacity="0.7">📸 连拍模式</text>
      <line x1="0" y1="80" x2="100" y2="80" stroke="#ffd700" stroke-width="0.3" stroke-dasharray="1 1" opacity="0.5"/>
      <text x="2" y="79" fill="#ffd700" font-size="2.2" opacity="0.7">地面</text>
      <!-- 跳跃中的人，腿张开 -->
      <ellipse cx="50" cy="28" rx="3.5" ry="3.5" ${FIGURE_STYLE}/>
      <path d="M 44 32 L 56 32 L 54 50 L 46 50 Z" ${FIGURE_STYLE}/>
      <path d="M 46 50 L 54 50 L 56 60 L 44 60 Z" ${FIGURE_STYLE}/>
      <!-- 一字马腿 -->
      <path d="M 48 60 L 24 70 L 22 73 L 47 62 Z" ${FIGURE_STYLE}/>
      <path d="M 52 60 L 76 70 L 78 73 L 53 62 Z" ${FIGURE_STYLE}/>
      <!-- 张开的手臂 -->
      <path d="M 44 34 L 28 26 L 26 28 L 43 36 Z" ${FIGURE_STYLE}/>
      <path d="M 56 34 L 72 26 L 74 28 L 57 36 Z" ${FIGURE_STYLE}/>
    `,
  },
  {
    id: "half-cover",
    name: "半遮脸",
    tip: "手 / 帽檐 / 书挡住半张脸，只露眼睛和额头",
    svg: `
      <line x1="0" y1="33.3" x2="100" y2="33.3" stroke="#ffd700" stroke-width="0.3" opacity="0.7"/>
      <ellipse cx="50" cy="42" rx="18" ry="22" ${FIGURE_STYLE}/>
      <!-- 遮挡物（手） -->
      <path d="M 30 38 L 78 32 L 80 50 L 32 56 Z" fill="rgba(255,255,255,0.18)" stroke="white" stroke-width="0.35" stroke-dasharray="1.4 0.9" opacity="0.85"/>
      <text x="60" y="45" fill="#ffd700" font-size="2.4" opacity="0.85">遮</text>
      <!-- 露出的眼睛 -->
      <circle cx="42" cy="36" r="1" fill="#ffd700"/>
      <text x="20" y="36" fill="#ffd700" font-size="2.2" opacity="0.85">露眼</text>
      <path d="M 25 75 Q 30 65 50 65 Q 70 65 75 75 L 80 98 L 20 98 Z" ${FIGURE_STYLE}/>
    `,
  },
  {
    id: "fingers",
    name: "指缝看",
    tip: "手指张开放眼前，对焦瞳孔，背景虚化",
    svg: `
      <ellipse cx="50" cy="44" rx="20" ry="26" ${FIGURE_STYLE}/>
      <text x="50" y="10" text-anchor="middle" fill="white" font-size="2.2" opacity="0.7">对焦眼睛 · 背景虚化</text>
      <!-- 五指张开 -->
      <path d="M 32 70 L 30 38 L 33 38 L 35 70 Z" ${FIGURE_STYLE}/>
      <path d="M 40 70 L 39 32 L 42 32 L 43 70 Z" ${FIGURE_STYLE}/>
      <path d="M 48 70 L 48 30 L 51 30 L 51 70 Z" ${FIGURE_STYLE}/>
      <path d="M 56 70 L 57 32 L 60 32 L 59 70 Z" ${FIGURE_STYLE}/>
      <path d="M 64 70 L 66 38 L 69 38 L 67 70 Z" ${FIGURE_STYLE}/>
      <path d="M 30 70 L 70 70 L 75 80 L 25 80 Z" ${FIGURE_STYLE}/>
      <!-- 指缝间的眼 -->
      <circle cx="45" cy="40" r="1.2" fill="#ffd700"/>
      <circle cx="55" cy="40" r="1.2" fill="#ffd700"/>
    `,
  },
  {
    id: "hair-turn",
    name: "撩发回头",
    tip: "让她边撩头发边慢转头，抓中途的侧脸",
    svg: `
      <line x1="0" y1="33.3" x2="100" y2="33.3" stroke="#ffd700" stroke-width="0.3" opacity="0.7"/>
      <text x="50" y="10" text-anchor="middle" fill="white" font-size="2.2" opacity="0.7">📸 抓拍中途瞬间</text>
      <!-- 侧脸 -->
      <path d="M 38 28 Q 36 18 50 14 Q 60 14 62 28 Q 60 42 50 44 Q 40 44 38 32 Z" ${FIGURE_STYLE}/>
      <!-- 头发飘起 -->
      <path d="M 38 22 Q 26 28 22 45 Q 28 42 38 38" fill="rgba(255,255,255,0.1)" stroke="white" stroke-width="0.35" stroke-dasharray="1.4 0.9" opacity="0.85"/>
      <!-- 手撩发 -->
      <path d="M 30 42 Q 25 32 28 22 L 32 22 Q 30 30 33 42 Z" ${FIGURE_STYLE}/>
      <text x="20" y="20" fill="#ffd700" font-size="2.2" opacity="0.85">手撩 ↗</text>
      <path d="M 40 48 L 60 48 L 58 75 L 42 75 Z" ${FIGURE_STYLE}/>
      <path d="M 42 75 L 58 75 L 62 95 L 38 95 Z" ${FIGURE_STYLE}/>
    `,
  },
  {
    id: "stairs",
    name: "楼梯回望",
    tip: "她上两级台阶后回头，你蹲低仰拍",
    svg: `
      <text x="50" y="10" text-anchor="middle" fill="white" font-size="2.2" opacity="0.7">↑ 仰拍 + 回头</text>
      <!-- 台阶线 -->
      <path d="M 5 95 L 30 95 L 30 80 L 55 80 L 55 65 L 80 65 L 80 50 L 95 50" fill="none" stroke="white" stroke-width="0.4" opacity="0.5" stroke-dasharray="1.5 1"/>
      <text x="20" y="93" fill="white" font-size="1.8" opacity="0.5">台阶</text>
      <!-- 人在第三级台阶 -->
      <ellipse cx="60" cy="38" rx="3" ry="3" ${FIGURE_STYLE}/>
      <path d="M 60 41 L 60 43" ${FIGURE_LINE}/>
      <path d="M 55 43 L 65 43 L 63 58 L 57 58 Z" ${FIGURE_STYLE}/>
      <path d="M 57 58 L 63 58 L 65 65 L 55 65 Z" ${FIGURE_STYLE}/>
      <path d="M 58 65 L 57 80 L 55 80 L 56 65 Z" ${FIGURE_STYLE}/>
      <path d="M 62 65 L 63 80 L 65 80 L 64 65 Z" ${FIGURE_STYLE}/>
      <text x="65" y="32" fill="#ffd700" font-size="2.2" opacity="0.85">回头 ↘</text>
    `,
  },
  {
    id: "mirror",
    name: "镜中对视",
    tip: "拍镜子里的她，你出现在镜面边缘",
    svg: `
      <!-- 镜框 -->
      <rect x="15" y="10" width="70" height="80" fill="rgba(255,255,255,0.04)" stroke="white" stroke-width="0.5" opacity="0.7"/>
      <text x="50" y="8" text-anchor="middle" fill="white" font-size="2" opacity="0.7">镜子</text>
      <!-- 她（镜中央） -->
      <ellipse cx="42" cy="30" rx="4" ry="4" ${FIGURE_STYLE}/>
      <path d="M 36 35 L 48 35 L 46 55 L 38 55 Z" ${FIGURE_STYLE}/>
      <path d="M 38 55 L 46 55 L 48 75 L 36 75 Z" ${FIGURE_STYLE}/>
      <!-- 她手举手机 -->
      <path d="M 36 36 L 30 50 L 32 50 L 38 38 Z" ${FIGURE_STYLE}/>
      <rect x="26" y="46" width="6" height="9" fill="rgba(255,215,0,0.4)" stroke="#ffd700" stroke-width="0.3"/>
      <!-- 你（镜面边缘） -->
      <ellipse cx="72" cy="36" rx="3.5" ry="3.5" stroke="white" stroke-width="0.3" stroke-dasharray="0.8 0.6" fill="rgba(255,255,255,0.05)" opacity="0.7"/>
      <path d="M 67 40 L 77 40 L 76 60 L 68 60 Z" stroke="white" stroke-width="0.3" stroke-dasharray="0.8 0.6" fill="rgba(255,255,255,0.05)" opacity="0.7"/>
      <text x="72" y="78" text-anchor="middle" fill="#ffd700" font-size="2" opacity="0.85">你</text>
    `,
  },
  {
    id: "cup",
    name: "咖啡杯遮嘴",
    tip: "双手捧杯挡下半脸，眼神望向窗外",
    svg: `
      <line x1="0" y1="33.3" x2="100" y2="33.3" stroke="#ffd700" stroke-width="0.3" opacity="0.7"/>
      <text x="50" y="10" text-anchor="middle" fill="white" font-size="2.2" opacity="0.7">眼神看窗外 →</text>
      <ellipse cx="50" cy="35" rx="14" ry="18" ${FIGURE_STYLE}/>
      <!-- 杯子盖住下半脸 -->
      <ellipse cx="50" cy="52" rx="13" ry="4" fill="rgba(255,255,255,0.18)" stroke="white" stroke-width="0.5" opacity="0.9"/>
      <path d="M 37 52 L 39 72 Q 42 76 50 76 Q 58 76 61 72 L 63 52 Z" fill="rgba(255,255,255,0.18)" stroke="white" stroke-width="0.4" opacity="0.85"/>
      <text x="50" y="65" text-anchor="middle" fill="#ffd700" font-size="2.2">☕</text>
      <!-- 露眼睛 -->
      <circle cx="44" cy="32" r="1" fill="#ffd700"/>
      <circle cx="56" cy="32" r="1" fill="#ffd700"/>
      <!-- 肩 -->
      <path d="M 30 80 Q 35 75 50 75 Q 65 75 70 80 L 75 98 L 25 98 Z" ${FIGURE_STYLE}/>
    `,
  },
  {
    id: "beach",
    name: "海边踢浪",
    tip: "逆光蹲拍，等浪花溅起按连拍",
    svg: `
      <text x="50" y="10" text-anchor="middle" fill="white" font-size="2.2" opacity="0.7">📸 连拍 · 逆光</text>
      <!-- 海平面 -->
      <line x1="0" y1="65" x2="100" y2="65" stroke="white" stroke-width="0.4" opacity="0.5"/>
      <text x="5" y="63" fill="white" font-size="1.8" opacity="0.5">海平线</text>
      <!-- 浪花 -->
      <path d="M 25 85 Q 30 78 35 85 Q 40 82 45 88" fill="none" stroke="white" stroke-width="0.5" opacity="0.7"/>
      <path d="M 28 92 Q 32 88 36 92 Q 40 89 45 93" fill="none" stroke="white" stroke-width="0.3" opacity="0.5"/>
      <text x="35" y="75" fill="#ffd700" font-size="2.2" opacity="0.85">浪 💦</text>
      <!-- 人在中间，一脚抬起 -->
      <ellipse cx="58" cy="30" rx="3.5" ry="3.5" ${FIGURE_STYLE}/>
      <path d="M 58 33 L 58 36" ${FIGURE_LINE}/>
      <path d="M 52 36 L 64 36 L 62 56 L 54 56 Z" ${FIGURE_STYLE}/>
      <path d="M 54 56 L 62 56 L 64 68 L 52 68 Z" ${FIGURE_STYLE}/>
      <!-- 站立腿 -->
      <path d="M 60 68 L 60 95 L 58 95 L 58 68 Z" ${FIGURE_STYLE}/>
      <!-- 抬起的腿（踢） -->
      <path d="M 54 68 Q 44 75 36 84 L 38 87 Q 48 78 56 68 Z" ${FIGURE_STYLE}/>
      <!-- 手臂 -->
      <path d="M 52 38 L 48 55 L 50 55 L 54 39 Z" ${FIGURE_STYLE}/>
      <path d="M 64 38 L 70 50 L 72 50 L 66 39 Z" ${FIGURE_STYLE}/>
    `,
  },
  {
    id: "lay-grass",
    name: "草地躺拍",
    tip: "你站她躺，垂直俯拍，发丝散开摆放",
    svg: `
      <text x="50" y="10" text-anchor="middle" fill="white" font-size="2.2" opacity="0.7">↓ 垂直俯拍</text>
      <!-- 横着的人 -->
      <ellipse cx="50" cy="32" rx="6" ry="6" ${FIGURE_STYLE}/>
      <!-- 发丝散开 -->
      <path d="M 44 30 Q 30 25 22 20" fill="none" stroke="white" stroke-width="0.3" stroke-dasharray="1.4 0.9" opacity="0.85"/>
      <path d="M 44 32 Q 28 32 18 30" fill="none" stroke="white" stroke-width="0.3" stroke-dasharray="1.4 0.9" opacity="0.85"/>
      <path d="M 44 34 Q 28 38 20 42" fill="none" stroke="white" stroke-width="0.3" stroke-dasharray="1.4 0.9" opacity="0.85"/>
      <text x="22" y="48" fill="#ffd700" font-size="2" opacity="0.85">发散开</text>
      <!-- 身体横躺 -->
      <path d="M 56 28 L 56 36 L 78 38 L 78 26 Z" ${FIGURE_STYLE}/>
      <path d="M 78 26 L 78 38 L 95 36 L 95 28 Z" ${FIGURE_STYLE}/>
      <!-- 手放胸前 -->
      <path d="M 62 35 L 68 50 L 70 50 L 64 35 Z" ${FIGURE_STYLE}/>
    `,
  },
  {
    id: "flowers",
    name: "抱花回眸",
    tip: "怀抱花束半侧身，回头瞬间抓拍",
    svg: `
      <line x1="0" y1="33.3" x2="100" y2="33.3" stroke="#ffd700" stroke-width="0.3" opacity="0.7"/>
      <text x="50" y="10" text-anchor="middle" fill="white" font-size="2.2" opacity="0.7">📸 抓拍回眸</text>
      <!-- 侧身头 -->
      <ellipse cx="48" cy="18" rx="4" ry="4.5" ${FIGURE_STYLE} transform="rotate(15 48 18)"/>
      <!-- 身体（侧身） -->
      <path d="M 42 23 L 56 23 L 58 50 L 44 50 Z" ${FIGURE_STYLE} transform="rotate(8 50 35)"/>
      <path d="M 44 50 L 58 50 L 60 70 L 42 70 Z" ${FIGURE_STYLE}/>
      <!-- 花束 -->
      <circle cx="55" cy="48" r="6" fill="rgba(255,215,0,0.25)" stroke="#ffd700" stroke-width="0.4" opacity="0.85"/>
      <circle cx="52" cy="45" r="2" fill="#ffd700" opacity="0.6"/>
      <circle cx="58" cy="45" r="2" fill="#ffd700" opacity="0.6"/>
      <circle cx="55" cy="50" r="2" fill="#ffd700" opacity="0.6"/>
      <text x="68" y="50" fill="#ffd700" font-size="2.2" opacity="0.85">💐</text>
      <!-- 抱花的臂 -->
      <path d="M 44 27 Q 48 40 50 48 L 52 48 Q 50 40 46 27 Z" ${FIGURE_STYLE}/>
      <path d="M 56 27 Q 60 40 60 48 L 58 48 Q 58 40 54 27 Z" ${FIGURE_STYLE}/>
    `,
  },
  {
    id: "hand-run",
    name: "牵手带跑",
    tip: "她在前牵你手往前跑，第一人称视角拍背影",
    svg: `
      <text x="50" y="10" text-anchor="middle" fill="white" font-size="2.2" opacity="0.7">第一人称 · 拍背影</text>
      <line x1="0" y1="33.3" x2="100" y2="33.3" stroke="#ffd700" stroke-width="0.3" opacity="0.7"/>
      <!-- 前方的她（背影、跑姿） -->
      <ellipse cx="58" cy="35" rx="3.2" ry="3.2" ${FIGURE_STYLE}/>
      <path d="M 53 39 L 63 39 L 61 58 L 55 58 Z" ${FIGURE_STYLE}/>
      <path d="M 55 58 L 61 58 L 63 70 L 53 70 Z" ${FIGURE_STYLE}/>
      <!-- 跑姿腿 -->
      <path d="M 55 70 Q 50 80 46 88 L 44 90 Q 48 78 53 68 Z" ${FIGURE_STYLE}/>
      <path d="M 61 70 Q 64 80 68 88 L 66 92 Q 62 80 59 68 Z" ${FIGURE_STYLE}/>
      <!-- 她回伸的手 -->
      <path d="M 53 40 L 38 60 L 40 62 L 55 42 Z" ${FIGURE_STYLE}/>
      <!-- 你的手（从画面下方伸出） -->
      <path d="M 25 95 Q 32 80 38 60 L 36 60 Q 30 80 22 95 Z" fill="rgba(255,215,0,0.2)" stroke="#ffd700" stroke-width="0.5" opacity="0.85"/>
      <!-- 牵手点 -->
      <circle cx="38" cy="61" r="1.6" fill="#ffd700"/>
      <text x="40" y="55" fill="#ffd700" font-size="2.2" opacity="0.85">牵手 ↖</text>
    `,
  },
  {
    id: "feed",
    name: "喂食对望",
    tip: "她递食物到你嘴边，侧拍两人对视瞬间",
    svg: `
      <text x="50" y="10" text-anchor="middle" fill="white" font-size="2.2" opacity="0.7">侧拍 · 对视瞬间</text>
      <line x1="0" y1="33.3" x2="100" y2="33.3" stroke="#ffd700" stroke-width="0.3" opacity="0.7"/>
      <!-- 她（左） -->
      <ellipse cx="30" cy="32" rx="8" ry="10" ${FIGURE_STYLE}/>
      <text x="30" y="50" text-anchor="middle" fill="white" font-size="2" opacity="0.7">她</text>
      <path d="M 15 58 Q 20 52 30 52 Q 38 52 42 56 L 40 88 L 12 88 Z" ${FIGURE_STYLE}/>
      <!-- 你（右） -->
      <ellipse cx="70" cy="32" rx="8" ry="10" ${FIGURE_STYLE} stroke-dasharray="0.8 0.6" opacity="0.7"/>
      <text x="70" y="50" text-anchor="middle" fill="#ffd700" font-size="2" opacity="0.85">你</text>
      <path d="M 58 56 Q 62 52 70 52 Q 80 52 85 58 L 88 88 L 60 88 Z" stroke="white" stroke-width="0.3" stroke-dasharray="0.8 0.6" fill="rgba(255,255,255,0.05)" opacity="0.7"/>
      <!-- 中间的手和食物 -->
      <path d="M 40 38 Q 50 38 56 36" fill="none" stroke="white" stroke-width="0.4" opacity="0.85" stroke-dasharray="1.4 0.9"/>
      <circle cx="50" cy="37" r="2" fill="#ffd700" opacity="0.85"/>
      <text x="50" y="32" text-anchor="middle" fill="#ffd700" font-size="2.4">🍓</text>
    `,
  },
];

// ============================================================================
// DOM
// ============================================================================

const startBtn = document.getElementById("start-btn");
const fallbackBtn = document.getElementById("fallback-btn");
const captureInput = document.getElementById("capture-input");
const referenceBtn = document.getElementById("reference-btn");
const referenceInput = document.getElementById("reference-input");
const referencePreview = document.getElementById("reference-preview");
const referenceThumb = document.getElementById("reference-thumb");
const referenceName = document.getElementById("reference-name");
const referencePoseStatus = document.getElementById("reference-pose-status");
const clearReferenceBtn = document.getElementById("clear-reference-btn");
const closeBtn = document.getElementById("close-btn");
const nativeBtn = document.getElementById("native-btn");
const switchBtn = document.getElementById("switch-btn");
const shutterBtn = document.getElementById("shutter-btn");
const gridBtn = document.getElementById("grid-btn");
const referenceToggleBtn = document.getElementById("reference-toggle-btn");
const referenceChangeBtn = document.getElementById("reference-change-btn");
const referenceOpacity = document.getElementById("reference-opacity");
const livePoseMatch = document.getElementById("live-pose-match");
const livePoseScore = document.getElementById("live-pose-score");
const livePoseTip = document.getElementById("live-pose-tip");
const retakeBtn = document.getElementById("retake-btn");
const saveBtn = document.getElementById("save-btn");
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const referenceOverlay = document.getElementById("reference-overlay");
const overlay = document.getElementById("overlay");
const tipEl = document.getElementById("tip");
const previewImg = document.getElementById("preview-img");
const scorePanel = document.getElementById("score-panel");
const scoreValue = document.getElementById("score-value");
const scoreSummary = document.getElementById("score-summary");
const scoreMetrics = document.getElementById("score-metrics");
const scoreTips = document.getElementById("score-tips");
const poseScorePanel = document.getElementById("pose-score-panel");
const poseScoreValue = document.getElementById("pose-score-value");
const poseScoreTip = document.getElementById("pose-score-tip");
const homeScreen = document.getElementById("home");
const cameraScreen = document.getElementById("camera");
const previewScreen = document.getElementById("preview");
const errorEl = document.getElementById("error");
const posesScroll = document.getElementById("poses-scroll");
const referencePanel = document.getElementById("reference-panel");

// ============================================================================
// State
// ============================================================================

let stream = null;
let facingMode = "environment";
let activeGuideIdx = 0;
let overlayVisible = true;
let lastPhotoUrl = null;
let referencePhotoUrl = null;
let referenceVisible = true;
let referenceOpacityValue = 0.38;
let poseDetector = null;
let poseDetectorPromise = null;
let referencePose = null;
let livePoseTimer = null;
let livePoseBusy = false;

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
  stopLivePoseMatching();
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

function syncReferenceUI() {
  const hasReference = Boolean(referencePhotoUrl);

  referencePreview.hidden = !hasReference;
  referencePanel.hidden = !hasReference;
  referenceOverlay.hidden = !hasReference || !referenceVisible;
  referenceToggleBtn.textContent = referenceVisible ? "隐藏同款图" : "显示同款图";
  referenceOverlay.style.opacity = String(referenceOpacityValue);
  livePoseMatch.hidden = !hasReference || !referencePose || cameraScreen.hidden;
}

function chooseReferenceImage() {
  referenceInput.click();
}

function setReferenceImage(file) {
  if (!file) return;
  if (!file.type || !file.type.startsWith("image/")) {
    showError("请选择图片文件作为参考图。");
    return;
  }

  if (referencePhotoUrl) URL.revokeObjectURL(referencePhotoUrl);
  referencePhotoUrl = URL.createObjectURL(file);
  referenceVisible = true;
  referenceOverlay.src = referencePhotoUrl;
  referenceThumb.src = referencePhotoUrl;
  referenceName.textContent = file.name || "已选择参考图";
  referencePose = null;
  referencePoseStatus.textContent = "正在读取参考姿势...";
  resetPoseScore();
  syncReferenceUI();
  detectReferencePose(referencePhotoUrl);
}

function clearReferenceImage() {
  if (referencePhotoUrl) URL.revokeObjectURL(referencePhotoUrl);
  referencePhotoUrl = null;
  referencePose = null;
  referenceVisible = true;
  referenceOverlay.removeAttribute("src");
  referenceThumb.removeAttribute("src");
  referenceName.textContent = "已选择参考图";
  referencePoseStatus.textContent = "姿势尚未读取";
  resetPoseScore();
  syncReferenceUI();
}

function toggleReferenceImage() {
  referenceVisible = !referenceVisible;
  syncReferenceUI();
}

function updateReferenceOpacity() {
  referenceOpacityValue = Number(referenceOpacity.value) / 100;
  syncReferenceUI();
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function resetScorePanel() {
  scorePanel.hidden = true;
  scoreValue.textContent = "--";
  scoreSummary.textContent = "正在分析这张照片...";
  scoreMetrics.innerHTML = "";
  scoreTips.innerHTML = "";
  resetPoseScore();
}

function buildMetric(label, value) {
  return `
    <div class="score-metric">
      <strong>${value}</strong>
      <span>${label}</span>
    </div>
  `;
}

function renderScore(analysis) {
  scorePanel.hidden = false;
  scoreValue.textContent = String(analysis.score);
  scoreSummary.textContent = analysis.summary;
  scoreMetrics.innerHTML = [
    buildMetric("清晰度", analysis.metrics.sharpness),
    buildMetric("亮度", analysis.metrics.brightness),
    buildMetric("曝光", analysis.metrics.exposure),
    buildMetric("构图", analysis.metrics.framing),
  ].join("");
  scoreTips.innerHTML = analysis.tips.map((tip) => `<li>${tip}</li>`).join("");
}

function grade(score) {
  if (score >= 85) return "很好";
  if (score >= 72) return "不错";
  if (score >= 58) return "一般";
  return "需调整";
}

function analyzeCanvas(sourceCanvas) {
  const sampleW = 180;
  const sampleH = Math.max(1, Math.round((sourceCanvas.height / sourceCanvas.width) * sampleW));
  const sampleCanvas = document.createElement("canvas");
  sampleCanvas.width = sampleW;
  sampleCanvas.height = sampleH;
  const sampleCtx = sampleCanvas.getContext("2d", { willReadFrequently: true });
  sampleCtx.drawImage(sourceCanvas, 0, 0, sampleW, sampleH);

  const pixels = sampleCtx.getImageData(0, 0, sampleW, sampleH).data;
  const luminance = new Float32Array(sampleW * sampleH);
  let totalLum = 0;
  let darkCount = 0;
  let brightCount = 0;

  for (let i = 0, p = 0; i < pixels.length; i += 4, p += 1) {
    const y = pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114;
    luminance[p] = y;
    totalLum += y;
    if (y < 42) darkCount += 1;
    if (y > 242) brightCount += 1;
  }

  const count = sampleW * sampleH;
  const avgLum = totalLum / count;
  const darkRatio = darkCount / count;
  const brightRatio = brightCount / count;

  let lapTotal = 0;
  let lapSqTotal = 0;
  let gradTotal = 0;
  let weightedX = 0;
  let weightedY = 0;
  let weightTotal = 0;
  let edgeCount = 0;
  let minX = sampleW;
  let maxX = 0;
  let minY = sampleH;
  let maxY = 0;

  for (let y = 1; y < sampleH - 1; y += 1) {
    for (let x = 1; x < sampleW - 1; x += 1) {
      const idx = y * sampleW + x;
      const center = luminance[idx];
      const left = luminance[idx - 1];
      const right = luminance[idx + 1];
      const top = luminance[idx - sampleW];
      const bottom = luminance[idx + sampleW];
      const lap = -4 * center + left + right + top + bottom;
      const grad = Math.abs(right - left) + Math.abs(bottom - top);

      lapTotal += lap;
      lapSqTotal += lap * lap;
      gradTotal += grad;

      if (grad > 34) {
        const centerBias = 1.15 - Math.min(0.65, Math.abs(x / sampleW - 0.5) + Math.abs(y / sampleH - 0.48));
        const weight = grad * centerBias;
        weightedX += x * weight;
        weightedY += y * weight;
        weightTotal += weight;
        edgeCount += 1;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }

  const innerCount = Math.max(1, (sampleW - 2) * (sampleH - 2));
  const lapMean = lapTotal / innerCount;
  const lapVariance = lapSqTotal / innerCount - lapMean * lapMean;
  const avgGradient = gradTotal / innerCount;
  const sharpnessScore = clamp(Math.round((lapVariance - 20) / 360 * 100), 0, 100);
  const brightnessScore = clamp(Math.round(100 - Math.abs(avgLum - 132) * 0.72), 0, 100);
  const exposureScore = clamp(
    Math.round(100 - darkRatio * 175 - brightRatio * 220 - Math.max(0, Math.abs(avgLum - 132) - 32) * 0.45),
    0,
    100
  );

  let framingScore = 66;
  let subjectCx = 0.5;
  let subjectCy = 0.5;
  let headroom = 0.12;
  if (weightTotal > 0 && edgeCount > count * 0.012) {
    subjectCx = weightedX / weightTotal / sampleW;
    subjectCy = weightedY / weightTotal / sampleH;
    const subjectHeight = Math.max(1, maxY - minY) / sampleH;
    headroom = minY / sampleH;
    const centerPenalty = Math.abs(subjectCx - 0.5) * 95 + Math.abs(subjectCy - 0.48) * 70;
    const sizePenalty = subjectHeight < 0.32 ? (0.32 - subjectHeight) * 90 : subjectHeight > 0.88 ? (subjectHeight - 0.88) * 80 : 0;
    const headPenalty = headroom > 0.22 ? (headroom - 0.22) * 120 : headroom < 0.035 ? (0.035 - headroom) * 120 : 0;
    framingScore = clamp(Math.round(100 - centerPenalty - sizePenalty - headPenalty), 0, 100);
  }

  const score = clamp(
    Math.round(sharpnessScore * 0.3 + brightnessScore * 0.22 + exposureScore * 0.26 + framingScore * 0.22),
    0,
    100
  );

  const tips = makePhotoTips({
    avgLum,
    darkRatio,
    brightRatio,
    sharpnessScore,
    exposureScore,
    framingScore,
    subjectCx,
    subjectCy,
    headroom,
    avgGradient,
  });

  return {
    score,
    summary: score >= 82 ? "这张很有氛围，可以直接用。" : score >= 68 ? "整体不错，微调一下会更稳。" : "这张有进步空间，按提示再拍一张。",
    tips,
    metrics: {
      sharpness: grade(sharpnessScore),
      brightness: grade(brightnessScore),
      exposure: grade(exposureScore),
      framing: grade(framingScore),
    },
  };
}

function makePhotoTips(stats) {
  const tips = [];

  if (stats.sharpnessScore < 48 && stats.avgGradient < 18) {
    tips.push("画面有点糊，手机拿稳后再按快门");
  }
  if (stats.darkRatio > 0.32 || stats.avgLum < 92) {
    tips.push("光线太暗，靠近窗边或补一点光");
  } else if (stats.brightRatio > 0.11 || stats.avgLum > 178) {
    tips.push("高光太亮，避开直射光再拍");
  } else if (stats.brightnessScore < 70) {
    tips.push("亮度再调均匀一点，脸部会更干净");
  }

  if (stats.headroom > 0.24) {
    tips.push("头顶留白太多，镜头再低一点");
  } else if (stats.subjectCy > 0.58) {
    tips.push("人物偏低，镜头再低一点会显腿长");
  } else if (stats.subjectCy < 0.36) {
    tips.push("人物偏高，手机稍微往下压一点");
  } else if (stats.subjectCx < 0.4) {
    tips.push("人物偏左，往中间或三分线挪一点");
  } else if (stats.subjectCx > 0.6) {
    tips.push("人物偏右，往中间或三分线挪一点");
  } else if (stats.framingScore < 72) {
    tips.push("人物再靠近中心线，构图会更稳");
  }

  if (stats.exposureScore < 65 && !tips.some((tip) => tip.includes("光") || tip.includes("亮"))) {
    tips.push("曝光不太稳，点一下脸部再拍");
  }
  tips.push("下巴微收，肩膀放松，表情会更自然");
  tips.push("连拍两三张，选眼神最稳的一张");

  const uniqueTips = [...new Set(tips)];
  const defaultTips = [
    "眼睛看向镜头上方一点点",
    "身体微侧，画面会更显瘦",
    "背景保持干净，人物会更突出",
  ];
  defaultTips.forEach((tip) => {
    if (uniqueTips.length < 3 && !uniqueTips.includes(tip)) uniqueTips.push(tip);
  });

  return uniqueTips.slice(0, 3);
}

function analyzeImageUrl(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const analysisCanvas = document.createElement("canvas");
      analysisCanvas.width = img.naturalWidth || img.width;
      analysisCanvas.height = img.naturalHeight || img.height;
      const analysisCtx = analysisCanvas.getContext("2d");
      analysisCtx.drawImage(img, 0, 0, analysisCanvas.width, analysisCanvas.height);
      resolve(analyzeCanvas(analysisCanvas));
    };
    img.onerror = () => reject(new Error("照片分析失败"));
    img.src = url;
  });
}

function resetPoseScore() {
  poseScorePanel.hidden = true;
  poseScoreValue.textContent = "--";
  poseScoreTip.textContent = referencePose ? "拍照后自动匹配参考姿势。" : "先选择参考图，再拍照匹配姿势。";
  livePoseScore.textContent = "--";
  livePoseTip.textContent = referencePose ? "读取你的姿势中..." : "先选择一张参考图";
  livePoseMatch.hidden = true;
}

async function getPoseDetector() {
  if (poseDetector) return poseDetector;
  if (poseDetectorPromise) return poseDetectorPromise;

  poseDetectorPromise = (async () => {
    if (!window.tf || !window.poseDetection) {
      throw new Error("姿势模型还没加载完成，请稍后再试。");
    }
    try {
      await tf.setBackend("webgl");
    } catch (err) {
      await tf.setBackend("cpu");
    }
    await tf.ready();
    const model = poseDetection.SupportedModels.MoveNet;
    const detector = await poseDetection.createDetector(model, {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
      enableSmoothing: true,
    });
    poseDetector = detector;
    return detector;
  })();

  try {
    return await poseDetectorPromise;
  } catch (err) {
    poseDetectorPromise = null;
    throw err;
  }
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("图片读取失败"));
    img.src = url;
  });
}

async function estimatePose(source) {
  const detector = await getPoseDetector();
  const poses = await detector.estimatePoses(source, {
    maxPoses: 1,
    flipHorizontal: false,
  });
  const pose = poses && poses[0];
  if (!pose || !pose.keypoints) return null;
  const confident = pose.keypoints.filter((p) => (p.score || 0) >= 0.28);
  return confident.length >= 6 ? pose.keypoints : null;
}

async function detectReferencePose(url) {
  try {
    const img = await loadImage(url);
    referencePose = await estimatePose(img);
    referencePoseStatus.textContent = referencePose ? "参考姿势已读取" : "没识别到完整人物姿势";
  } catch (err) {
    referencePose = null;
    referencePoseStatus.textContent = "姿势模型加载失败，可继续用透明图";
  }
  syncReferenceUI();
  updateLivePoseMatch();
}

function keypointMap(keypoints) {
  const map = {};
  keypoints.forEach((point) => {
    if (point && point.name && (point.score || 0) >= 0.25) {
      map[point.name] = {
        x: point.x,
        y: point.y,
        score: point.score || 0,
      };
    }
  });
  return map;
}

function normalizedPose(keypoints, mirror) {
  const map = keypointMap(keypoints);
  const names = Object.keys(map);
  if (names.length < 6) return null;

  const shoulderMid = midpoint(map.left_shoulder, map.right_shoulder);
  const hipMid = midpoint(map.left_hip, map.right_hip);
  let center = midpoint(shoulderMid, hipMid);
  if (!center) {
    const avg = names.reduce((acc, name) => {
      acc.x += map[name].x;
      acc.y += map[name].y;
      return acc;
    }, { x: 0, y: 0 });
    center = { x: avg.x / names.length, y: avg.y / names.length };
  }

  const shoulderWidth = distance(map.left_shoulder, map.right_shoulder);
  const torsoLength = distance(shoulderMid, hipMid);
  const scale = Math.max(shoulderWidth || 0, torsoLength || 0, 60);
  const normalized = {};

  names.forEach((name) => {
    const point = map[name];
    const mirrorName = mirror ? swapSideName(name) : name;
    normalized[mirrorName] = {
      x: (mirror ? -1 : 1) * ((point.x - center.x) / scale),
      y: (point.y - center.y) / scale,
      score: point.score,
    };
  });

  return normalized;
}

function swapSideName(name) {
  if (name.startsWith("left_")) return name.replace("left_", "right_");
  if (name.startsWith("right_")) return name.replace("right_", "left_");
  return name;
}

function midpoint(a, b) {
  if (!a || !b) return a || b || null;
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  };
}

function distance(a, b) {
  if (!a || !b) return 0;
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function angle(a, b, c) {
  if (!a || !b || !c) return null;
  const abx = a.x - b.x;
  const aby = a.y - b.y;
  const cbx = c.x - b.x;
  const cby = c.y - b.y;
  const denom = Math.hypot(abx, aby) * Math.hypot(cbx, cby);
  if (!denom) return null;
  const cos = clamp((abx * cbx + aby * cby) / denom, -1, 1);
  return Math.acos(cos) * 180 / Math.PI;
}

function poseAngles(pose) {
  return {
    left_elbow: angle(pose.left_shoulder, pose.left_elbow, pose.left_wrist),
    right_elbow: angle(pose.right_shoulder, pose.right_elbow, pose.right_wrist),
    left_shoulder: angle(pose.left_elbow, pose.left_shoulder, pose.left_hip),
    right_shoulder: angle(pose.right_elbow, pose.right_shoulder, pose.right_hip),
    left_knee: angle(pose.left_hip, pose.left_knee, pose.left_ankle),
    right_knee: angle(pose.right_hip, pose.right_knee, pose.right_ankle),
    torso: angle(pose.left_shoulder, pose.right_shoulder, pose.right_hip),
  };
}

function comparePoses(referenceKeypoints, userKeypoints) {
  const ref = normalizedPose(referenceKeypoints, false);
  const user = normalizedPose(userKeypoints, false);
  const mirroredUser = normalizedPose(userKeypoints, true);
  if (!ref || !user) return null;

  const normal = compareNormalizedPoses(ref, user);
  const mirrored = mirroredUser ? compareNormalizedPoses(ref, mirroredUser) : null;
  return mirrored && mirrored.score > normal.score ? mirrored : normal;
}

function compareNormalizedPoses(ref, user) {
  const compareNames = [
    "nose",
    "left_shoulder",
    "right_shoulder",
    "left_elbow",
    "right_elbow",
    "left_wrist",
    "right_wrist",
    "left_hip",
    "right_hip",
    "left_knee",
    "right_knee",
    "left_ankle",
    "right_ankle",
  ];

  let positionPenalty = 0;
  let positionCount = 0;
  compareNames.forEach((name) => {
    if (ref[name] && user[name]) {
      const d = Math.hypot(ref[name].x - user[name].x, ref[name].y - user[name].y);
      positionPenalty += clamp(d / 0.72, 0, 1);
      positionCount += 1;
    }
  });

  const refAngles = poseAngles(ref);
  const userAngles = poseAngles(user);
  let anglePenalty = 0;
  let angleCount = 0;
  Object.keys(refAngles).forEach((name) => {
    if (refAngles[name] !== null && userAngles[name] !== null) {
      anglePenalty += clamp(Math.abs(refAngles[name] - userAngles[name]) / 65, 0, 1);
      angleCount += 1;
    }
  });

  const posScore = positionCount ? 100 - (positionPenalty / positionCount) * 100 : 50;
  const angleScore = angleCount ? 100 - (anglePenalty / angleCount) * 100 : 50;
  const score = clamp(Math.round(posScore * 0.46 + angleScore * 0.54), 0, 100);

  return {
    score,
    tip: makePoseTip(ref, user, score),
  };
}

function makePoseTip(ref, user, score) {
  if (score >= 86) return "姿势很接近，可以直接拍。";

  const refShoulderTilt = shoulderTilt(ref);
  const userShoulderTilt = shoulderTilt(user);
  if (Math.abs(refShoulderTilt - userShoulderTilt) > 0.16) return "肩膀再转一点";

  const refWristY = averageVisibleY(ref.left_wrist, ref.right_wrist);
  const userWristY = averageVisibleY(user.left_wrist, user.right_wrist);
  if (refWristY !== null && userWristY !== null && userWristY - refWristY > 0.28) return "手臂再抬高一点";

  const refHipX = averageVisibleX(ref.left_hip, ref.right_hip);
  const userHipX = averageVisibleX(user.left_hip, user.right_hip);
  if (refHipX !== null && userHipX !== null && userHipX - refHipX < -0.18) return "身体重心往右";
  if (refHipX !== null && userHipX !== null && userHipX - refHipX > 0.18) return "身体重心往左";

  const refNose = ref.nose;
  const userNose = user.nose;
  const refShouldersY = averageVisibleY(ref.left_shoulder, ref.right_shoulder);
  const userShouldersY = averageVisibleY(user.left_shoulder, user.right_shoulder);
  if (refNose && userNose && refShouldersY !== null && userShouldersY !== null) {
    const refHead = refShouldersY - refNose.y;
    const userHead = userShouldersY - userNose.y;
    if (userHead - refHead > 0.18) return "下巴微收";
  }

  return "身体线条再贴近参考图一点";
}

function shoulderTilt(pose) {
  if (!pose.left_shoulder || !pose.right_shoulder) return 0;
  return pose.left_shoulder.y - pose.right_shoulder.y;
}

function averageVisibleY(a, b) {
  if (a && b) return (a.y + b.y) / 2;
  if (a) return a.y;
  if (b) return b.y;
  return null;
}

function averageVisibleX(a, b) {
  if (a && b) return (a.x + b.x) / 2;
  if (a) return a.x;
  if (b) return b.x;
  return null;
}

function renderPoseMatch(match) {
  if (!match) {
    poseScorePanel.hidden = false;
    poseScoreValue.textContent = "--";
    poseScoreTip.textContent = referencePose ? "没识别到完整人物姿势，请让身体多一点入镜。" : "先选择参考图，再拍照匹配姿势。";
    return;
  }

  poseScorePanel.hidden = false;
  poseScoreValue.textContent = String(match.score);
  poseScoreTip.textContent = match.tip;
}

async function matchCapturedPose(source) {
  if (!referencePose) {
    resetPoseScore();
    return null;
  }

  try {
    poseScorePanel.hidden = false;
    poseScoreValue.textContent = "--";
    poseScoreTip.textContent = "正在匹配同款姿势...";
    const userPose = await estimatePose(source);
    const match = userPose ? comparePoses(referencePose, userPose) : null;
    renderPoseMatch(match);
    return match;
  } catch (err) {
    poseScorePanel.hidden = false;
    poseScoreValue.textContent = "--";
    poseScoreTip.textContent = "姿势匹配暂时不可用，但照片评分仍可使用。";
    return null;
  }
}

function startLivePoseMatching() {
  stopLivePoseMatching();
  updateLivePoseMatch();
  livePoseTimer = setInterval(updateLivePoseMatch, 1600);
}

function stopLivePoseMatching() {
  if (livePoseTimer) {
    clearInterval(livePoseTimer);
    livePoseTimer = null;
  }
  livePoseBusy = false;
  livePoseMatch.hidden = true;
}

async function updateLivePoseMatch() {
  if (!referencePose || cameraScreen.hidden || !stream || livePoseBusy || !video.videoWidth) {
    livePoseMatch.hidden = !referencePose || cameraScreen.hidden;
    return;
  }

  livePoseBusy = true;
  livePoseMatch.hidden = false;
  try {
    const userPose = await estimatePose(video);
    const match = userPose ? comparePoses(referencePose, userPose) : null;
    if (match) {
      livePoseScore.textContent = String(match.score);
      livePoseTip.textContent = match.tip;
    } else {
      livePoseScore.textContent = "--";
      livePoseTip.textContent = "让身体多一点入镜";
    }
  } catch (err) {
    livePoseScore.textContent = "--";
    livePoseTip.textContent = "姿势模型加载中...";
  } finally {
    livePoseBusy = false;
  }
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
    syncReferenceUI();

    try {
      await withTimeout(video.play(), 5000, "视频播放");
      startLivePoseMatching();
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
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (facingMode === "user") {
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(video, 0, 0, w, h);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const analysis = analyzeCanvas(canvas);
  canvas.toBlob(
    (blob) => {
      if (lastPhotoUrl) URL.revokeObjectURL(lastPhotoUrl);
      lastPhotoUrl = URL.createObjectURL(blob);
      previewImg.src = lastPhotoUrl;
      saveBtn.href = lastPhotoUrl;
      saveBtn.download = `photo-${Date.now()}.jpg`;
      renderScore(analysis);
      matchCapturedPose(canvas);
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

referenceInput.addEventListener("change", (e) => {
  const file = e.target.files && e.target.files[0];
  setReferenceImage(file);
  referenceInput.value = "";
});

captureInput.addEventListener("change", async (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  if (lastPhotoUrl) URL.revokeObjectURL(lastPhotoUrl);
  lastPhotoUrl = URL.createObjectURL(file);
  previewImg.src = lastPhotoUrl;
  saveBtn.href = lastPhotoUrl;
  saveBtn.download = file.name || `photo-${Date.now()}.jpg`;
  resetScorePanel();
  try {
    renderScore(await analyzeImageUrl(lastPhotoUrl));
    await matchCapturedPose(await loadImage(lastPhotoUrl));
  } catch (err) {
    scorePanel.hidden = false;
    scoreValue.textContent = "--";
    scoreSummary.textContent = "这张照片暂时无法自动评分，但仍然可以保存。";
    scoreMetrics.innerHTML = "";
    scoreTips.innerHTML = "<li>换一张照片或重新拍一次</li><li>保持光线稳定</li><li>人物放在画面中心附近</li>";
    await matchCapturedPose(await loadImage(lastPhotoUrl)).catch(() => null);
  }
  homeScreen.hidden = true;
  previewScreen.hidden = false;
  captureInput.value = "";
});

// ============================================================================
// Wire up
// ============================================================================

startBtn.addEventListener("click", startCamera);
referenceBtn.addEventListener("click", chooseReferenceImage);
clearReferenceBtn.addEventListener("click", clearReferenceImage);
referenceToggleBtn.addEventListener("click", toggleReferenceImage);
referenceChangeBtn.addEventListener("click", chooseReferenceImage);
referenceOpacity.addEventListener("input", updateReferenceOpacity);
fallbackBtn.addEventListener("click", fallbackCapture);
closeBtn.addEventListener("click", closeCamera);
nativeBtn.addEventListener("click", fallbackCapture);
switchBtn.addEventListener("click", switchCamera);
shutterBtn.addEventListener("click", takePhoto);
gridBtn.addEventListener("click", toggleOverlay);
retakeBtn.addEventListener("click", () => {
  previewScreen.hidden = true;
  resetScorePanel();
  if (stream) {
    cameraScreen.hidden = false;
  } else {
    homeScreen.hidden = false;
  }
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopStream();
});

syncReferenceUI();
