// avatar.js —— 纯生成模块：seed → SHA-256 → PRNG → 部件抽取 → SVG 字符串
// 零 UI / 零 DOM 依赖。对外暴露 window.renderAvatar(seed) → Promise<string>。
// 依赖：parts.js（window.PARTS）、breeds.js（window.BREEDS）需先于本文件加载。
window.renderAvatar = (function () {
  // ---------- 工具 ----------
  async function sha256(str) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return new Uint8Array(buf);
  }
  function mulberry32(a) { // 确定性 PRNG
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  const makeRng = f => ({
    f,
    int: n => Math.floor(f() * n),
    chance: p => f() < p,
  });
  function shiftL(hex, dl) { // 明度调整（dl 正=亮 负=暗，0~1），hex 往返
    const n = parseInt(hex.slice(1), 16), r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
    let h = 0, s = 0;
    if (mx !== mn) {
      const d = mx - mn;
      s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h /= 6;
    }
    const L = Math.min(1, Math.max(0, l + dl)), q = L < 0.5 ? L * (1 + s) : L + s - L * s, p = 2 * L - q;
    const cv = t => { t = (t + 1) % 1; if (t < 1 / 6) return p + (q - p) * 6 * t; if (t < 0.5) return q; if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6; return p; };
    const hx = v => Math.round(v * 255).toString(16).padStart(2, '0');
    return '#' + hx(cv(h + 1 / 3)) + hx(cv(h)) + hx(cv(h - 1 / 3));
  }

  // ---------- 生成 ----------
  return async function renderAvatar(seed) {
    const hash = await sha256(String(seed));
    const seed32 = (hash[0] | hash[1] << 8 | hash[2] << 16 | hash[3] << 24) >>> 0;
    const rng = makeRng(mulberry32(seed32));
    const { STROKE, FURS, IRIS, BG, BG_PATTERNS, FACES, BODIES, TAIL_TX, TAILS, TAIL_DECO, tailPoints,
            EARS, EAR_FURS, EYES, MOUTHS, WHISKERS, HEAD_MARKS, BODY_MARKS, TAIL_MARKS,
            BLUSHES, BROWS, TSHIRT_ART, TEE_COLORS, HOODIE, OUTFITS, ACCESSORIES, ITEMS, MOODS } = window.PARTS;

    // ===== PRNG 消费顺序（新增部件的随机数只能追加在末尾，见 REQUIREMENTS.md §4.2）=====
    // 1. 品种判定：99.9% 普通猫 / 0.1% 品种猫（12 种等概率）
    const breedPool = rng.chance(0.001) ? window.BREEDS[rng.int(window.BREEDS.length)] : null;

    // 2-3. 背景色 + 背景图案（两种猫都随机）
    const bg = BG[rng.int(BG.length)];
    const bgPatI = rng.int(BG_PATTERNS.length);
    const bgPattern = BG_PATTERNS[bgPatI];

    let cat, mouth, brow;
    // 撞色判定：RGB 欧氏距离 <42 视为撞色（图案元素与花纹同色时会被误读成花纹溢出轮廓）
    const clash = (a, b) => {
      const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
      const dr = (pa >> 16 & 255) - (pb >> 16 & 255), dg = (pa >> 8 & 255) - (pb >> 8 & 255), db = (pa & 255) - (pb & 255);
      return dr * dr + dg * dg + db * db < 42 * 42;
    };
    const patColor = base => { // 花纹色 = 毛色明度 ±5%~10%（方向、幅度独立随机）
      const dir = rng.chance(0.5) ? 1 : -1;
      let c = shiftL(base, dir * (0.05 + rng.f() * 0.05));
      // ponytail: 花纹色撞背景图案色（浅毛提亮后≈浅色图案，如 #eae2ce vs #f0e2cf）时，
      // 图案会被看成花纹漏出身体/尾巴；不消耗随机数，按 6% 明度压暗拉开，
      // 3 步后仍撞就认了（极端浅毛）。素色背景（无图案）无需规避。
      if (bgPatI !== 0) for (let i = 0; i < 3 && clash(c, bg.pc); i++) c = shiftL(c, -0.06);
      return c;
    };

    if (breedPool) {
      // ===== 品种猫：五官由图纸固定；仅嘴/眉/服装/配饰/物品照常随机 =====
      mouth = rng.int(MOUTHS.length);
      brow = rng.chance(0.7) ? { c: rng.chance(0.5) ? '#3b3b46' : '#8d8d99', i: rng.int(BROWS.length) } : null;
      // 图纸的花纹/腮红是数字索引 → 规范化为对象（颜色留空，渲染时回退 mc/mc2）
      const mk = v => v == null ? null : { i: v };
      cat = { ...breedPool, earLS: 0, earRS: 0, iris2: breedPool.iris,   // 耳形已固定为三角形，图纸 ear 字段废弃
              whisker: { c: breedPool.whisker.color, n: breedPool.whisker.n }, // 图纸字段 color → 渲染层 c
              headMark: mk(breedPool.headMark), bodyMark: mk(breedPool.bodyMark),
              tailMark: mk(breedPool.tailMark), blush: mk(breedPool.blush) };
    } else {
      // ===== 普通猫：完整随机（统一构造为与品种图纸同构的 cat） =====
      const fur = FURS[rng.int(FURS.length)];         // 4. 统一毛色（头/身/尾共用）
      const tailI = rng.int(TAILS.length);            // 5. 尾巴
      const earLS = rng.int(EARS.length);             // 6. 左耳形
      const earRS = rng.int(EARS.length);             // 7. 右耳形（独立）
      //    耳色：80% 双耳与身体同色 / 15% 单耳异色（侧随机，保证与身体色不同）/ 5% 双耳独立随机
      const earRoll = rng.f();
      let earCL = fur, earCR = fur;
      if (earRoll >= 0.95) {                          // 5%：双耳独立随机
        earCL = FURS[rng.int(FURS.length)];
        earCR = FURS[rng.int(FURS.length)];
      } else if (earRoll >= 0.8) {                    // 15%：单耳异色
        if (rng.chance(0.5)) { do { earCL = FURS[rng.int(FURS.length)]; } while (earCL === fur); }
        else { do { earCR = FURS[rng.int(FURS.length)]; } while (earCR === fur); }
      }
      const earFi = rng.int(EAR_FURS.length);         // 8. 耳内毛（左右共用）
      const faceI = rng.int(FACES.length);            //    脸型
      const bodyI = rng.int(BODIES.length);           //    身体
      const eyeI = rng.int(EYES.length);              // 9. 眼样式
      const irisI = rng.int(IRIS.length);             //    虹膜色
      let iris2I = irisI;                             //    异瞳 30%
      if (rng.chance(0.3)) { do { iris2I = rng.int(IRIS.length); } while (iris2I === irisI); }
      mouth = rng.int(MOUTHS.length);                 // 10. 嘴
      const whisker = { c: rng.chance(0.5) ? '#ffffff' : '#3b3b46', n: 3 + rng.int(3) }; // 11. 胡须（每边 3~5 根）
      brow = rng.chance(0.7) ? { c: rng.chance(0.5) ? '#3b3b46' : '#8d8d99', i: rng.int(BROWS.length) } : null; // 12. 眉毛
      const headMark = rng.chance(0.5) ? { c1: patColor(fur), i: rng.int(HEAD_MARKS.length) } : null;            // 13. 头部花纹
      const bodyMark = rng.chance(0.5) ? { c1: patColor(fur), c2: patColor(fur), i: rng.int(BODY_MARKS.length) } : null; // 14. 额外花纹
      const tailMark = rng.chance(0.5) ? { c1: patColor(fur), c2: patColor(fur), i: rng.int(TAIL_MARKS.length) } : null; // 15. 尾巴花纹
      const blush = rng.chance(0.5) ? { i: rng.int(BLUSHES.length) } : null;                                     // 16. 腮红
      cat = { name: null, fur, earL: earCL, earR: earCR, earLS, earRS, earFi, tail: tailI, face: faceI, body: bodyI,
              eye: eyeI, iris: IRIS[irisI], iris2: IRIS[iris2I], whisker, headMark, bodyMark, tailMark, blush, mc: null, mc2: null };
    }
    // 颜色微调机制：耳/头/身/尾的每个**不同**毛色独立 ±0~2.5% 明度（同色部件一起变，头身尾保持同色；
    // 用 SHA-256 第 2 个 4 字节做副 PRNG，完全不消耗主随机序列）
    const jseed = (hash[4] | hash[5] << 8 | hash[6] << 16 | hash[7] << 24) >>> 0;
    const jrng = makeRng(mulberry32(jseed));
    const jitCache = new Map(); // 同一基色 → 同一微调结果（耳朵与身体同色时保持一致）
    const jit = c => { if (!jitCache.has(c)) jitCache.set(c, shiftL(c, (jrng.f() * 0.025) * (jrng.f() < 0.5 ? -1 : 1))); return jitCache.get(c); };
    cat.fur = jit(cat.fur); cat.earL = jit(cat.earL); cat.earR = jit(cat.earR);

    // 17-20. 服装 / 配饰 / 左右物品（两种猫都随机；false = 不出现）
    const outfit = rng.chance(0.5) ? rng.int(OUTFITS.length) : false;
    const acc = rng.chance(0.4) ? rng.int(ACCESSORIES.length) : false;
    const itemL = rng.chance(0.35) ? rng.int(ITEMS.length) : false;
    const itemR = rng.chance(0.35) ? rng.int(ITEMS.length) : false;
    // 21. T恤/卫衣图案（仅这两件时消费，追加在序列末尾不动老 seed 的 1-20；100% 有图案，8 种等概率）；衬衫复用此位：0-7 有图案 / 8-15 素面（50% 概率花纹）
    const tArt = outfit !== false && OUTFITS[outfit].art ? rng.int(TSHIRT_ART.length * (OUTFITS[outfit].shirt ? 2 : 1)) : null;
    // 22. T恤/卫衣底色（同上仅这两件时消费；卫衣复用同一位取深色调色板）
    const tColor = outfit !== false && OUTFITS[outfit].art ? rng.int(TEE_COLORS.length) : 0;
    // 23. 心情符号（60% 出现，9 种等概率；追加在序列末尾，不动老 seed 的 1-22）
    const mood = rng.chance(0.6) ? rng.int(MOODS.length) : false;
    // 24. 衬衫扣子状态（仅衬衫时消费：50% 扣上 / 50% 敞开 V 口露毛色；追加在末尾，不动老 seed 的 1-23）
    const shirtOpen = outfit !== false && OUTFITS[outfit].shirt ? rng.chance(0.5) : false;

    // ===== 组装 SVG =====
    const faceD = FACES[cat.face], bodyD = BODIES[cat.body], tailD = TAILS[cat.tail];
    // 头顶 y（帽子类配饰跟随）：M y 后接 a rx,ry → My-ry（圆/椭圆顶）；接 h → My（方脸顶边）
    const fm = faceD.match(/^M[\d.]+,([\d.]+)\s+(?:h[\d.]+|a([\d.]+),([\d.]+))/);
    const fcy = +fm[1], frx = fm[2] ? +fm[2] : 108, fry = fm[2] ? +fm[3] : 126; // 脸椭圆参数（方脸用等效椭圆：中心(256,225) r108/126）
    const faceTop = fcy - fry, faceBottom = fcy + fry; // 脸底（脖子件跟随）
    const earShapeL = EARS[cat.earLS], earShapeR = EARS[cat.earRS];
    const ef = EAR_FURS[cat.earFi ?? cat.earFur]; // 普通猫 earFi / 品种图纸 earFur
    const mc = cat.mc || shiftL(cat.fur, 0.06), mc2 = cat.mc2 || mc;
    const mark = (m, arr) => m ? arr[m.i](m.c1 || mc, m.c2 || mc2) : ''; // 品种猫 c1/c2 为空 → 回退 mc/mc2
    const tailPts = tailPoints(tailD);                                                  // 尾路径采样点（尾纹沿此生成）

    const layers = [];
    const tx = TAIL_TX[cat.body];                                                        // 尾根贴合身体右缘
    layers.push(`<rect width="512" height="512" fill="${bg.bg}"/>`);                    // 背景色
    layers.push(bgPattern(bg.pc));                                                      // 背景图案
    layers.push(`<g transform="translate(${tx},0)">` +                                  // 尾巴：毛色线 → 花纹 → 深色描边仅边缘环带（m-tail-edge 挖掉中间，避免盖住毛色）→ 毛刺
      `<path d="${tailD}" fill="none" stroke="${cat.fur}" stroke-width="24" stroke-linecap="round"/>` +
      `<g mask="url(#m-tail)">${cat.tailMark ? TAIL_MARKS[cat.tailMark.i](cat.tailMark.c1 || mc, cat.tailMark.c2 || mc2, tailPts) : ''}</g>` + // 尾纹（沿尾路径生成，mask 裁到尾巴）
      `<path d="${tailD}" fill="none" stroke="${STROKE}" stroke-width="36" stroke-linecap="round" mask="url(#m-tail-edge)"/>` +
      TAIL_DECO[cat.tail](cat.fur) +
      `</g>`);
    layers.push(`<path d="${bodyD}" fill="${cat.fur}"/>`);                               // 身体（梯形，无四肢；描边在服装后压出轮廓）
    layers.push(`<g mask="url(#m-body-edge)">${mark(cat.bodyMark, BODY_MARKS)}</g>`);   // 额外花纹（m-body-edge=身体挖掉脸：只在身上）
    if (outfit !== false && !OUTFITS[outfit].neck) {                                     // 大件服装：轮廓直接用身体路径（身体多大衣服多大，零缩放零形变）；细节画超宽由 mask 裁进身体；画在身体描边之前，黑边复用身体描边
      layers.push(`<g mask="url(#m-body-edge)">${OUTFITS[outfit].fn(bodyD, tArt, tColor, shirtOpen, cat.fur)}</g>`);
    }
    layers.push(`<path d="${bodyD}" fill="none" stroke="${STROKE}" stroke-width="6" mask="url(#m-body-line)"/>`); // 身体描边（m-body-line：填充+12 描边带全白+脸黑挖下巴遮挡区，黑边完整 6px）——画在服装后出轮廓、在脖子件/兜帽之下，围巾垂布/围兜/帽沿不再被黑线切
    if (outfit !== false && OUTFITS[outfit].neck) {                                      // 脖子件：画在身体描边之上（垂布/围兜盖住身体边缘黑线）、脸填充之前（顶部被脸盖住，不挡头）；fn 可接收 faceBottom（围巾按身体实际高度取垂布长度）
      layers.push(`<g transform="translate(0,${faceBottom - 353})">${OUTFITS[outfit].fn(faceBottom)}</g>`);
    }
    const earSvg = (shape, color, clipId) =>                                            // 耳朵（先耳后脸，脸压耳根）
      `<path d="${shape.d}" fill="${color}" stroke="${STROKE}" stroke-width="6" stroke-linejoin="round"/>` +
      `<g clip-path="url(#${clipId})"><path d="${shape.d}" fill="${ef.c || color}" transform="translate(${shape.ax},${shape.ay}) scale(0.55) translate(${-shape.ax},${-shape.ay})"/>${ef.fn(shape.ax, shape.ay)}</g>`;
    layers.push(earSvg(earShapeL, cat.earL, 'c-earL'));
    layers.push(`<g transform="translate(512,0) scale(-1,1)">${earSvg(earShapeR, cat.earR, 'c-earR')}</g>`);
    if (outfit !== false && OUTFITS[outfit].hood) {                                      // 兜帽猫耳层：画在**真耳之上**（帽耳同位同形盖住真耳——耳朵穿进帽耳里）、**帽壳之下**（帽壳盖住耳根，帽耳尖端从帽壳顶伸出）
      const h = HOODIE.colors[tColor % HOODIE.colors.length][1];
      layers.push(HOODIE.ears(h));
    }
    if (outfit !== false && OUTFITS[outfit].hood) {                                      // 帽壳层：画在**真耳/帽耳之上**（帽壳椭圆盖住耳根——耳朵从帽子开口里长出来）、脸填充之前（脸盖住帽壳中间只露一圈帽沿）
      const h = HOODIE.colors[tColor % HOODIE.colors.length][1];
      layers.push(HOODIE.shell(h, fcy, frx, fry));
    }
    layers.push(`<path d="${faceD}" fill="${cat.fur}"/>`);                               // 脸（描边后置）
    if (cat.headMark) layers.push(`<g clip-path="url(#c-face)">${HEAD_MARKS[cat.headMark.i](cat.headMark.c1 || mc)}</g>`); // 头部花纹
    // 脸描边最后画：压在头部花纹上
    layers.push(`<path d="${faceD}" fill="none" stroke="${STROKE}" stroke-width="6"/>`);
    layers.push(EYES[cat.eye](cat.iris, cat.iris2));                                   // 眼
    if (brow) layers.push(`<g stroke="${brow.c}">${BROWS[brow.i](brow.c)}</g>`);       // 眉
    if (cat.blush) layers.push(BLUSHES[cat.blush.i]());                                // 腮红
    layers.push(MOUTHS[mouth]());                                                      // 嘴
    layers.push(WHISKERS(cat.whisker.c, cat.whisker.n));                               // 胡须
    if (acc !== false) {                                                                // 配饰（帽子类随脸型头顶平移，标准脸 y=97）
      const a = ACCESSORIES[acc];
      layers.push(a.ride ? `<g transform="translate(0,${faceTop - 97})">${a.fn()}</g>` : a.fn());
    }
    if (itemL !== false) layers.push(ITEMS[itemL](58, 440));                           // 左物品
    if (itemR !== false) layers.push(`<g transform="translate(512,0) scale(-1,1)">${ITEMS[itemR](58, 440)}</g>`); // 右物品（镜像）
    if (mood !== false) layers.push(MOODS[mood]());                                    // 心情符号（左上角，最上层）

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" role="img" aria-label="随机猫咪头像${cat.name ? '（' + cat.name + '）' : ''}">
<defs>
  <clipPath id="c-face"><path d="${faceD}"/></clipPath>
  <clipPath id="c-earL"><path d="${earShapeL.d}"/></clipPath>
  <clipPath id="c-earR"><path d="${earShapeR.d}"/></clipPath>
  <mask id="m-tail" maskUnits="userSpaceOnUse" x="-40" y="-40" width="592" height="592"><path d="${tailD}" fill="none" stroke="#fff" stroke-width="36" stroke-linecap="round"/></mask><!-- maskUnits=userSpaceOnUse：默认 mask 区域是几何 bbox±10%，细长尾巴 bbox 太窄会裁掉描边；显式全画布区域 -->
  <mask id="m-tail-edge" maskUnits="userSpaceOnUse" x="-40" y="-40" width="592" height="592"><path d="${tailD}" fill="none" stroke="#fff" stroke-width="36" stroke-linecap="round"/><path d="${tailD}" fill="none" stroke="#000" stroke-width="24" stroke-linecap="round"/></mask><!-- 尾巴深色边缘环带：外圈白（显示）内圈黑（挖掉），深色只画 36-24 的 6px 边 -->
  <mask id="m-body-edge"><path d="${bodyD}" fill="#fff"/><path d="${faceD}" fill="#000"/></mask>
  <mask id="m-body-line" maskUnits="userSpaceOnUse" x="-40" y="-40" width="592" height="592"><path d="${bodyD}" fill="none" stroke="#fff" stroke-width="12" stroke-linejoin="round"/><path d="${bodyD}" fill="#fff"/><path d="${faceD}" fill="#000"/></mask><!-- 身体描边专用：填充+12 描边带全白（含描边外半圈），黑边完整 6px 不被 mask 吃掉；脸黑挖掉下巴遮挡区 -->
</defs>
${layers.join('\n')}
</svg>`;
  };
})();
