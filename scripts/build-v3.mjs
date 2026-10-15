// Package ImageGen artwork: split, clean alpha specks, register, and assemble.
// No character drawing, recolouring, or head rotation is performed here.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const sharp = require('sharp');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const at = p => path.join(root, p);
const save = (p, data) => { fs.mkdirSync(path.dirname(at(p)), { recursive: true }); fs.writeFileSync(at(p), data); };
const json = (p, data) => save(p, JSON.stringify(data, null, 2) + '\n');
const W = 192, H = 208, baseline = 203;
const clear = { r: 0, g: 0, b: 0, alpha: 0 };
const registration = [];
function bounds(data, width, height) {
  let l = width, t = height, r = 0, b = 0, pixels = 0;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) if (data[(y * width + x) * 4 + 3]) {
    l = Math.min(l, x); t = Math.min(t, y); r = Math.max(r, x + 1); b = Math.max(b, y + 1); pixels++;
  }
  if (!pixels) throw new Error('Empty artwork');
  return { left: l, top: t, width: r - l, height: b - t, bottom: b, pixels };
}
function cleanAlpha(data, width, height, minimumArea = 30) {
  // Only remove isolated alpha noise; preserve the detached question mark/dot.
  const seen = new Uint8Array(width * height), queue = new Int32Array(width * height);
  for (let p = 0; p < seen.length; p++) {
    const a = p * 4 + 3;
    if (data[a] < 32) data[a] = 0;
    else if (data[a] > 245) data[a] = 255;
  }
  for (let p = 0; p < seen.length; p++) {
    if (seen[p] || !data[p * 4 + 3]) continue;
    let n = 1; queue[0] = p; seen[p] = 1;
    for (let q = 0; q < n; q++) {
      const v = queue[q], x = v % width, y = Math.floor(v / width);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const xx = x + dx, yy = y + dy;
        if (xx < 0 || xx >= width || yy < 0 || yy >= height) continue;
        const next = yy * width + xx;
        if (!seen[next] && data[next * 4 + 3]) { seen[next] = 1; queue[n++] = next; }
      }
    }
    if (n < minimumArea) for (let q = 0; q < n; q++) data[queue[q] * 4 + 3] = 0;
  }
  for (let p = 0; p < seen.length; p++) if (!data[p * 4 + 3]) data.fill(0, p * 4, p * 4 + 4);
  return data;
}
async function cells(file, cols, rows) {
  const input = at(`source/v3/generated/${file}.png`), meta = await sharp(input).metadata();
  if (!meta.hasAlpha) throw new Error(`${file} has no alpha`);
  const result = [];
  for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
    const left = Math.round(meta.width * col / cols), top = Math.round(meta.height * row / rows);
    const width = Math.round(meta.width * (col + 1) / cols) - left;
    const height = Math.round(meta.height * (row + 1) / rows) - top;
    const data = await sharp(input).extract({ left, top, width, height }).resize(512, 512).ensureAlpha().raw().toBuffer();
    cleanAlpha(data, 512, 512);
    result.push({ data, box: bounds(data, 512, 512) });
  }
  return result;
}
async function register(file, entries) {
  // One scale per source sheet, never a separate fit-to-box scale per frame.
  const heights = entries.map(v => v.box.height).sort((a, b) => a - b);
  const scale = Math.min(186 / heights[Math.floor(heights.length / 2)], 178 / Math.max(...entries.map(v => v.box.width)));
  const result = [];
  for (const [index, { data, box }] of entries.entries()) {
    const width = Math.round(box.width * scale), height = Math.round(box.height * scale);
    const trimmed = await sharp(data, { raw: { width: 512, height: 512, channels: 4 } })
      .extract({ left: box.left, top: box.top, width: box.width, height: box.height }).resize(width, height).raw().toBuffer();
    // Remove only tiny resampling residues, keeping all meaningful detail.
    for (let p = 0; p < width * height; p++) if (trimmed[p * 4 + 3] < 12) trimmed.fill(0, p * 4, p * 4 + 4);
    const png = await sharp({ create: { width: W, height: H, channels: 4, background: clear } })
      .composite([{ input: trimmed, raw: { width, height, channels: 4 }, left: Math.round((W - width) / 2), top: baseline - height }]).png().toBuffer();
    registration.push({ source: file, index, scale, width, height, baseline, sourceBounds: box });
    result.push(png);
  }
  return result;
}
const idleCells = await cells('idle', 3, 2);
idleCells[4] = (await cells('idle-right-fixed', 1, 1))[0];
const idle = await register('idle', idleCells);
const work = await register('work', await cells('work', 3, 2));
const hover = await register('hover', await cells('hover', 3, 2));
const auxiliary = await register('companions-padded', await cells('companions-padded', 3, 4));
const look = await register('look', await cells('look', 4, 4));
const take = (source, indices) => indices.map(i => source[i]);
const rows = [
  { name: 'idle', frames: idle, delay: [1680, 660, 660, 840, 840, 1920], action: 'seated-rhythmic-head-sway' },
  { name: 'running-right', frames: take(idle, [0, 5, 4, 5, 0, 1, 2, 1]), delay: [120,120,120,120,120,120,120,220], action: 'seated-moving-right' },
  { name: 'running-left', frames: take(idle, [0, 1, 2, 1, 0, 5, 4, 5]), delay: [120,120,120,120,120,120,120,220], action: 'seated-moving-left' },
  { name: 'waving', frames: auxiliary.slice(0, 4), delay: [140,140,140,280], action: 'seated-friendly-wave' },
  { name: 'jumping', frames: hover.slice(0, 5), delay: [140,140,140,140,280], action: 'seated-finger-to-lips-curious' },
  { name: 'failed', frames: take(auxiliary, [8,8,9,9,10,10,11,11]), delay: [140,140,140,140,140,140,140,240], action: 'seated-small-disappointment' },
  { name: 'waiting', frames: take(auxiliary, [4,5,6,7,5,4]), delay: [150,150,150,150,150,260], action: 'seated-open-palms-waiting' },
  { name: 'running', frames: work, delay: [120,120,120,120,120,220], action: 'seated-laptop-typing' },
  { name: 'review', frames: take(work, [0,0,2,3,2,0]), delay: [150,150,150,150,150,280], action: 'seated-laptop-review' },
  { name: 'look-row-9', frames: look.slice(0, 8) },
  { name: 'look-row-10', frames: look.slice(8) },
];
const oldManifest = JSON.parse(fs.readFileSync(at('pet.json'), 'utf8'));
const archive = 'source/revisions/pre-seated-v3';
if (oldManifest.asset_revision !== 'seated-v3' && !fs.existsSync(at(`${archive}/pet.json`))) {
  save(`${archive}/pet.json`, fs.readFileSync(at('pet.json')));
  save(`${archive}/spritesheet.png`, fs.readFileSync(at(oldManifest.spritesheetPath)));
}
const atlas = [];
async function gif(file, frames, delay) {
  const input = await Promise.all(frames.map(f => sharp(f).flatten({ background: '#edf3fc' }).png().toBuffer()));
  await sharp(input, { join: { animated: true } }).gif({ loop: 0, delay, dither: 0, effort: 3, keepDuplicateFrames: true }).toFile(at(file));
}
for (const [row, state] of rows.entries()) {
  for (const [col, frame] of state.frames.entries()) {
    save(`source/frames/${state.name}/${String(col).padStart(2, '0')}.png`, frame);
    atlas.push({ input: frame, left: col * W, top: row * H });
  }
  await sharp({ create: { width: state.frames.length * W, height: H, channels: 4, background: clear } })
    .composite(state.frames.map((input, i) => ({ input, left: i * W, top: 0 }))).png().toFile(at(`source/strips/${state.name}.png`));
  if (state.delay) await gif(`previews/${state.name}.gif`, state.frames, state.delay);
}
const sprite = await sharp({ create: { width: W * 8, height: H * 11, channels: 4, background: clear } }).composite(atlas).png().toBuffer();
save('assets/spritesheet.png', sprite);
save('assets/spritesheet-v3.png', sprite);
const pet = { ...oldManifest,
  description: 'v3 坐姿蓝发鲸鱼娘：待机左右晃脑袋，工作使用笔记本，悬停手指抵唇思考。',
  product_version: '3.0', asset_revision: 'seated-v3',
  sha256: crypto.createHash('sha256').update(sprite).digest('hex'),
  states: rows.slice(0, 9).map((s, row) => ({ row, name: s.name, frames: s.frames.length, visual_action: s.action })),
  active_work_action: 'sitting and typing on a laptop',
  enhanced_actions: Object.fromEntries(rows.slice(0, 9).map(s => [s.name, s.action])),
  pointer_interaction: { button_hover: 'jumping slot (row 4)', dot_idle_pointer: '16 seated finger-to-lips directional frames (rows 9 and 10)' },
};
json('pet.json', pet);
json('qa/v3-registration.json', { asset_revision: pet.asset_revision, baseline, method: 'One scale per generated sheet; shared seated contact baseline; no per-frame independent scaling.', frames: registration });
await gif('previews/seated-idle-v3.gif', idle, rows[0].delay);
await gif('previews/laptop-work.gif', work, rows[7].delay);
await gif('previews/hover-thinking-v3.gif', rows[4].frames, rows[4].delay);
await gif('previews/head-tilt.gif', rows[4].frames, rows[4].delay);
await gif('previews/look-loop.gif', look, Array(16).fill(350));
const sequence = [...idle, ...rows[4].frames, ...work, ...idle];
const delays = [...rows[0].delay, ...rows[4].delay, ...rows[7].delay, ...rows[0].delay];
await gif('previews/v3-transition.gif', sequence, delays);
await gif('previews/all-states.gif', rows.slice(0, 9).flatMap(s => s.frames), rows.slice(0, 9).flatMap(s => s.delay));
const stills = [idle[0], idle[2], idle[4], work[0], hover[0], auxiliary[0]];
await sharp({ create: { width: W * 6, height: H, channels: 4, background: '#edf3fc' } })
  .composite(stills.map((input, i) => ({ input, left: i * W, top: 0 }))).png().toFile(at('previews/seated-v3-stills.png'));
const contacts = rows.flatMap((s, row) => s.frames.map((input, col) => ({ input, left: col * W, top: row * H })));
await sharp({ create: { width: W * 8, height: H * 11, channels: 4, background: '#edf3fc' } }).composite(contacts).png().toFile(at('previews/contact-sheet-extended.png'));
console.log(JSON.stringify({ version: pet.product_version, sha256: pet.sha256, actionFrames: 57, lookFrames: 16, baseline, sprite: pet.spritesheetPath }));
