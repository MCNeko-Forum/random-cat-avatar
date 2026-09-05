// breeds.js —— 12 种品种猫定妆图纸（0.002% 彩蛋，等概率抽取）
// 图纸固定：毛色/脸/身/左右耳色/耳内毛/虹膜色/胡须颜色/三种花纹/腮红；尾巴动作、眼样式、胡须数量、嘴/眉/服装/配饰/物品/心情由 avatar.js 照常随机（图纸 tail/eye/whisker.n 字段已废弃）。
// 索引均对应 PARTS 中各数组的下标。mc/mc2 = 花纹专用色（缺省按毛色明度 ±5%~10% 计算；三花/奶牛/重点色这类品种需要指定）。
window.BREEDS = [
  { name: '英短蓝猫', fur: '#98a4b8', earL: '#98a4b8', earR: '#98a4b8', earFur: 0, tail: 8, ear: 1, face: 1, body: 1,
    eye: 7, iris: '#d98e3a', whisker: { color: '#ffffff', n: 4 }, headMark: null, bodyMark: null, tailMark: null, blush: null },
  { name: '美短银虎斑', fur: '#cdd2da', earL: '#cdd2da', earR: '#cdd2da', earFur: 6, tail: 0, ear: 0, face: 0, body: 0,
    eye: 0, iris: '#67b26a', whisker: { color: '#ffffff', n: 3 }, headMark: 0, bodyMark: 0, tailMark: 2, blush: null, mc: '#8a8f9c' },
  { name: '狸花猫', fur: '#a5795f', earL: '#a5795f', earR: '#a5795f', earFur: 6, tail: 5, ear: 2, face: 9, body: 4,
    eye: 0, iris: '#b5c94f', whisker: { color: '#ffffff', n: 4 }, headMark: 0, bodyMark: 0, tailMark: 2, blush: null, mc: '#7a563e' },
  { name: '橘猫', fur: '#f0a35e', earL: '#f0a35e', earR: '#f0a35e', earFur: 5, tail: 6, ear: 0, face: 1, body: 8,
    eye: 0, iris: '#e0a83c', whisker: { color: '#ffffff', n: 5 }, headMark: null, bodyMark: 2, tailMark: null, blush: 0, mc: '#fdf3dd' },
  { name: '奶牛猫', fur: '#4a4a52', earL: '#4a4a52', earR: '#4a4a52', earFur: 5, tail: 4, ear: 0, face: 0, body: 0,
    eye: 0, iris: '#67b26a', whisker: { color: '#ffffff', n: 4 }, headMark: null, bodyMark: 1, tailMark: 1, blush: null, mc: '#f5f2ec', mc2: '#f5f2ec' },
  { name: '三花猫', fur: '#f5f0e6', earL: '#f0a35e', earR: '#4a4a52', earFur: 5, tail: 0, ear: 0, face: 0, body: 2,
    eye: 0, iris: '#e0a83c', whisker: { color: '#ffffff', n: 4 }, headMark: 3, bodyMark: 7, tailMark: 8, blush: 0, mc: '#f0a35e', mc2: '#4a4a52' },
  { name: '暹罗猫', fur: '#f3e7d3', earL: '#6b4a35', earR: '#6b4a35', earFur: 6, tail: 4, ear: 2, face: 7, body: 7,
    eye: 0, iris: '#5b8fd9', whisker: { color: '#3b3b46', n: 4 }, headMark: 5, bodyMark: 5, tailMark: 9, blush: null, mc: '#6b4a35', mc2: '#6b4a35' },
  { name: '布偶猫', fur: '#f7f3ec', earL: '#8d99ae', earR: '#8d99ae', earFur: 5, tail: 6, ear: 1, face: 0, body: 4,
    eye: 7, iris: '#5b8fd9', whisker: { color: '#ffffff', n: 4 }, headMark: null, bodyMark: 6, tailMark: 8, blush: 0, mc: '#d8dbe4', mc2: '#c5ccd9' },
  { name: '加菲猫', fur: '#f0c298', earL: '#f0c298', earR: '#f0c298', earFur: 5, tail: 2, ear: 3, face: 6, body: 3,
    eye: 7, iris: '#e0a83c', whisker: { color: '#3b3b46', n: 4 }, headMark: null, bodyMark: null, tailMark: null, blush: 1 },
  { name: '波斯猫', fur: '#fdfcf8', earL: '#fdfcf8', earR: '#fdfcf8', earFur: 5, tail: 6, ear: 3, face: 6, body: 4,
    eye: 7, iris: '#d98e3a', whisker: { color: '#ffffff', n: 4 }, headMark: null, bodyMark: null, tailMark: null, blush: 0 },
  { name: '缅因猫', fur: '#9a7a5c', earL: '#9a7a5c', earR: '#9a7a5c', earFur: 3, tail: 0, ear: 4, face: 9, body: 4,
    eye: 0, iris: '#b5c94f', whisker: { color: '#ffffff', n: 5 }, headMark: 0, bodyMark: 0, tailMark: 2, blush: null, mc: '#74573c' },
  { name: '俄罗斯蓝猫', fur: '#8d99ae', earL: '#8d99ae', earR: '#8d99ae', earFur: 6, tail: 8, ear: 0, face: 4, body: 3,
    eye: 0, iris: '#6fbf73', whisker: { color: '#ffffff', n: 3 }, headMark: null, bodyMark: null, tailMark: null, blush: null } ];
