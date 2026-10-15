// Native cloud dot uses six fixed slots. Repeat two eye states instead of head sway.
// Only ImageGen eyelid pixels are composited; head, body and all other rows stay fixed.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url), sharp = require('sharp');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const at = p => path.join(root, p);
const save = (p, data) => { fs.mkdirSync(path.dirname(at(p)), { recursive: true }); fs.writeFileSync(at(p), data); };
const json = (p, data) => save(p, JSON.stringify(data, null, 2) + '\n');
const W = 192, H = 208, atlasWidth = 1536;
const { data, info } = await sharp(at('assets/spritesheet-static.png')).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const original = Buffer.from(data);
const open = await sharp(at('source/v3-smooth/frames/000.png')).ensureAlpha().raw().toBuffer();
const edited = await sharp(at('source/v3-blink/closed-generated.png')).resize(W, H, { fit: 'fill' }).ensureAlpha().raw().toBuffer();
const closed = Buffer.from(open);
// Copy the two generated eye regions only, leaving the bangs and mouth untouched.
const eyeRegions = [{ left: 54, top: 89, width: 32, height: 26 }, { left: 97, top: 89, width: 33, height: 26 }];
for (const box of eyeRegions) for (let y = box.top; y < box.top + box.height; y++) {
  const start = (y * W + box.left) * 4, end = start + box.width * 4;
  edited.copy(closed, start, start, end);
}
const states = ['open', 'closed', 'open', 'open', 'open', 'open'];
const delay = [1680, 660, 660, 840, 840, 1920];
const cells = { open, closed }, pngs = [];
for (const [col, state] of states.entries()) {
  const cell = cells[state];
  for (let y = 0; y < H; y++) cell.copy(data, (y * atlasWidth + col * W) * 4, y * W * 4, (y + 1) * W * 4);
  pngs.push(await sharp(cell, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer());
}
for (const [state, cell] of Object.entries(cells)) save(`source/v3-blink/${state}.png`, await sharp(cell, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer());
const result = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
save('assets/spritesheet-cloud.png', result);
// All preview frames are decoded from the exact final atlas bytes.
const frames = await Promise.all(states.map((_, col) => sharp(result).extract({ left: col * W, top: 0, width: W, height: H }).flatten({ background: '#edf3fc' }).png().toBuffer()));
await sharp(frames, { join: { animated: true } }).gif({ loop: 0, delay, dither: 0, keepDuplicateFrames: true }).toFile(at('previews/idle-cloud-compatible.gif'));
await sharp({ create: { width: W * 4, height: H, channels: 4, background: '#edf3fc' } }).composite([0, 1, 2, 5].map((col, i) => ({ input: frames[col], left: i * W, top: 0 }))).png().toFile(at('previews/cloud-blink-stills.png'));
await sharp(result).flatten({ background: '#edf3fc' }).png().toFile(at('previews/contact-sheet-cloud.png'));
await sharp(pngs[0]).resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(at('assets/avatar-v3.png'));
const changedOutsideEyes = [];
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const p = (y * W + x) * 4;
  if (!open.subarray(p, p + 4).equals(closed.subarray(p, p + 4)) && !eyeRegions.some(b => x >= b.left && x < b.left + b.width && y >= b.top && y < b.top + b.height)) changedOutsideEyes.push([x, y]);
}
const otherRowsUnchanged = data.subarray(H * atlasWidth * 4).equals(original.subarray(H * atlasWidth * 4));
if (changedOutsideEyes.length || !otherRowsUnchanged || open.equals(closed)) throw new Error('Blink registration or preserved-row check failed');
const report = { format: 'PNG v2', characterVersion: '3.2', width: info.width, height: info.height, idleAction: 'seated-two-state-blink', states, nativeDelaysMs: delay, durationMs: delay.reduce((a, b) => a + b, 0), uniqueIdleFrames: 2, intermediateEyeStates: 0, amplitudeDegrees: 0, eyeRegions, changedPixelsOutsideEyes: changedOutsideEyes.length, otherRowsUnchanged, sha256: crypto.createHash('sha256').update(result).digest('hex'), reason: 'Cloud normalization removes embedded animation; repeat open/closed eyes in the six fixed slots without moving the head or body.' };
json('qa/cloud-compatibility.json', report);
const manifest = JSON.parse(fs.readFileSync(at('pet.json'), 'utf8'));
manifest.product_version = '3.2';
manifest.cloudSpritesheetPath = 'assets/spritesheet-cloud.png';
manifest.cloudSha256 = report.sha256;
manifest.cloud_idle_animation = { action: report.idleAction, states, nativeDelaysMs: delay, intermediateEyeStates: 0, headSway: false };
manifest.avatarPath = 'assets/avatar-v3.png';
json('pet.json', manifest);
console.log(JSON.stringify(report, null, 2));
