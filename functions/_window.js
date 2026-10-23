// Cloudflare Pages Functions 垫片：workerd 运行时没有 window / DOM。
// 浏览器端三件套（parts/breeds/avatar）都挂载在 window 上，这里先造一个。
// 必须以 import 顺序先于三件套求值（下划线开头的文件不参与路由，仅作私有模块）。
globalThis.window = globalThis;
