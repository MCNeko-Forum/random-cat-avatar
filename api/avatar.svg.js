// Vercel Serverless Function：GET /avatar.svg?seed=xxx → 动态出图
// 与 serve.js 共用 parts/breeds/avatar 三文件，逻辑与浏览器端 100% 一致。
// 注意：文件路径必须用字面量写死（不能用循环+变量拼接），
// 否则 Vercel 打包时 trace 不到文件，运行时 500。
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ctx = { window: {}, crypto: require('crypto').webcrypto, TextEncoder };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'parts.js'), 'utf8'), ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'breeds.js'), 'utf8'), ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'avatar.js'), 'utf8'), ctx);

module.exports = async (req, res) => {
  try {
    const url = new URL(req.url, 'https://vercel.local');
    const svg = await ctx.window.renderAvatar(url.searchParams.get('seed') || '');
    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(svg);
  } catch (error) {
    res.status(500).send('Avatar generation failed');
  }
};
