// ui.js —— UI 交互：读输入/URL → 调 avatar.js → 渲染、下载、复制链接、自检
// 注意：不能叫 main.js/server.js —— Vercel 零配置会把根目录这类名字的文件当整个部署的 Node 入口，导致 500
(function () {
  const $ = id => document.getElementById(id);
  const input = $('seed-input'), box = $('avatar-box'), statusEl = $('status');
  let currentSvg = '';

  const setStatus = (msg, isErr) => {
    statusEl.textContent = msg;
    statusEl.classList.toggle('err', !!isErr);
  };

  async function render(seed) {
    if (!window.crypto || !crypto.subtle) {      // file:// 以外的非安全上下文兜底提示
      setStatus('Web Crypto API 不可用，请用 HTTPS / localhost / 直接双击打开', true);
      return;
    }
    try {
      currentSvg = await window.renderAvatar(seed);
      box.innerHTML = currentSvg;
      setStatus('');
    } catch (e) {
      setStatus('生成失败：' + e.message, true);
    }
  }

  function randomSeed() {
    const a = new Uint8Array(8);
    crypto.getRandomValues(a);
    return Array.from(a, b => b.toString(16).padStart(2, '0')).join('');
  }

  function syncUrl(seed) {
    const url = new URL(location.href);
    if (seed) url.searchParams.set('seed', seed); else url.searchParams.delete('seed');
    history.replaceState(null, '', url);
  }

  // ---------- 事件 ----------
  let timer = null;
  input.addEventListener('input', () => {          // 输入防抖
    clearTimeout(timer);
    timer = setTimeout(() => { syncUrl(input.value); render(input.value); }, 200);
  });

  $('btn-random').addEventListener('click', () => {
    input.value = randomSeed();
    syncUrl(input.value);
    render(input.value);
  });

  $('btn-download').addEventListener('click', () => {
    if (!currentSvg) return;
    const blob = new Blob(['<?xml version="1.0" encoding="UTF-8"?>\n' + currentSvg], { type: 'image/svg+xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `cat-${input.value || 'avatar'}.svg`;
    a.click();
    URL.revokeObjectURL(a.href);
    setStatus('已下载 SVG');
  });

  // SVG 字符串 → Image → canvas → PNG（1024 高清，纯矢量无外链，canvas 不会被污染）
  $('btn-download-png').addEventListener('click', async () => {
    if (!currentSvg) return;
    try {
      const size = 1024;
      const url = URL.createObjectURL(new Blob([currentSvg], { type: 'image/svg+xml' }));
      const img = new Image();
      await new Promise((res, rej) => { img.onload = res; img.onerror = () => rej(new Error('SVG 解码失败')); img.src = url; });
      const c = document.createElement('canvas');
      c.width = c.height = size;
      c.getContext('2d').drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);
      c.toBlob(b => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(b);
        a.download = `cat-${input.value || 'avatar'}.png`;
        a.click();
        URL.revokeObjectURL(a.href);
        setStatus('已下载 PNG (1024×1024)');
      }, 'image/png');
    } catch (e) {
      setStatus('PNG 导出失败：' + e.message, true);
    }
  });

  $('btn-copy').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      setStatus('链接已复制');
    } catch {
      setStatus('复制失败，请手动复制地址栏链接', true);
    }
  });

  // ---------- 启动 ----------
  const params = new URLSearchParams(location.search);
  if (params.get('check') === '1') { runSelfCheck(); return; }   // ?check=1 一致性自检
  const seed = params.get('seed') || '';
  input.value = seed;
  render(seed);

  // ---------- 自检：同 seed 两次生成必须完全一致（非平凡逻辑的最小检查） ----------
  async function runSelfCheck() {
    const seeds = ['a', 'hello', '年糕', '12345', 'test-seed-99', '猫猫'];
    let pass = 0;
    for (const s of seeds) {
      const a = await window.renderAvatar(s), b = await window.renderAvatar(s);
      const ok = a === b && a.startsWith('<svg') && a.includes('</svg>');
      console.assert(ok, 'seed 一致性失败: ' + s);
      if (ok) pass++;
    }
    document.querySelector('.card').innerHTML =
      `<h1>自检结果</h1><p class="status">${pass}/${seeds.length} 通过（同 seed 两次生成完全一致）</p>`;
    const svg = await window.renderAvatar('selfcheck');
    box && (box.innerHTML = svg);
  }
})();
