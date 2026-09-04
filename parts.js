// parts.js —— 部件样式数据（坐标基于 512×512 画布，卡通线条风）
// 构图基准（线稿定稿）：大头圆脸 c(256,225) r≈128、耳长头顶、眼 (206,175)/(306,175)、
// 嘴中心 (256,288)、胡须 y245、身体梯形 y≈330-500、无四肢。
// 依赖：无。挂载 window.PARTS 供 avatar.js 消费。
window.PARTS = (() => {
  const STROKE = '#3b3b46';                 // 统一描边色
  const SW = 6;                             // 统一描边宽度
  const M = s => `<g transform="translate(512,0) scale(-1,1)">${s}</g>`; // 左右镜像（右半 = 左半镜像）

  // ---------- 颜色池 ----------
  const FURS = ['#f7f4ec', '#f5e3c0', '#f0a35e', '#f5c48c', '#b8bcc4', '#9aa7bd',
                '#8e8e99', '#4a4a52', '#fff3dd', '#a5795f', '#e8d9bf', '#d9c3cd',
                '#d9dade', '#6e6e78']; // 毛色 14（含银灰/深灰）
  const IRIS = ['#5b8fd9', '#67b26a', '#e0a83c', '#d97e32', '#f2d13d', '#4fb3a9',
                '#9b7fd4', '#8a5a3b', '#a8cbe8', '#e06a4a'];                     // 虹膜 10
  const BG = [ // 背景色 10 组 {bg 底色, pc 图案色}
    { bg: '#fdf6ec', pc: '#f0e2cf' }, { bg: '#dff2e4', pc: '#bfe0cb' },
    { bg: '#dceefb', pc: '#bcd9ef' }, { bg: '#fbe3ea', pc: '#f0c4d2' },
    { bg: '#fdf3d7', pc: '#f0dfae' }, { bg: '#eae3f7', pc: '#cdbfe6' },
    { bg: '#fce8dd', pc: '#f2cfba' }, { bg: '#d9f0ee', pc: '#b3ddd8' },
    { bg: '#dde3ec', pc: '#bcc6d4' }, { bg: '#efe9e2', pc: '#d9cfc2' } ];

  // ---------- 背景图案 ×10（fn(pc) 返回 svg 片段，0 = 无） ----------
  const pat = (id, w, h, inner) =>
    `<defs><pattern id="${id}" width="${w}" height="${h}" patternUnits="userSpaceOnUse">${inner}</pattern></defs>` +
    `<rect width="512" height="512" fill="url(#${id})"/>`;
  const BG_PATTERNS = [
    () => '',
    pc => pat('bgp', 76, 76, `<circle cx="19" cy="19" r="9" fill="${pc}"/><circle cx="57" cy="57" r="9" fill="${pc}"/>`),           // 波点
    pc => pat('bgp', 52, 52, `<path d="M-13,13 L13,-13 M39,65 L65,39 M-13,65 L65,-13" stroke="${pc}" stroke-width="14"/>`),        // 斜条纹
    pc => pat('bgp', 64, 64, `<rect width="64" height="30" fill="${pc}"/>`),                                                       // 横条纹
    pc => pat('bgp', 80, 40, `<path d="M0,20 Q20,4 40,20 T80,20" fill="none" stroke="${pc}" stroke-width="7"/>`),                  // 波浪
    pc => { const l = []; for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6;                                 // 放射线
              l.push(`<line x1="256" y1="330" x2="${256 + 560 * Math.cos(a)}" y2="${330 + 560 * Math.sin(a)}"/>`); }
            return `<g stroke="${pc}" stroke-width="13" clip-path="url(#c-canvas)">${l.join('')}</g>`; },
    pc => pat('bgp', 72, 72, `<path d="M0,36 H72 M36,0 V72" stroke="${pc}" stroke-width="8"/>`),                                   // 格纹
    pc => pat('bgp', 70, 70, `<path d="M35,48 C22,38 22,24 32,22 C38,21 42,26 35,32 C28,26 32,21 38,22 C48,24 48,38 35,48Z" fill="${pc}"/>`), // 爱心
    pc => pat('bgp', 74, 74, `<path d="M37,14 L44,30 L61,32 L48,44 L52,61 L37,52 L22,61 L26,44 L13,32 L30,30Z" fill="${pc}"/>`),  // 星星
    pc => pat('bgp', 78, 78, `<g fill="${pc}"><ellipse cx="39" cy="42" rx="11" ry="9"/><circle cx="30" cy="28" r="4"/><circle cx="39" cy="25" r="4"/><circle cx="48" cy="28" r="4"/></g>`) ]; // 爪印

  // ---------- 脸型 ×10（大头圆脸系，中心 (256,225)，闭合 path d） ----------
  const FACES = [
    'M128,225 a128,128 0 1 0 256,0 a128,128 0 1 0 -256,0',                                 // 标准圆脸 r128
    'M120,225 a136,136 0 1 0 272,0 a136,136 0 1 0 -272,0',                                 // 胖圆脸 r136
    'M134,218 a122,132 0 1 0 244,0 a122,132 0 1 0 -244,0',                                 // 高圆脸（竖椭圆）
    'M156,98 h200 a54,54 0 0 1 54,54 v146 a54,54 0 0 1 -54,54 h-200 a54,54 0 0 1 -54,-54 v-146 a54,54 0 0 1 54,-54', // 方脸
    'M142,225 a114,114 0 1 0 228,0 a114,114 0 1 0 -228,0',                                 // 小圆脸 r114
    'M124,225 a132,118 0 1 0 264,0 a132,118 0 1 0 -264,0',                                 // 包子脸（微扁圆）
    'M118,225 a138,106 0 1 0 276,0 a138,106 0 1 0 -276,0',                                 // 扁脸（宽椭圆）
    'M144,222 a112,136 0 1 0 224,0 a112,136 0 1 0 -224,0',                                 // 竖椭圆脸（窄高）
    'M130,220 a126,126 0 1 0 252,0 a126,126 0 1 0 -252,0',                                 // 大圆脸 r126
    'M126,228 a130,122 0 1 0 260,0 a130,122 0 1 0 -260,0' ];                               // 宽圆脸（下移微扁）

  // ---------- 身体 ×10（统一梯形：顶边 y240 深藏在脸后【所有脸型在 y240 处均比 210..302 宽】，底边 y498） ----------
  // ponytail: 顶边必须低于最尖脸型的下巴（倒三角脸底 y312）之上的安全线；若新增更尖的脸型需复查 y240 覆盖。
  const BODIES = [
    'M210,240 L158,498 L354,498 L302,240 Z',                                               // 标准梯形
    'M214,240 Q150,360 148,498 L364,498 Q362,360 298,240 Z',                               // 圆胖梨形（鼓边梯形）
    'M212,240 L198,498 L314,498 L300,240 Z',                                               // 瘦长条
    'M208,240 L138,498 L374,498 L304,240 Z',                                               // 矮胖墩
    'M210,240 Q188,300 174,340 Q160,390 154,440 Q146,470 150,498 L362,498 Q366,470 358,440 Q352,390 338,340 Q324,300 302,240 Z', // 毛茸蓬蓬（波浪边梯形）
    'M210,240 L160,470 Q152,498 180,498 L332,498 Q360,498 352,470 L302,240 Z',             // 蹲坐馒头（圆底角梯形）
    'M206,240 L128,498 L384,498 L306,240 Z',                                               // 宽扁
    'M210,240 L194,498 L318,498 L302,240 Z',                                               // 直立长方
    'M206,240 L118,498 L394,498 L306,240 Z',                                               // 超肥
    'M216,240 L214,498 L298,498 L296,240 Z' ];                                             // 幼猫迷你

  // 尾巴根部贴合偏移：与 BODIES 对齐（尾根 365,425 平移到各身体 y425 处右缘内侧 ~8px，防止窄身体悬空）
  const TAIL_TX = [-34, -12, -63, -19, -18, -31, -11, -60, -4, -76];

  // ---------- 尾巴 ×10（线条 path d，尾根 ~365,425 由 avatar.js 平移贴合身体） ----------
  const TAILS = [
    'M365,425 C415,420 440,395 438,355 C436,322 405,310 388,328 C377,340 383,356 397,352', // 问号卷尾
    'M365,425 C410,415 430,380 445,340 C455,312 450,285 432,272',                          // S 型上扬
    'M365,428 C400,435 415,455 418,480',                                                    // 自然下垂
    'M365,425 C405,415 435,395 435,355 C435,320 400,308 380,325 C365,338 372,360 390,357 C402,355 405,342 396,338', // 绕成一圈
    'M368,420 C372,380 370,330 368,275',                                                    // 笔直竖起
    'M365,425 C400,420 415,400 420,375 C425,350 415,330 425,305 C432,285 448,275 460,278', // 波浪摇尾
    'M365,430 C398,436 410,452 402,468 C396,480 382,478 380,466',                          // 夹腿害羞（右侧贴身小卷）
    'M365,425 C410,418 438,392 436,352 C434,315 398,302 378,320 C362,335 368,360 386,358 C398,356 400,340 390,337', // 卷成球
    'M365,427 C400,425 420,410 428,385 C432,372 430,360 424,352',                          // 微微上翘
    'M365,425 C410,415 435,385 442,345' ];                                                  // 蓬蓬炸毛尾（毛刺在 deco）

  const TAIL_DECO = [ // 与 TAILS 对齐的附加装饰（fn(fur)），大多为空
    () => '', () => '', () => '', () => '', () => '', () => '', () => '', () => '', () => '',
    fur => { const s = []; for (let i = 0; i < 9; i++) { const t = i / 8, x = 365 + 77 * t, y = 425 - 80 * t;
              s.push(`<line x1="${x - 9}" y1="${y - 6}" x2="${x - 17}" y2="${y - 12}" stroke="${fur}" stroke-width="6" stroke-linecap="round"/>`);
              s.push(`<line x1="${x + 9}" y1="${y + 6}" x2="${x + 17}" y2="${y + 12}" stroke="${fur}" stroke-width="6" stroke-linecap="round"/>`); }
            return s.join(''); } ];

  // ---------- 耳朵（形状固定为标准三角，长在头顶；d = 外耳闭合路径，(ax,ay) = 内耳锚点；右耳 = 镜像） ----------
  // 左右耳形状相同，差异来自各自独立抽取的毛色与耳内毛样式。
  // ponytail: 耳根边(152,185)-(250,115) 已验证被全部 10 种脸型覆盖（最小的小圆脸 r114 在 x=152 处缘 y=178）；
  //           新增脸型若更小需复查，否则会头耳分离。
  const EARS = [
    { d: 'M152,185 L116,22 L250,115 Z', ax: 176, ay: 119 } ];

  // ---------- 耳内毛 ×10（左右共用；c=null 表示用耳色即「无色差」；fn(ax,ay) 追加装饰） ----------
  const EAR_FURS = [
    { c: '#f2b8c6', fn: () => '' },                                                          // 素色内耳
    { c: '#f2b8c6', fn: (ax, ay) => `<circle cx="${ax}" cy="${ay - 42}" r="16" fill="#d98ea6"/>` }, // 内耳+耳尖变色
    { c: '#f2b8c6', fn: (ax, ay) => `<circle cx="${ax}" cy="${ay - 32}" r="14" fill="#e8a4b6"/><circle cx="${ax}" cy="${ay - 6}" r="14" fill="#f2b8c6"/>` }, // 双色内耳
    { c: '#f2b8c6', fn: (ax, ay) => `<path d="M${ax - 11},${ay - 42} Q${ax - 14},${ay - 24} ${ax - 9},${ay - 10} M${ax + 7},${ay - 42} Q${ax + 10},${ay - 24} ${ax + 5},${ay - 10}" fill="none" stroke="#d98ea6" stroke-width="5" stroke-linecap="round"/>` }, // 条纹内耳
    { c: '#f2b8c6', fn: () => '' },                                                          // 白边内耳（描边在组装层加）
    { c: '#f7c6d0', fn: () => '' },                                                          // 粉系内耳
    { c: '#8a6a72', fn: () => '' },                                                          // 深色系内耳
    { c: '#f2b8c6', fn: (ax, ay) => `<circle cx="${ax}" cy="${ay - 22}" r="26" fill="#ffffff" opacity="0.35"/>` }, // 渐变内耳（叠白模拟）
    { c: null,      fn: () => '' },                                                          // 无色差内耳
    { c: '#f2b8c6', fn: (ax, ay) => `<circle cx="${ax - 7}" cy="${ay - 32}" r="4" fill="#d98ea6"/><circle cx="${ax + 5}" cy="${ay - 24}" r="4" fill="#d98ea6"/><circle cx="${ax - 3}" cy="${ay - 14}" r="4" fill="#d98ea6"/>` } ]; // 点状内耳

  // ---------- 眼睛 ×10（fn(iL,iR) 画双眼，iL/iR=纯色铺满整眼；眼位 (206,175)/(306,175)；线条变体无颜色） ----------
  const LX = 206, RX = 306, EY = 195;
  const EYES = [
    (iL, iR) => [LX, RX].map((cx, i) => `<circle cx="${cx}" cy="${EY}" r="27" fill="${i ? iR : iL}" stroke="${STROKE}" stroke-width="5"/>`).join(''), // 标准圆眼
    (iL, iR) => [LX, RX].map((cx, i) => `<ellipse cx="${cx}" cy="${EY}" rx="17" ry="27" fill="${i ? iR : iL}" stroke="${STROKE}" stroke-width="5"/>`).join(''), // 竖椭圆眼（猫瞳）
    () => `<path d="M${LX - 24},${EY + 3} Q${LX},${EY - 19} ${LX + 24},${EY + 3} M${RX - 24},${EY + 3} Q${RX},${EY - 19} ${RX + 24},${EY + 3}" fill="none" stroke="${STROKE}" stroke-width="6" stroke-linecap="round"/>`, // 眯眯眼 ^ ^
    () => `<path d="M${LX - 24},${EY - 3} Q${LX},${EY + 19} ${LX + 24},${EY - 3} M${RX - 24},${EY - 3} Q${RX},${EY + 19} ${RX + 24},${EY - 3}" fill="none" stroke="${STROKE}" stroke-width="6" stroke-linecap="round"/>`, // 闭眼弧线
    (iL, iR) => [LX, RX].map((cx, i) => `<path d="M${cx},${EY - 24} L${cx + 7},${EY - 7} L${cx + 25},${EY - 5} L${cx + 11},${EY + 7} L${cx + 16},${EY + 25} L${cx},${EY + 15} L${cx - 16},${EY + 25} L${cx - 11},${EY + 7} L${cx - 25},${EY - 5} L${cx - 7},${EY - 7} Z" fill="${i ? iR : iL}" stroke="${STROKE}" stroke-width="5" stroke-linejoin="round"/>`).join(''), // 星星眼
    (iL, iR) => [LX, RX].map((cx, i) => `<path d="M${cx},${EY + 21} c-20,-8 -25,-28 -13,-36 c6,-4 12,-1 13,6 c1,-7 7,-10 13,-6 c12,8 7,28 -13,36 Z" fill="${i ? iR : iL}" stroke="${STROKE}" stroke-width="5" stroke-linejoin="round"/>`).join(''), // 爱心眼
    () => `<path d="M${LX - 22},${EY - 15} L${LX + 22},${EY} L${LX - 22},${EY + 15} M${RX + 22},${EY - 15} L${RX - 22},${EY} L${RX + 22},${EY + 15}" fill="none" stroke="${STROKE}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`, // >< 挤眼（左 > 右 < 双 chevron，无多余线头）
    (iL, iR) => [LX, RX].map((cx, i) => `<circle cx="${cx}" cy="${EY}" r="31" fill="${i ? iR : iL}" stroke="${STROKE}" stroke-width="5"/>`).join(''), // 闪亮大圆眼
    (iL, iR) => [LX, RX].map((cx, i) => `<path d="M${cx - 24},${EY - 4} a24,24 0 0 0 44,14 a24,24 0 0 1 -44,-14 Z" fill="${i ? iR : iL}" stroke="${STROKE}" stroke-width="5" stroke-linejoin="round"/>`).join(''), // 下弯月牙
    (iL, iR) => [LX, RX].map((cx, i) => `<circle cx="${cx}" cy="${EY}" r="17" fill="${i ? iR : iL}" stroke="${STROKE}" stroke-width="5"/>`).join(''), // 小圆点眼
    (iL, iR) => [LX, RX].map((cx, i) => `<path d="M${cx - 26},${EY} a26,26 0 0 1 52,0 Z" fill="${i ? iR : iL}" stroke="${STROKE}" stroke-width="5" stroke-linejoin="round"/>`).join(''), // 上半圆眼
    (iL, iR) => [LX, RX].map((cx, i) => `<path d="M${cx - 26},${EY} a26,26 0 0 0 52,0 Z" fill="${i ? iR : iL}" stroke="${STROKE}" stroke-width="5" stroke-linejoin="round"/>`).join(''), // 下半圆眼
    (iL, iR) => [LX, RX].map((cx, i) => `<path d="M${cx - 26},${EY} a26,26 0 0 0 52,0 Z" fill="${i ? iR : iL}" stroke="${STROKE}" stroke-width="5" stroke-linejoin="round" transform="rotate(${i ? 30 : -30} ${cx} ${EY})"/>`).join(''), // 委屈眼（下半圆 75%，外角下垂）
    (iL, iR) => [LX, RX].map((cx, i) => `<path d="M${cx - 26},${EY} a26,26 0 0 0 52,0 Z" fill="${i ? iR : iL}" stroke="${STROKE}" stroke-width="5" stroke-linejoin="round" transform="rotate(${i ? -30 : 30} ${cx} ${EY})"/>`).join('') ]; // 愤怒眼（下半圆 75%，内角下压）

  // ---------- 嘴巴 ×6（中心 (256,276)） ----------
  const MOUTHS = [
    () => `<path d="M228,268 Q242,288 256,272 Q270,288 284,268" fill="none" stroke="${STROKE}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`, // w 形
    () => `<path d="M230,268 Q256,300 282,268" fill="none" stroke="${STROKE}" stroke-width="6" stroke-linecap="round"/>`,                                          // u 形
    () => `<path d="M230,266 L256,294 L282,266" fill="none" stroke="${STROKE}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`,                 // v 形
    () => `<path d="M230,284 L256,256 L282,284" fill="none" stroke="${STROKE}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`,                 // 倒 v 形
    () => `<circle cx="256" cy="280" r="11" fill="#7a4a52" stroke="${STROKE}" stroke-width="6"/>`,                                                                    // 圆形（实心，同倒三角嘴色）
    () => `<path d="M228,266 L284,266 L256,296 Z" fill="#7a4a52" stroke="${STROKE}" stroke-width="6" stroke-linejoin="round"/>` ];                                 // 倒三角形

  // ---------- 胡须（fn(color, n)：纯白/纯黑 × 每边 n∈[3,5] 根，横向伸出脸颊，左右对称） ----------
  const WHISKERS = (color, n) => {
    const side = sign => { const l = [];
      for (let i = 0; i < n; i++) { const a = (i - (n - 1) / 2) * 13 * Math.PI / 180; // 扇形角度
        const x1 = 256 + sign * 92, y1 = 245, x2 = 256 + sign * (92 + 66 * Math.cos(a)), y2 = 245 + 66 * Math.sin(a);
        l.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="4.5" stroke-linecap="round"/>`); }
      return l.join(''); };
    return side(1) + side(-1);
  };

  // ---------- 头部花纹 ×5（fn(c1,c2)，clip 到脸；额头区域） ----------
  const HEAD_MARKS = [
    (c1) => `<path d="M236,112 Q232,146 239,178 M256,108 Q256,146 256,180 M276,112 Q280,146 273,178" fill="none" stroke="${c1}" stroke-width="10" stroke-linecap="round"/>`, // 额头 M 纹
    (c1) => `<ellipse cx="256" cy="118" rx="56" ry="32" fill="${c1}"/>`,                                                                                                     // 头顶斑
    (c1) => `<path d="M242,116 Q240,148 244,176 M270,116 Q272,148 268,176" fill="none" stroke="${c1}" stroke-width="11" stroke-linecap="round"/>`,                          // 额头竖纹
    (c1) => `<ellipse cx="166" cy="152" rx="28" ry="36" fill="${c1}"/><ellipse cx="346" cy="152" rx="28" ry="36" fill="${c1}"/>`,                                            // 耳边色块
    (c1) => `<path d="M256,158 c-22,-9 -28,-28 -15,-39 c7,-6 13,-3 15,4 c2,-7 8,-10 15,-4 c13,11 7,30 -15,39 Z" fill="${c1}"/>`,                                            // 额头心形斑
    (c1) => `<ellipse cx="256" cy="240" rx="82" ry="74" fill="${c1}"/>` ];                                                                                                   // 脸部面具（暹罗式：覆盖眼鼻区域的深色面罩，clip 到脸内）

  // ---------- 额外花纹 ×10（fn(c1,c2)，clip 到头+身） ----------
  const BODY_MARKS = [
    (c1) => `<path d="M196,344 Q256,326 316,344 M186,378 Q256,360 326,378 M196,412 Q256,396 316,412 M206,446 Q256,432 306,446" fill="none" stroke="${c1}" stroke-width="14" stroke-linecap="round"/>`, // 虎斑纹
    (c1) => `<path d="M176,368 q30,-20 60,-4 q18,10 8,34 q-16,26 -44,18 q-30,-10 -24,-48Z" fill="${c1}"/><path d="M296,404 q34,-14 50,10 q12,22 -10,36 q-28,14 -46,-6 q-14,-20 6,-40Z" fill="${c1}"/>`, // 奶牛斑
    (c1) => `<path d="M256,330 L180,498 L332,498 Z" fill="${c1}"/>`, // 燕尾服（白胸）
    (c1, c2) => `<path d="M160,380 q40,-30 84,-6 q20,14 6,40 q-24,30 -60,14 q-34,-16 -30,-48Z" fill="${c1}"/><path d="M300,420 q40,-16 56,12 q10,24 -16,36 q-30,12 -46,-12 q-10,-22 6,-36Z" fill="${c2}"/>`, // 双色斑块
    (c1) => `<path d="M160,352 Q256,334 352,352 M156,386 Q256,368 356,386 M162,420 Q256,404 350,420 M172,452 Q256,438 340,452" fill="none" stroke="${c1}" stroke-width="12" stroke-linecap="round"/>`, // 全身条纹
    (c1, c2) => `<ellipse cx="256" cy="364" rx="112" ry="42" fill="${c2}"/>`,                                                                                                   // 重点色（胸前浅斑，y364 在下巴下、身体内）
    (c1) => `<ellipse cx="256" cy="446" rx="112" ry="60" fill="${c1}"/>`,                                                                                                    // 渐层
    (c1, c2) => `<path d="M186,356 q26,-14 40,6 q8,14 -8,22 q-22,8 -32,-8 q-6,-12 0,-20Z" fill="${c1}"/><path d="M296,380 q30,-10 38,12 q4,18 -14,24 q-24,6 -32,-12 q-4,-16 8,-24Z" fill="${c2}"/><ellipse cx="230" cy="416" rx="20" ry="16" fill="${c2}"/><ellipse cx="322" cy="446" rx="22" ry="17" fill="${c1}"/>`, // 玳瑁斑
    (c1) => `<circle cx="202" cy="368" r="11" fill="${c1}"/><circle cx="256" cy="354" r="11" fill="${c1}"/><circle cx="310" cy="368" r="11" fill="${c1}"/><circle cx="228" cy="416" r="11" fill="${c1}"/><circle cx="284" cy="416" r="11" fill="${c1}"/><circle cx="256" cy="458" r="11" fill="${c1}"/>`, // 圆点斑
    (c1) => `<path d="M206,356 q-20,4 -18,24 q2,18 22,16 M300,356 q20,4 18,24 q-2,18 -22,16 M244,410 q-18,6 -12,24 q6,16 22,10" fill="none" stroke="${c1}" stroke-width="11" stroke-linecap="round"/>` ]; // 螺旋纹

  // ---------- 尾纹工具：解析尾路径（M + C 段），贝塞尔采样为点列（含隐式切线） ----------
  function tailPoints(d) {
    const n = d.match(/-?\d+(?:\.\d+)?/g).map(Number);
    const pts = [[n[0], n[1]]];
    for (let i = 2; i + 5 <= n.length - 1 + 1; i += 6) {
      if (i + 5 > n.length - 1) break;
      const c1 = [n[i], n[i + 1]], c2 = [n[i + 2], n[i + 3]], e = [n[i + 4], n[i + 5]];
      const p0 = pts[pts.length - 1];
      for (let t = 1; t <= 12; t++) {
        const u = 1 - t / 13, v = t / 13;
        pts.push([u * u * u * p0[0] + 3 * u * u * v * c1[0] + 3 * u * v * v * c2[0] + v * v * v * e[0],
                  u * u * u * p0[1] + 3 * u * u * v * c1[1] + 3 * u * v * v * c2[1] + v * v * v * e[1]]);
      }
    }
    return pts;
  }
  // 沿点列的辅助绘制：pl = 描一段路径；ring = 在 idx 处画垂直于路径的环纹
  const tpl = (pts, from, to, color, w, op) =>
    `<polyline points="${pts.slice(from, to + 1).map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ')}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${op ? ` opacity="${op}"` : ''}/>`;
  const tring = (pts, idx, color, w) => {
    const p = pts[idx], q = pts[Math.min(idx + 2, pts.length - 1)];
    const dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1;
    const nx = -dy / l * 15, ny = dx / l * 15;
    return `<line x1="${(p[0] + nx).toFixed(1)}" y1="${(p[1] + ny).toFixed(1)}" x2="${(p[0] - nx).toFixed(1)}" y2="${(p[1] - ny).toFixed(1)}" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`;
  };

  // ---------- 尾巴花纹 ×10（fn(c1,c2,pts)，pts = 尾路径采样点；纹样沿尾巴实际形状生成） ----------
  const TAIL_MARKS = [
    (c1, c2, pts) => [0.3, 0.45, 0.6, 0.75].map(f => tring(pts, Math.round(f * (pts.length - 1)), c1, 15)).join(''),                       // 节节环纹
    (c1, c2, pts) => tpl(pts, Math.round(0.86 * (pts.length - 1)), pts.length - 1, c1, 30),                                                 // 尾尖色块
    (c1, c2, pts) => [0.22, 0.32, 0.42, 0.52, 0.62, 0.72].map(f => tring(pts, Math.round(f * (pts.length - 1)), c1, 7)).join(''),           // 条纹尾
    (c1, c2, pts) => tpl(pts, Math.round(0.52 * (pts.length - 1)), pts.length - 1, c1, 28),                                                 // 双色尾（后半段换色）
    (c1, c2, pts) => tpl(pts, Math.round(0.52 * (pts.length - 1)), pts.length - 1, c1, 28, 0.55),                                           // 渐变尾
    (c1, c2, pts) => [0.25, 0.4, 0.55, 0.7, 0.85].map(f => { const p = pts[Math.round(f * (pts.length - 1))]; return `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="8" fill="${c1}"/>`; }).join(''), // 斑点尾
    (c1, c2, pts) => [0.35, 0.55, 0.75].map(f => { const p = pts[Math.round(f * (pts.length - 1))]; return `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="7" fill="none" stroke="${c1}" stroke-width="5"/><circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="2.5" fill="${c1}"/>`; }).join(''), // 螺旋尾（同心螺纹）
    (c1, c2, pts) => [[0.3, c1], [0.45, c2], [0.6, c1], [0.75, c2]].map(([f, c]) => tring(pts, Math.round(f * (pts.length - 1)), c, 15)).join(''), // 双色环
    (c1, c2, pts) => tpl(pts, Math.round(0.9 * (pts.length - 1)), pts.length - 1, c1, 30),                                                  // 尾尖白
    (c1, c2, pts) => tpl(pts, 0, pts.length - 1, c1, 28) ];                                                                                 // 满色尾

  // ---------- 腮红 ×10（左右同款，颜色随样式自带；中心左 (158,258) / 右 (354,258)） ----------
  const blushAt = (cx, inner) => `<g transform="translate(${cx},258)">${inner}</g>`;
  const BLUSHES = [
    () => blushAt(158, '<circle r="16" fill="#f7a8b8" opacity="0.75"/>') + blushAt(354, '<circle r="16" fill="#f7a8b8" opacity="0.75"/>'),                                       // 粉圆
    () => blushAt(158, '<ellipse rx="19" ry="12" fill="#f5b899" opacity="0.8"/>') + blushAt(354, '<ellipse rx="19" ry="12" fill="#f5b899" opacity="0.8"/>'),                     // 橘粉椭圆
    () => blushAt(158, '<path d="M-14,-8 L10,-16 M-16,2 L8,-6 M-14,12 L10,4" stroke="#e8788a" stroke-width="5" stroke-linecap="round"/>') + blushAt(354, '<path d="M-14,-8 L10,-16 M-16,2 L8,-6 M-14,12 L10,4" stroke="#e8788a" stroke-width="5" stroke-linecap="round"/>'), // 红斜线三道
    () => blushAt(158, '<circle r="20" fill="#f7a8b8" opacity="0.4"/><circle r="11" fill="#f28ba0" opacity="0.8"/>') + blushAt(354, '<circle r="20" fill="#f7a8b8" opacity="0.4"/><circle r="11" fill="#f28ba0" opacity="0.8"/>'), // 渐变圆
    () => blushAt(158, '<path d="M0,10 c-11,-5 -14,-15 -7,-20 c3,-3 7,-1 7,2 c0,-3 4,-5 7,-2 c7,5 4,15 -7,20Z" fill="#f28ba0" opacity="0.85"/>') + blushAt(354, '<path d="M0,10 c-11,-5 -14,-15 -7,-20 c3,-3 7,-1 7,2 c0,-3 4,-5 7,-2 c7,5 4,15 -7,20Z" fill="#f28ba0" opacity="0.85"/>'), // 心形
    () => blushAt(158, '<ellipse rx="17" ry="10" fill="#f5a0a8" opacity="0.8" transform="rotate(-12)"/>') + blushAt(354, '<ellipse rx="17" ry="10" fill="#f5a0a8" opacity="0.8" transform="rotate(12)"/>'), // 斜椭圆
    () => blushAt(158, '<circle cx="-7" r="7" fill="#f7a8b8" opacity="0.8"/><circle cx="8" cy="4" r="5" fill="#f7a8b8" opacity="0.8"/>') + blushAt(354, '<circle cx="-7" r="7" fill="#f7a8b8" opacity="0.8"/><circle cx="8" cy="4" r="5" fill="#f7a8b8" opacity="0.8"/>'), // 双圆点
    () => blushAt(158, '<circle r="21" fill="#f7a8b8" opacity="0.65"/>') + blushAt(354, '<circle r="21" fill="#f7a8b8" opacity="0.65"/>'),                                       // 大圆
    () => blushAt(158, '<circle r="10" fill="#f28ba0" opacity="0.85"/>') + blushAt(354, '<circle r="10" fill="#f28ba0" opacity="0.85"/>'),                                       // 小圆
    () => blushAt(158, '<path d="M0,-12 L11,6 L-11,6 Z" fill="#f5a0a8" opacity="0.8" stroke-linejoin="round"/>') + blushAt(354, '<path d="M0,-12 L11,6 L-11,6 Z" fill="#f5a0a8" opacity="0.8" stroke-linejoin="round"/>') ]; // 三角形

  // ---------- 眉毛 ×10（fn(color) 画左右；左眉基线 (184,158)-(228,158)，右 = 镜像） ----------
  const brow = d => `<path d="${d}" fill="none" stroke-width="6" stroke-linecap="round"/>`;
  const BROWS = [
    c => brow('M184,158 L228,158') + M(brow('M184,158 L228,158')),                                             // 平直眉
    c => brow('M184,150 L228,162') + M(brow('M184,150 L228,162')),                                             // 上挑眉
    c => brow('M184,164 L228,152') + M(brow('M184,164 L228,152')),                                             // 八字无辜眉
    c => brow('M184,150 L228,162') + M(brow('M184,150 L228,162')),                                             // 倒八字生气眉
    c => brow('M184,162 Q206,148 228,162') + M(brow('M184,162 Q206,148 228,162')),                             // 拱形眉
    c => brow('M186,162 L226,152') + M(brow('M186,162 L226,152')),                                             // 斜上眉
    c => brow('M186,152 L226,162') + M(brow('M186,152 L226,162')),                                             // 斜下眉
    c => brow('M184,160 Q194,152 202,160 Q210,168 228,160') + M(brow('M184,160 Q194,152 202,160 Q210,168 228,160')), // 波浪眉
    c => `<path d="M188,158 L224,158" stroke="${c}" stroke-width="9" stroke-linecap="round"/>` + M(`<path d="M188,158 L224,158" stroke="${c}" stroke-width="9" stroke-linecap="round"/>`), // 短粗眉
    c => `<path d="M180,158 L232,158" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>` + M(`<path d="M180,158 L232,158" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>`) ]; // 细长眉

  // ---------- T恤图案 ×8（约 25% 概率无图案；画在胸前，随服装层被 m-body-edge 裁进身体） ----------
  const TSHIRT_ART = [
    () => `<g transform="translate(256,420)"><path d="M-26,0 Q-10,-14 8,-10 L26,-18 L22,0 L26,18 L8,10 Q-10,14 -26,0 Z" fill="#f2d13d" stroke="${STROKE}" stroke-width="4" stroke-linejoin="round"/><circle cx="-14" cy="-3" r="2.5" fill="${STROKE}"/></g>`, // 小鱼
    () => `<g transform="translate(256,418)" fill="#fff"><ellipse cx="0" cy="6" rx="14" ry="11"/><ellipse cx="-15" cy="-8" rx="5" ry="6"/><ellipse cx="0" cy="-12" rx="5" ry="6"/><ellipse cx="15" cy="-8" rx="5" ry="6"/></g>`, // 爪印
    () => `<path d="M256,438 Q234,420 234,404 Q234,390 248,390 Q256,390 256,398 Q256,390 264,390 Q278,390 278,404 Q278,420 256,438 Z" fill="#f28ba0" stroke="${STROKE}" stroke-width="4" stroke-linejoin="round"/>`, // 爱心
    () => `<path d="M256,392 L264,412 L286,412 L268,424 L276,446 L256,432 L236,446 L244,424 L226,412 L248,412 Z" fill="#f2d13d" stroke="${STROKE}" stroke-width="4" stroke-linejoin="round"/>`, // 星星
    () => `<path d="M120,392 h272 M120,424 h272 M120,456 h272" stroke="#fff" stroke-width="10"/>`, // 海魂条纹（超宽由身体裁剪）
    () => `<g fill="#fff"><circle cx="224" cy="400" r="6"/><circle cx="256" cy="400" r="6"/><circle cx="288" cy="400" r="6"/><circle cx="224" cy="432" r="6"/><circle cx="256" cy="432" r="6"/><circle cx="288" cy="432" r="6"/><circle cx="224" cy="464" r="6"/><circle cx="256" cy="464" r="6"/><circle cx="288" cy="464" r="6"/></g>`, // 波点
    () => `<g transform="translate(256,420) rotate(-15)"><path d="M-22,-6 Q-30,-14 -22,-18 Q-14,-22 -12,-12 L12,-12 Q14,-22 22,-18 Q30,-14 22,-6 Q30,2 22,6 Q14,10 12,0 L-12,0 Q-14,10 -22,6 Q-30,2 -22,-6 Z" fill="#fff" stroke="${STROKE}" stroke-width="3.5" stroke-linejoin="round"/></g>`, // 骨头
    () => `<path d="M264,388 L238,424 L254,424 L246,452 L276,414 L258,414 Z" fill="#f2d13d" stroke="${STROKE}" stroke-width="4" stroke-linejoin="round"/>` ]; // 闪电

  // ---------- T恤底色 ×6（亮色；每色配同系深色领口线） ----------
  const TEE_COLORS = [
    ['#5b8fd9', '#4a76b8'], // 天蓝
    ['#f2d13d', '#d9b32e'], // 奶黄
    ['#7ecb6f', '#5da652'], // 草绿
    ['#f28ba0', '#d06a80'], // 樱粉
    ['#b892e8', '#9670c4'], // 香芋紫
    ['#f2a65a', '#d9853e'] ]; // 活力橘

  // ---------- 衬衫花纹 ×8（单色 = 同系深色 lc；方格/重复几何图形，无彩色图案） ----------
  const SHIRT_PATS = [
    lc => `<path d="M120,396 H392 M120,432 H392 M120,468 H392 M196,376 V498 M256,376 V498 M316,376 V498" stroke="${lc}" stroke-width="5" fill="none"/>`,                                                   // 大方格
    lc => `<path d="M120,386 H392 M120,412 H392 M120,438 H392 M120,464 H392 M120,490 H392 M181,376 V498 M218,376 V498 M256,376 V498 M294,376 V498 M331,376 V498" stroke="${lc}" stroke-width="3" fill="none"/>`, // 细密小方格
    lc => `<path d="M198,402 h20 l-10,-15 Z M246,402 h20 l-10,-15 Z M294,402 h20 l-10,-15 Z M198,430 h20 l-10,-15 Z M246,430 h20 l-10,-15 Z M294,430 h20 l-10,-15 Z M198,458 h20 l-10,-15 Z M246,458 h20 l-10,-15 Z M294,458 h20 l-10,-15 Z M198,486 h20 l-10,-15 Z M246,486 h20 l-10,-15 Z M294,486 h20 l-10,-15 Z" fill="${lc}"/>`, // 重复小三角
    lc => `<path d="M208,396 l9,9 l-9,9 l-9,-9 Z M256,396 l9,9 l-9,9 l-9,-9 Z M304,396 l9,9 l-9,9 l-9,-9 Z M208,434 l9,9 l-9,9 l-9,-9 Z M256,434 l9,9 l-9,9 l-9,-9 Z M304,434 l9,9 l-9,9 l-9,-9 Z M208,472 l9,9 l-9,9 l-9,-9 Z M256,472 l9,9 l-9,9 l-9,-9 Z M304,472 l9,9 l-9,9 l-9,-9 Z" fill="${lc}"/>`, // 重复小菱形
    lc => `<g fill="${lc}"><circle cx="224" cy="398" r="7"/><circle cx="288" cy="398" r="7"/><circle cx="256" cy="424" r="7"/><circle cx="224" cy="450" r="7"/><circle cx="288" cy="450" r="7"/><circle cx="256" cy="476" r="7"/></g>`, // 交错圆点
    lc => `<path d="M200,398 h16 M208,390 v16 M248,398 h16 M256,390 v16 M296,398 h16 M304,390 v16 M200,430 h16 M208,422 v16 M248,430 h16 M256,422 v16 M296,430 h16 M304,422 v16 M200,462 h16 M208,454 v16 M248,462 h16 M256,454 v16 M296,462 h16 M304,454 v16 M200,494 h16 M208,486 v16 M248,494 h16 M256,486 v16 M296,494 h16 M304,486 v16" stroke="${lc}" stroke-width="4" fill="none"/>`, // 重复小十字
    lc => `<path d="M130,502 L270,362 M170,502 L310,362 M210,502 L350,362 M250,502 L390,362 M90,502 L230,362 M330,502 L470,362" stroke="${lc}" stroke-width="5" fill="none"/>`,                        // 斜条纹
    lc => `<path d="M120,392 H392 M120,420 H392 M120,448 H392 M120,476 H392" stroke="${lc}" stroke-width="5" fill="none"/>` ];                                                                       // 横条纹

  // ---------- 卫衣兜帽 ×1（拆两层：兜帽猫耳画在真耳之前、帽壳画在真耳之后——帽壳盖住耳根（耳朵从帽子开口里长出来），帽耳盖住真耳中下段（真耳尖端露出）；颜色比卫衣深一档） ----------
  const HOODIE = {
    colors: [ // [衣身, 兜帽]：同色系，衣身比 T恤深一档、帽再深一档；6 色 = TEE_COLORS 长度，tColor%6 均匀映射
      ['#4a76b8', '#3a5c90'], // 藏蓝
      ['#c94b6d', '#a83a56'], // 玫红
      ['#5b8c6e', '#46705a'], // 松绿
      ['#8a6fc0', '#6d54a0'], // 深紫
      ['#c9803e', '#a86630'], // 赭橙
      ['#4a8c9c', '#3a7180'] ], // 深青
    // 帽壳：椭圆按脸型参数 +18 围着头，脸盖住中间只露帽沿；画在真耳之上盖住耳根
    shell: (hood, cy, rx, ry) =>
      `<ellipse cx="256" cy="${cy}" rx="${rx + 18}" ry="${ry + 18}" fill="${hood}" stroke="${STROKE}" stroke-width="6"/>`,
    // 兜帽猫耳：真耳三角同款固定坐标（所有脸型通用）+ 耳内阴影；画在真耳之下、帽壳之下（真耳尖端从帽耳里露出来）
    ears: hood =>
      `<path d="M152,185 L116,22 L250,115 Z M360,185 L396,22 L262,115 Z" fill="${hood}" stroke="${STROKE}" stroke-width="6" stroke-linejoin="round"/>` +
      `<path d="M163,155 L143,66 L217,117 Z M349,155 L369,66 L295,117 Z" fill="${STROKE}" opacity="0.18"/>` }; // 耳内阴影（0.55 缩放，同真耳内毛比例）

  // ---------- 服装 ×10（大件 fn(d, art, tee)：轮廓直接用身体路径——身体多大衣服多大，零缩放零形变；细节画超宽（x120~392）由 m-body-edge 裁进身体且不盖脸。脖子小件 neck=true 跟随脸底，标准脸底 y=353） ----------
  const OUTFITS = [
    { neck: true, fn: () => `<g><path d="M256,372 L204,358 L204,402 L256,388 L308,402 L308,358 Z" fill="#d9534f" stroke="${STROKE}" stroke-width="6" stroke-linejoin="round"/><circle cx="256" cy="380" r="10" fill="#b23c39" stroke="${STROKE}" stroke-width="4"/></g>` }, // 领结
    { neck: true, fn: (fb = 353) => `<g><rect x="196" y="344" width="120" height="26" rx="13" fill="#e8836a" stroke="${STROKE}" stroke-width="6"/><path d="M216,362 L202,${fb + 141} Q210,${fb + 151} 222,${fb + 143} L234,368 Z" fill="#e8836a" stroke="${STROKE}" stroke-width="6" stroke-linejoin="round"/><path d="M206,382 h18 M207,408 h16 M208,434 h14 M210,458 h11" stroke="#c96a54" stroke-width="4"/></g>` }, // 围巾（项圈条上移 y354→344；垂布底 = 身体底 y498 随 fb 平移，按当前身体实际高度取长度；矮身体垂布变短，高身体变长）
    { neck: false, art: true, fn: (d, art, tee) => { const [c, lc] = TEE_COLORS[tee || 0]; return `<path d="${d}" fill="${c}"/><path d="M140,366 Q256,348 372,366" stroke="${lc}" stroke-width="6" fill="none"/>${TSHIRT_ART[art]()}`; } }, // 小 T 恤（6 种亮底色；100% 有图案，8 种等概率）
    { neck: false, art: true, hood: true, fn: (d, art, tee) => { const [c, h] = HOODIE.colors[(tee || 0) % HOODIE.colors.length]; return `<path d="${d}" fill="${c}"/><path d="M140,404 h232 M140,444 h232" stroke="${h}" stroke-width="5" fill="none"/>${TSHIRT_ART[art]()}`; } }, // 连帽卫衣衣身（100% 有图案，画在口袋线**之上**不被线条盖住；兜帽由 avatar.js 单独画在脸前；两道口袋线）
    { neck: false, art: true, shirt: true, fn: (d, art, tee, open, fur) => { const [c, lc] = TEE_COLORS[tee || 0]; const pat = art != null && art < SHIRT_PATS.length ? SHIRT_PATS[art](lc) : ''; const collar = `<path d="M256,344 L206,340 L216,378 L248,366 Z M256,344 L306,340 L296,378 L264,366 Z" fill="${lc}" stroke="${STROKE}" stroke-width="6" stroke-linejoin="round"/>`; return `<path d="${d}" fill="${c}"/>${pat}` + (open
      ? `<path d="M236,378 L276,378 L276,498 L236,498 Z" fill="${fur}"/><path d="M236,378 V498 M276,378 V498" stroke="${STROKE}" stroke-width="6" fill="none"/><circle cx="224" cy="420" r="5" fill="#fff" stroke="${STROKE}" stroke-width="3.5"/><circle cx="228" cy="456" r="5" fill="#fff" stroke="${STROKE}" stroke-width="3.5"/>${collar}` // 敞开：竖直条露毛色（无内搭、不斜），左襟两颗未扣的扣子
      : `<path d="M256,388 V496" stroke="${lc}" stroke-width="5"/><g fill="#fff" stroke="${STROKE}" stroke-width="3.5"><circle cx="256" cy="390" r="6"/><circle cx="256" cy="415" r="6"/><circle cx="256" cy="440" r="6"/><circle cx="256" cy="465" r="6"/><circle cx="256" cy="490" r="6"/></g>${collar}`); } }, // 衬衫（50% 扣上/敞开由第 24 位定；50% 概率花纹 = SHIRT_PATS 单色方格/重复几何图形；翻领两片，衣领上移贴脸底）
    { neck: false, fn: d => `<path d="${d}" fill="#4a6a9c"/><rect x="218" y="352" width="14" height="40" rx="7" fill="#4a6a9c" stroke="${STROKE}" stroke-width="3"/><rect x="280" y="352" width="14" height="40" rx="7" fill="#4a6a9c" stroke="${STROKE}" stroke-width="3"/><path d="M140,398 Q256,382 372,398" stroke="#3a5480" stroke-width="5" fill="none"/><circle cx="256" cy="424" r="12" fill="#f2d13d" stroke="${STROKE}" stroke-width="4"/>` }, // 背带裤
    { neck: false, fn: d => `<path d="${d}" fill="#c95c8c"/><path d="M140,368 Q256,352 372,368" stroke="#b44f7d" stroke-width="6" fill="none"/><path d="M140,414 Q256,398 372,414 M140,452 Q256,436 372,452" stroke="#b44f7d" stroke-width="5" fill="none"/>` }, // 毛衣
    { neck: true, fn: () => `<path d="M256,333 L192,347 L184,466 Q256,488 328,466 L320,347 Z" fill="#f2d13d" stroke="${STROKE}" stroke-width="6" stroke-linejoin="round"/><circle cx="256" cy="408" r="9" fill="#e8a03c"/><circle cx="232" cy="428" r="7" fill="#e8a03c"/><circle cx="280" cy="428" r="7" fill="#e8a03c"/>` }, // 围兜（口水巾：顶部伸入脸后被脸盖住，围住脖子）
    { neck: false, fn: d => `<path d="${d}" fill="#c9463d"/><path d="M140,384 Q256,366 372,384" stroke="#a83a32" stroke-width="16" fill="none"/><path d="M242,384 Q256,374 270,384 L266,400 Q256,392 246,400 Z" fill="#f2d13d" stroke="${STROKE}" stroke-width="4" stroke-linejoin="round"/>` }, // 小披风
    { neck: false, fn: d => `<path d="${d}" fill="#f5f5f0"/><path d="M140,368 Q256,350 372,368" stroke="#e0e0dc" stroke-width="5" fill="none"/><path d="M244,414 h24 v24 h-24 Z" fill="#d9534f" stroke="${STROKE}" stroke-width="3.5"/><path d="M252,420 v12 M246,426 h24" stroke="#fff" stroke-width="4"/>` }, // 护士服
    { neck: false, fn: d => `<path d="${d}" fill="#5ca86a"/><path d="M256,380 L256,492" stroke="#4a8c56" stroke-width="4"/><circle cx="228" cy="424" r="5" fill="#eef5ef"/><circle cx="284" cy="424" r="5" fill="#eef5ef"/>` }, // 小背心
    { neck: true, fn: () => `<g><path d="M192,337 Q256,357 320,337 Q322,351 316,357 Q256,377 196,357 Q190,351 192,337 Z" fill="#e86a8a" stroke="${STROKE}" stroke-width="6"/><circle cx="256" cy="372" r="12" fill="#f2d13d" stroke="${STROKE}" stroke-width="4"/><path d="M248,384 Q256,396 264,384" fill="none" stroke="${STROKE}" stroke-width="3"/></g>` } ]; // 项圈铃铛（整体上移 10px，弧顶 y337 更贴下巴）

  // ---------- 配饰 ×10（画在最上层）----------
  // ride=true 的跟随脸型头顶：部件按标准脸头顶 y=97 落位，渲染时按 faceTop-97 平移（10 种脸头顶 y=88~119）。
  // 眼镜固定于眼位(y195)；蝴蝶结/发夹夹在耳朵上（耳朵坐标固定）→ ride=false。
  const ACCESSORIES = [
    { ride: false, fn: () => `<g transform="translate(302,76) rotate(12)"><path d="M-26,-2 L-24,-20 L-8,-8 L0,-26 L8,-8 L24,-20 L26,-2 Q0,14 -26,-2Z" fill="#f28ba0" stroke="${STROKE}" stroke-width="6" stroke-linejoin="round"/><circle r="7" fill="#e8788a" stroke="${STROKE}" stroke-width="4"/></g>` }, // 蝴蝶结（夹右耳）
    { ride: true,  fn: () => `<g transform="translate(262,92)"><path d="M-44,6 Q-30,-22 6,-18 Q40,-14 44,2 Q20,12 -8,10 Q-32,9 -44,6Z" fill="#d9534f" stroke="${STROKE}" stroke-width="6" stroke-linejoin="round"/><circle cx="10" cy="-10" r="4" fill="#b23c39"/></g>` }, // 贝雷帽
    { ride: true,  fn: () => `<g transform="translate(256,84)"><ellipse rx="66" ry="16" fill="#f0d78c" stroke="${STROKE}" stroke-width="6"/><path d="M-34,-4 Q0,-44 34,-4 Q40,4 34,8 Q0,22 -34,8 Q-40,4 -34,-4Z" fill="#f5e3a8" stroke="${STROKE}" stroke-width="6" stroke-linejoin="round"/><path d="M-36,4 Q0,14 36,4" stroke="#c9a44a" stroke-width="6" fill="none"/></g>` }, // 小草帽
    { ride: false, fn: () => `<g fill="none" stroke="${STROKE}" stroke-width="6"><circle cx="206" cy="195" r="30" fill="#ffffff" fill-opacity="0.25"/><circle cx="306" cy="195" r="30" fill="#ffffff" fill-opacity="0.25"/><path d="M236,192 Q256,184 276,192"/><path d="M176,188 L154,182 M336,188 L358,182"/></g>` }, // 圆框眼镜
    { ride: false, fn: () => `<g fill="none" stroke="${STROKE}" stroke-width="6"><rect x="176" y="168" width="60" height="52" rx="9" fill="#ffffff" fill-opacity="0.25"/><rect x="276" y="168" width="60" height="52" rx="9" fill="#ffffff" fill-opacity="0.25"/><path d="M236,190 Q256,182 276,190"/><path d="M176,184 L154,178 M336,184 L358,178"/></g>` }, // 方框眼镜
    { ride: true,  fn: () => `<g transform="translate(256,84)"><path d="M-40,14 L-40,-10 L-20,2 L0,-18 L20,2 L40,-10 L40,14 Q20,22 0,22 Q-20,22 -40,14Z" fill="#f2d13d" stroke="${STROKE}" stroke-width="6" stroke-linejoin="round"/><circle cx="-20" cy="2" r="3.5" fill="#e8a03c"/><circle cx="0" cy="-6" r="3.5" fill="#e8a03c"/><circle cx="20" cy="2" r="3.5" fill="#e8a03c"/></g>` }, // 皇冠
    { ride: true,  fn: () => `<g fill="none" stroke="${STROKE}" stroke-width="6"><path d="M160,116 Q256,72 352,116" fill="none"/><rect x="138" y="108" width="34" height="52" rx="14" fill="#5b8fd9"/><rect x="340" y="108" width="34" height="52" rx="14" fill="#5b8fd9"/></g>` }, // 耳机（弧顶贴头顶）
    { ride: false, fn: () => `<g transform="translate(300,78) rotate(18)"><rect x="-4" y="-22" width="8" height="44" rx="4" fill="#67b26a" stroke="${STROKE}" stroke-width="6"/><circle r="7" fill="#f2d13d" stroke="${STROKE}" stroke-width="4"/></g>` }, // 发夹（夹右耳）
    { ride: true,  fn: () => `<g transform="translate(256,96)"><path d="M-52,16 Q0,-16 52,16" fill="none" stroke="#5ca86a" stroke-width="6"/><g fill="#f28ba0" stroke="${STROKE}" stroke-width="4"><circle cx="-44" cy="12" r="9"/><circle cx="-16" cy="-2" r="9"/><circle cx="16" cy="-2" r="9"/><circle cx="44" cy="12" r="9"/></g><g fill="#f2d13d"><circle cx="-30" cy="6" r="4"/><circle cx="0" cy="-8" r="4"/><circle cx="30" cy="6" r="4"/></g></g>` }, // 花环
    { ride: true,  fn: () => `<g transform="translate(256,86)"><path d="M-30,12 L-30,-8 L-15,2 L0,-14 L15,2 L30,-8 L30,12 Q15,18 0,18 Q-15,18 -30,12Z" fill="#9b7fd4" stroke="${STROKE}" stroke-width="6" stroke-linejoin="round"/></g>` } ]; // 迷你皇冠

  // ---------- 物品 ×10（fn(x,y) 在指定侧绘制，~80px 大小；放置于 (52,452) 附近） ----------
  const ITEMS = [
    (x, y) => `<g transform="translate(${x},${y})"><path d="M-30,0 Q-16,-16 8,-14 Q30,-12 34,0 Q30,12 8,14 Q-16,16 -30,0 Z" fill="#d99a5b" stroke="${STROKE}" stroke-width="6" stroke-linejoin="round"/><path d="M-30,0 L-42,-10 M-30,0 L-42,10" stroke="${STROKE}" stroke-width="6" stroke-linecap="round"/><circle cx="20" cy="-4" r="2.5" fill="${STROKE}"/></g>`, // 小鱼干
    (x, y) => `<g transform="translate(${x},${y})"><circle r="26" fill="#f28ba0" stroke="${STROKE}" stroke-width="6"/><path d="M-20,-8 Q4,-22 18,-4 M-16,12 Q8,22 20,2 M-8,-18 Q-22,2 -12,18" fill="none" stroke="#e8788a" stroke-width="6" stroke-linecap="round"/><path d="M24,-20 L40,-34 M28,-8 L46,-14" stroke="#e8788a" stroke-width="6" stroke-linecap="round"/></g>`, // 毛线球
    (x, y) => `<g transform="translate(${x},${y})"><rect x="-14" y="-6" width="28" height="34" rx="8" fill="#dceefb" stroke="${STROKE}" stroke-width="6"/><rect x="-10" y="-26" width="20" height="22" rx="8" fill="#fff" stroke="${STROKE}" stroke-width="6"/><rect x="-14" y="10" width="28" height="8" fill="#bcd9ef"/></g>`, // 奶瓶
    (x, y) => `<g transform="translate(${x},${y})"><path d="M-32,0 Q-20,-12 -6,-10 L-2,-14 L2,-10 Q18,-12 30,0 Q18,12 2,10 L-2,14 L-6,10 Q-20,12 -32,0 Z" fill="#eef0f2" stroke="${STROKE}" stroke-width="6" stroke-linejoin="round"/><path d="M-6,-10 L-2,-14 L2,-10 M-6,10 L-2,14 L2,10" stroke="${STROKE}" stroke-width="4"/><circle cx="-24" cy="0" r="3" fill="${STROKE}"/></g>`, // 鱼骨头
    (x, y) => `<g transform="translate(${x},${y})"><ellipse rx="30" ry="24" fill="#d9c3a5" stroke="${STROKE}" stroke-width="6"/><ellipse cx="18" cy="-4" rx="12" ry="9" fill="#b89f7e" stroke="${STROKE}" stroke-width="4"/></g>`, // 猫抓板
    (x, y) => `<g transform="translate(${x},${y})"><ellipse rx="26" ry="12" fill="#c8ccd4" stroke="${STROKE}" stroke-width="6"/><rect x="-26" y="-16" width="52" height="32" fill="#eef0f2" stroke="${STROKE}" stroke-width="6"/><rect x="-16" y="-8" width="32" height="16" rx="3" fill="#d9534f"/></g>`, // 罐头
    (x, y) => `<g transform="translate(${x},${y})"><line x1="-26" y1="30" x2="8" y2="-20" stroke="#a5795f" stroke-width="6" stroke-linecap="round"/><g stroke="${STROKE}" stroke-width="4" fill="#f28ba0" stroke-linejoin="round"><ellipse cx="14" cy="-26" rx="7" ry="14" transform="rotate(35 14 -26)"/><ellipse cx="22" cy="-20" rx="7" ry="14" transform="rotate(65 22 -20)"/><ellipse cx="6" cy="-32" rx="7" ry="14" transform="rotate(10 6 -32)"/></g></g>`, // 逗猫棒
    (x, y) => `<g transform="translate(${x},${y})"><circle r="22" fill="#9b7fd4" stroke="${STROKE}" stroke-width="6"/><path d="M-16,-10 L-22,-16 M-2,-18 L-4,-26 M12,-12 L18,-18 M18,4 L26,2 M8,14 L12,22" stroke="#9b7fd4" stroke-width="7" stroke-linecap="round"/></g>`, // 毛球
    (x, y) => `<g transform="translate(${x},${y})"><path d="M-28,8 Q-28,-14 -6,-16 Q4,-28 16,-16 Q32,-12 30,4 Q32,16 16,18 Q0,24 -14,18 Q-28,16 -28,8 Z" fill="#b8bcc4" stroke="${STROKE}" stroke-width="6" stroke-linejoin="round"/><circle cx="18" cy="-2" r="3" fill="${STROKE}"/><path d="M26,6 L34,12" stroke="#d98ea6" stroke-width="4" stroke-linecap="round"/></g>`, // 老鼠玩具
    (x, y) => `<g transform="translate(${x},${y})"><path d="M-30,-16 L30,-16 L34,24 L-34,24 Z" fill="#d9b98c" stroke="${STROKE}" stroke-width="6" stroke-linejoin="round"/><path d="M-30,-16 L-22,-28 L-6,-16 M6,-16 L22,-28 L30,-16" fill="#c9a86f" stroke="${STROKE}" stroke-width="6" stroke-linejoin="round"/><path d="M-34,24 h68" stroke="#b89f6e" stroke-width="4"/></g>` ]; // 纸箱

  // ---------- 心情符号 ×9（画在头像左上角 (96,96) 最上层，60% 出现；感叹号/问号类带 ~12° 倾斜） ----------
  const MOODS = [
    () => `<path d="M96,70 Q84,54 70,60 Q56,66 58,82 Q60,98 96,124 Q132,98 134,82 Q136,66 122,60 Q108,54 96,70 Z" fill="#f28ba0" stroke="${STROKE}" stroke-width="5" stroke-linejoin="round"/>`, // 粉色爱心
    () => `<path d="M96,42 Q104,88 122,96 Q104,104 96,150 Q88,104 70,96 Q88,88 96,42 Z" fill="#f2d13d" stroke="${STROKE}" stroke-width="5" stroke-linejoin="round"/>` + // 黄色菱形星星（四角星，四边向内弯的弧）
      `<path d="M48,136 Q50,148 62,150 Q50,152 48,164 Q46,152 34,150 Q46,148 48,136 Z" fill="#f2d13d" stroke="${STROKE}" stroke-width="4" stroke-linejoin="round"/>`, // 左下角缩小的小四角星
    () => `<g transform="translate(96,96) rotate(-12)" fill="#5b8fd9" stroke="${STROKE}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="-10" cy="-26" rx="10" ry="14"/><path d="M-16,10 Q-14,-4 -6,-8 L-2,-11 L-2,6" fill="none"/><circle cx="-2" cy="26" r="6" stroke="none"/></g>`, // 音符（八分音符：符头+符杆+符尾）
    () => `<path d="M67,51 Q96,86 125,51 M67,141 Q96,106 125,141 M51,67 Q75,96 51,125 M141,67 Q117,96 141,125" stroke="#d9534f" stroke-width="13" stroke-linecap="round" fill="none"/>`, // 生气（四角向内：井字四边全向中心凹的弧线；弧端切线各倾 50°，相邻弧夹角 80°；四边间隙拉大、角落端点分开不再挤；笔画 13）
    () => `<g transform="translate(96,96) rotate(-12)" fill="none" stroke="#5b8fd9" stroke-width="11" stroke-linecap="round"><path d="M-15,-4 Q-22,-34 0,-36 Q22,-34 17,-12 Q13,2 -2,10 L-2,18"/><path d="M-2,34 v4"/></g>`, // 问号（倾斜）：钩子沿左侧上顶绕右侧下弯回中心，下接一个点
    () => `<g transform="translate(96,96) rotate(-12)" fill="none" stroke="#5b8fd9" stroke-width="11" stroke-linecap="round"><g transform="translate(-33,0) scale(0.75)"><path d="M-15,-4 Q-22,-34 0,-36 Q22,-34 17,-12 Q13,2 -2,10 L-2,18"/><path d="M-2,34 v4"/></g><g transform="translate(33,0) scale(0.75)"><path d="M-15,-4 Q-22,-34 0,-36 Q22,-34 17,-12 Q13,2 -2,10 L-2,18"/><path d="M-2,34 v4"/></g></g>`, // 双问号（倾斜）：两个 0.75 缩小的问号并排
    () => `<g transform="translate(96,96) rotate(-12)" fill="#d9534f"><rect x="-10" y="-42" width="20" height="46" rx="9"/><circle cy="30" r="11"/></g>`, // 感叹号（倾斜）
    () => `<g transform="translate(96,96) rotate(-12)" fill="#d9534f"><rect x="-40" y="-42" width="20" height="46" rx="9"/><circle cx="-30" cy="30" r="11"/><rect x="20" y="-42" width="20" height="46" rx="9"/><circle cx="30" cy="30" r="11"/></g>`, // 双感叹号（倾斜）
    () => `<g fill="#5b8fd9"><circle cx="62" cy="96" r="11"/><circle cx="96" cy="96" r="11"/><circle cx="130" cy="96" r="11"/></g>` ]; // 三个点（省略号）

  return { STROKE, SW, FURS, IRIS, BG, BG_PATTERNS, FACES, BODIES, TAIL_TX, TAILS, TAIL_DECO, tailPoints,
           EARS, EAR_FURS, EYES, MOUTHS, WHISKERS, HEAD_MARKS, BODY_MARKS, TAIL_MARKS,
           BLUSHES, BROWS, TSHIRT_ART, TEE_COLORS, HOODIE, OUTFITS, ACCESSORIES, ITEMS, MOODS };
})();
