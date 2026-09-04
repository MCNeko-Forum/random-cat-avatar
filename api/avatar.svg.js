const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ctx = { window: {}, crypto: require('crypto').webcrypto, TextEncoder };
vm.createContext(ctx);
for (const file of ['parts.js', 'breeds.js', 'avatar.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), ctx);
}

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
