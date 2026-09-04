# random-cat-avatar 随机猫咪头像生成器

输入任意 seed，生成一只独一无二的卡通猫咪 SVG 头像。**同一 seed 永远生成同一只猫**——刷新、换设备、换浏览器结果完全一致（SHA-256 驱动）。

纯前端、零依赖、无构建、无网络请求，双击 `index.html` 即可运行。

## 特性

- **确定性生成**：seed → SHA-256 → mulberry32 PRNG → 头像，跨端一致
- **20 类部件、100+ 候选样式**：毛色 14 种、尾巴/身体/脸型/眼睛各 10+ 种、花纹/腮红/眉毛、服装 12 款（T 恤/连帽卫衣/衬衫/围巾/领结…）、配饰 10 款、左右物品 10 款
- **稀有品种猫彩蛋**：0.1% 概率命中 12 种定妆品种猫（英短/美短/狸花/橘猫/三花/暹罗…）
- **左上角心情符号**：9 种（爱心/星星/音符/问号/感叹号/怒符…）60% 概率出现
- **30% 概率异瞳**、每个毛色独立 ±0~2.5% 明度微调
- **一键下载**：SVG 矢量 / 1024×1024 PNG 位图
- **URL 分享**：`?seed=xxx` 链接发给别人即可看到同一只猫
- **`<img>` 直引**：跑起 `server.js` 后 `<img src="/avatar.svg?seed=xxx">` 直接出图

## 快速开始

### 方式一：直接打开

双击 `index.html`（Web Crypto API 需要安全上下文，`file://`、`localhost`、HTTPS 均可）。

### 方式二：静态服务器

任意静态服务器托管本目录即可，例如：

```bash
npx serve .
# 或
python -m http.server
```

### 方式三：支持 `<img>` 直引（推荐部署）

零依赖 Node 服务器（静态托管 + `/avatar.svg` 动态端点）：

```bash
node server.js          # 默认端口 8123，PORT 环境变量可改
```

然后在任意网页里：

```html
<img src="http://localhost:8123/avatar.svg?seed=我的猫叫年糕">
```

端点特性：同 seed 同图可缓存（`Cache-Control: 24h`）、`Access-Control-Allow-Origin: *` 允许跨站引用、seed 经 SHA-256 无注入面、目录穿越已防护。

## 用法

- **seed 输入**：页面输入任意字符串（中文、emoji 都行），实时生成
- **随机**：🎲 按钮一键随机 seed
- **分享**：复制链接按钮，或直接发 `?seed=xxx` 链接
- **下载**：SVG（矢量无限缩放）或 PNG（1024 位图，通用场景）

## 项目结构

```
├── index.html       # 展示页
├── style.css        # 布局与样式
├── avatar.js        # 纯生成模块：seed → SVG 字符串（零 UI 依赖，可被任何页面复用）
├── parts.js         # 部件数据（20 类，逻辑与数据分离）
├── breeds.js        # 品种猫整体设计（12 种定妆图纸）
├── main.js          # UI 交互
├── server.js        # 零依赖 Node 服务器（静态托管 + /avatar.svg）
└── REQUIREMENTS.md  # 需求文档（部件细节的完整说明）
```

### 模块接口

`avatar.js` 对外只暴露一个函数：

```js
window.renderAvatar(seed)  // → Promise<string>，返回完整 SVG 字符串
```

不碰 DOM、不碰 location，任何项目引入即用。

## 自检

浏览器打开 `index.html?check=1`，验证同一 seed 多次生成结果完全一致。

## License

[MIT](./LICENSE)
