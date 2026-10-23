// Cloudflare Pages Function：GET /avatar.svg?seed=xxx → 动态出图
// 与浏览器端共用 parts/breeds/avatar 三文件，逻辑与 Vercel 版 / serve.js 完全一致。
// workerd 运行时没有 Node 的 fs/vm（所以不能用 serve.js 那套垫片），改用 window 垫片 + ESM 直接求值。
// 注意：文件名中的点会保留为路由的一部分，即本文件 → /avatar.svg
import './_window.js';
import '../parts.js';
import '../breeds.js';
import '../avatar.js';

export async function onRequestGet({ request }) {
  try {
    const seed = new URL(request.url).searchParams.get('seed') || '';
    const svg = await window.renderAvatar(seed);
    return new Response(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new Response('Avatar generation failed', { status: 500 });
  }
}
