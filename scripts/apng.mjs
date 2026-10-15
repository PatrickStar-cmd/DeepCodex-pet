// W3C PNG third edition: full default image plus SOURCE-replaced delta frames.
// https://www.w3.org/TR/png-3/#11APNG
const signature = Buffer.from('89504e470d0a1a0a', 'hex');
const crcTable = Uint32Array.from({ length: 256 }, (_, n) => {
  for (let k = 0; k < 8; k++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
  return n >>> 0;
});
function chunk(type, data) {
  const bytes = Buffer.concat([Buffer.from(type), data]);
  let crc = 0xffffffff;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 255] ^ (crc >>> 8);
  const output = Buffer.alloc(data.length + 12);
  output.writeUInt32BE(data.length); bytes.copy(output, 4);
  output.writeUInt32BE((crc ^ 0xffffffff) >>> 0, output.length - 4);
  return output;
}
export function pngChunks(png) {
  if (!png.subarray(0, 8).equals(signature)) throw Error('Expected PNG');
  const result = [];
  for (let offset = 8; offset < png.length;) {
    const length = png.readUInt32BE(offset);
    if (offset + length + 12 > png.length) throw Error('Truncated PNG chunk');
    result.push({ type: png.toString('ascii', offset + 4, offset + 8), data: png.subarray(offset + 8, offset + 8 + length) });
    offset += length + 12;
  }
  return result;
}
export function encodeApng(defaultPng, patches, { x = 0, y = 0, fps = 24 } = {}) {
  const first = pngChunks(defaultPng), ihdr = first.find(c => c.type === 'IHDR').data;
  if (ihdr[8] !== 8 || ihdr[9] !== 6) throw Error('APNG requires 8-bit RGBA sources');
  const width = ihdr.readUInt32BE(0), height = ihdr.readUInt32BE(4);
  const animation = Buffer.alloc(8); animation.writeUInt32BE(patches.length + 1); // plays=0: loop
  const output = [signature, chunk('IHDR', ihdr), chunk('acTL', animation)];
  let sequence = 0;
  function control(w, h, xx, yy) {
    const data = Buffer.alloc(26); data.writeUInt32BE(sequence++);
    data.writeUInt32BE(w, 4); data.writeUInt32BE(h, 8);
    data.writeUInt32BE(xx, 12); data.writeUInt32BE(yy, 16);
    data.writeUInt16BE(1, 20); data.writeUInt16BE(fps, 22);
    // dispose NONE, blend SOURCE: erase old head edges, retain all other rows.
    return chunk('fcTL', data);
  }
  output.push(control(width, height, 0, 0));
  for (const c of first) if (c.type === 'IDAT') output.push(chunk('IDAT', c.data));
  for (const png of patches) {
    const parts = pngChunks(png), hdr = parts.find(c => c.type === 'IHDR').data;
    const w = hdr.readUInt32BE(0), h = hdr.readUInt32BE(4);
    if (hdr[8] !== 8 || hdr[9] !== 6 || w + x > width || h + y > height) throw Error('Invalid APNG patch');
    output.push(control(w, h, x, y));
    for (const part of parts) if (part.type === 'IDAT') {
      const seq = Buffer.alloc(4); seq.writeUInt32BE(sequence++);
      output.push(chunk('fdAT', Buffer.concat([seq, part.data])));
    }
  }
  output.push(chunk('IEND', Buffer.alloc(0)));
  return Buffer.concat(output);
}
