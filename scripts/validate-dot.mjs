// No dependencies: verify the native loader contract and every atlas cell.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pet = JSON.parse(fs.readFileSync(path.join(root, 'pet.json'), 'utf8'));
const check = (ok, message) => { if (!ok) throw new Error(message); };
check(typeof pet.displayName === 'string' && pet.displayName.trim(), 'Native displayName is missing');
check(pet.spriteVersionNumber === 2 && pet.sprite_version === 2, 'Both format versions must be 2');
check(pet.spritesheetPath === pet.spritesheet, 'Native and project sprite paths differ');
const cloud = process.argv.includes('--cloud');
const spritePath = path.resolve(root, cloud ? pet.cloudSpritesheetPath : pet.spritesheetPath);
check(spritePath.startsWith(root + path.sep), 'Sprite path escapes the package');
const png = fs.readFileSync(spritePath);
check(png.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex')), 'Expected PNG');
const sha256 = crypto.createHash('sha256').update(png).digest('hex');
check(sha256 === (cloud ? pet.cloudSha256 : pet.sha256), 'Sprite hash differs from manifest');
const width = png.readUInt32BE(16), height = png.readUInt32BE(20);
check(width === 1536 && height === 2288 && pet.width === width && pet.height === height, 'Native v2 requires 1536 x 2288');
check(png[24] === 8 && png[25] === 6 && png[28] === 0, 'Expected non-interlaced 8-bit RGBA PNG');
check(pet.columns === 8 && pet.rows === 11 && pet.cell_width === 192 && pet.cell_height === 208, 'Invalid atlas grid');
const expectedStates = ['idle', 'running-right', 'running-left', 'waving', 'jumping', 'failed', 'waiting', 'running', 'review'];
const counts = [6, 8, 8, 4, 5, 8, 6, 6, 6, 8, 8];
check(pet.states.length === 9 && pet.states.every((s, i) => s.row === i && s.name === expectedStates[i] && s.frames === counts[i]), 'Native state slots differ');
check(JSON.stringify(pet.look.rows) === '[9,10]' && pet.look.frames_per_row === 8 && pet.look.angles_degrees.length === 16 && pet.look.angles_degrees.every((v, i) => v === i * 22.5), 'Invalid look directions');
check(pet.look.angle_origin === 'up' && pet.look.angle_rotation === 'clockwise', 'Invalid look orientation');
const chunks = [];
for (let offset = 8; offset < png.length;) {
  const size = png.readUInt32BE(offset), type = png.toString('ascii', offset + 4, offset + 8);
  if (type === 'IDAT') chunks.push(png.subarray(offset + 8, offset + 8 + size));
  offset += size + 12;
}
const raw = zlib.inflateSync(Buffer.concat(chunks)), stride = width * 4;
check(raw.length === (stride + 1) * height, 'Unexpected decoded PNG length');
const pixels = Buffer.alloc(stride * height);
const paeth = (a, b, c) => {
  const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
};
for (let y = 0; y < height; y++) {
  const filter = raw[y * (stride + 1)];
  check(filter <= 4, 'Invalid PNG filter');
  for (let x = 0; x < stride; x++) {
    const i = y * stride + x, a = x >= 4 ? pixels[i - 4] : 0;
    const b = y ? pixels[i - stride] : 0, c = y && x >= 4 ? pixels[i - stride - 4] : 0;
    const predictor = [0, a, b, Math.floor((a + b) / 2), paeth(a, b, c)][filter];
    pixels[i] = (raw[y * (stride + 1) + x + 1] + predictor) & 255;
  }
}
const frames = [];
for (let row = 0; row < 11; row++) {
  for (let col = 0; col < 8; col++) {
    let left = 192, top = 208, right = 0, bottom = 0, opaquePixels = 0;
    for (let y = 0; y < 208; y++) for (let x = 0; x < 192; x++) {
      if (pixels[((row * 208 + y) * width + col * 192 + x) * 4 + 3] > 0) {
        opaquePixels++; left = Math.min(left, x); top = Math.min(top, y);
        right = Math.max(right, x + 1); bottom = Math.max(bottom, y + 1);
      }
    }
    const used = col < counts[row];
    check(used ? opaquePixels > 0 : opaquePixels === 0, `Unexpected ${used ? 'empty' : 'nonempty'} cell ${row}:${col}`);
    if (used) {
      check(left > 0 && top > 0 && right < 192 && bottom < 208, `Frame touches cell edge ${row}:${col}`);
      frames.push({ row, col, left, top, width: right - left, height: bottom - top, opaquePixels });
    }
  }
}
const report = {
  valid: true, displayName: pet.displayName, spriteVersionNumber: 2, sha256,
  width, height, actionFrames: counts.slice(0, 9).reduce((a, b) => a + b, 0), lookFrames: 16,
  usedFrames: frames.length, emptyCells: 88 - frames.length,
  idleContentBounds: { ...frames[0], frameWidth: 192, frameHeight: 208 },
  frames,
  scope: 'Native manifest, PNG structure, hash, grid, alpha bounds and all populated slots; visual review is separate.',
};
fs.writeFileSync(path.join(root, cloud ? 'qa/dot-cloud-validation.json' : 'qa/dot-compatibility.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ ...report, frames: undefined }, null, 2));
