// server.js —— 零依赖 Node 服务器：静态托管 + /avatar.svg?seed=xxx 动态出图
// 用法：node server.js（端口默认 8123，可用环境变量 PORT 覆盖）
// 之后任何页面都能直接引用：<img src="http://localhost:8123/avatar.svg?seed=任意内容">
const http = require('http'), fs = require('fs'), path = require('path'), vm = require('vm');

// 在 Node 里加载浏览器代码（window 垫片 + webcrypto；parts/breeds/avatar 三文件零 DOM 依赖，逻辑 100% 复用）
const ctx = { window: {}, crypto: require('crypto').webcrypto, TextEncoder };
vm.createContext(ctx);
for (const f of ['parts.js', 'breeds.js', 'avatar.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, f), 'utf8'), ctx);

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml' };
const PORT = process.env.PORT || 8123;

http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x');
  if (u.pathname === '/avatar.svg') {                       // 动态端点：seed 经 SHA-256 → 同 seed 同图，可长缓存
    const svg = await ctx.window.renderAvatar(u.searchParams.get('seed') || '');
    res.writeHead(200, { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400', 'Access-Control-Allow-Origin': '*' });
    return res.end(svg);
  }
  const file = path.normalize(path.join(__dirname, u.pathname === '/' ? 'index.html' : u.pathname));
  if (!file.startsWith(__dirname)) { res.writeHead(403); return res.end('Forbidden'); } // 防目录穿越
  fs.readFile(file, (e, buf) => {
    if (e) { res.writeHead(404); return res.end('Not Found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(buf);
  });
}).listen(PORT, () => console.log('http://localhost:' + PORT));
