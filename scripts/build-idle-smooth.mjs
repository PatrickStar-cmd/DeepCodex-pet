// Render a single ImageGen cutout rig at 24 fps; keep every other atlas row intact.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { encodeApng } from './apng.mjs';
const require = createRequire(import.meta.url);
const sharp = require('sharp');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const at = p => path.join(root, p);
const save = (p, bytes) => { fs.mkdirSync(path.dirname(at(p)), { recursive: true }); fs.writeFileSync(at(p), bytes); };
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const W = 192, H = 208, fps = 24, count = 72, amplitude = 5;
const clear = { r: 0, g: 0, b: 0, alpha: 0 };
const previous = fs.readFileSync(at('assets/spritesheet.png'));
const pet = JSON.parse(fs.readFileSync(at('pet.json'), 'utf8'));
const archive = 'source/revisions/pre-smooth-v3';
if (!fs.existsSync(at(`${archive}/spritesheet.png`))) {
  save(`${archive}/spritesheet.png`, previous); save(`${archive}/pet.json`, JSON.stringify(pet, null, 2) + '\n');
}
// Preserve the current non-idle rows, including any future rebuilt work artwork.
const base = previous;
// The two layers come from ImageGen. Remove isolated transparent-edge noise only.
async function layer(file) {
  const { data, info } = await sharp(at(file)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const seen = new Uint8Array(info.width * info.height), queue = new Int32Array(seen.length);
  for (let p = 0; p < seen.length; p++) { if (data[p*4+3] < 32) data[p*4+3] = 0; else if (data[p*4+3] > 245) data[p*4+3] = 255; }
  for (let p = 0; p < seen.length; p++) {
    if (seen[p] || !data[p*4+3]) continue;
    let length = 1; queue[0] = p; seen[p] = 1;
    for (let i = 0; i < length; i++) {
      const v = queue[i], x = v % info.width, y = Math.floor(v / info.width);
      for (let dy=-1; dy<=1; dy++) for (let dx=-1; dx<=1; dx++) {
        const xx=x+dx, yy=y+dy;
        if (xx<0 || xx>=info.width || yy<0 || yy>=info.height) continue;
        const q=yy*info.width+xx;
        if (!seen[q] && data[q*4+3]) { seen[q]=1; queue[length++]=q; }
      }
    }
    if (length<30) for (let i=0;i<length;i++) data[queue[i]*4+3]=0;
  }
  for (let p=0;p<seen.length;p++) if (!data[p*4+3]) data.fill(0,p*4,p*4+4);
  return loadImage(await sharp(data,{raw:{width:info.width,height:info.height,channels:4}}).png().toBuffer());
}
const body = await layer('source/v3-smooth/body.png'), head = await layer('source/v3-smooth/head.png');
const frames = [], angles = [], raw = [];
for (let i=0;i<count;i++) {
  const angle = amplitude * Math.sin(2*Math.PI*i/count);
  const canvas = createCanvas(W*3,H*3), ctx = canvas.getContext('2d');
  ctx.scale(3,3); ctx.translate(4.5,14.4); ctx.scale(.34,.34);
  ctx.drawImage(body,0,55);
  ctx.translate(235,330); ctx.rotate(angle*Math.PI/180); ctx.translate(-235,-330);
  ctx.drawImage(head,0,0);
  const pixels = await sharp(canvas.toBuffer('image/png')).resize(W,H).ensureAlpha().raw().toBuffer();
  for (let p=0;p<W*H;p++) if (pixels[p*4+3]<12) pixels.fill(0,p*4,p*4+4);
  const png = await sharp(pixels,{raw:{width:W,height:H,channels:4}}).png().toBuffer();
  frames.push(png); raw.push(pixels); angles.push(angle);
  save(`source/v3-smooth/frames/${String(i).padStart(3,'0')}.png`,png);
}
// Each of the six native idle slots carries the SAME phase of the APNG clock.
// Native slot changes cannot introduce a phase jump or expose a different pose.
const idleRows = [];
for (const frame of frames) idleRows.push(await sharp({create:{width:W*6,height:H,channels:4,background:clear}})
  .composite(Array.from({length:6},(_,i)=>({input:frame,left:i*W,top:0}))).png().toBuffer());
// Copy bytes directly to avoid alpha premultiplication rounding in untouched rows.
const firstRaw = await sharp(base).ensureAlpha().raw().toBuffer();
const firstRow = await sharp(idleRows[0]).raw().toBuffer();
for (let y=0;y<H;y++) firstRow.copy(firstRaw,y*W*8*4,y*W*6*4,(y+1)*W*6*4);
const first = await sharp(firstRaw,{raw:{width:W*8,height:H*11,channels:4}}).png().toBuffer();
let left=W,top=H,right=0,bottom=0;
for (const pixels of raw) for (let y=0;y<H;y++) for(let x=0;x<W;x++) {
  const p=(y*W+x)*4;
  if (pixels.subarray(p,p+4).equals(raw[0].subarray(p,p+4))) continue;
  left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x+1);bottom=Math.max(bottom,y+1);
}
const patchRect={left,top,width:5*W+right-left,height:bottom-top};
const patches=await Promise.all(idleRows.slice(1).map(p=>sharp(p).extract(patchRect).png().toBuffer()));
const apng = encodeApng(first,patches,{fps,x:left,y:top});
save('source/strips/idle.png',idleRows[0]);
for (let i=0;i<6;i++) save(`source/frames/idle/${String(i).padStart(2,'0')}.png`,frames[0]);
// Exact GIF millisecond delays, rounded cumulatively to the format's 10 ms tick.
const delay=Array.from({length:count},(_,i)=>(Math.round((i+1)*100/fps)-Math.round(i*100/fps))*10);
async function gif(file,input,timing) {
  const flat=await Promise.all(input.map(f=>sharp(f).flatten({background:'#edf3fc'}).png().toBuffer()));
  await sharp(flat,{join:{animated:true}}).gif({loop:0,delay:timing,dither:0,effort:3,keepDuplicateFrames:true}).toFile(at(file));
}
for (const name of ['idle.gif','seated-idle-v3.gif','idle-smooth-v3.gif']) await gif(`previews/${name}`,frames,delay);
const hover = Array.from({length:5},(_,i)=>fs.readFileSync(at(`source/frames/jumping/${String(i).padStart(2,'0')}.png`)));
const work = Array.from({length:6},(_,i)=>fs.readFileSync(at(`source/frames/running/${String(i).padStart(2,'0')}.png`)));
await gif('previews/v3-transition.gif',[...frames,...hover,...work,...frames],[...delay,140,140,140,140,280,120,120,120,120,120,220,...delay]);
const tour=[...frames],tourDelay=[...delay];
const nativeTiming={ 'running-right':[120,220], 'running-left':[120,220], waving:[140,280], jumping:[140,280], failed:[140,240], waiting:[150,260], running:[120,220], review:[150,280] };
for(const state of pet.states.slice(1)) {
  for(let i=0;i<state.frames;i++) {
    tour.push(fs.readFileSync(at(`source/frames/${state.name}/${String(i).padStart(2,'0')}.png`)));
    tourDelay.push(nativeTiming[state.name][i===state.frames-1?1:0]);
  }
}
await gif('previews/all-states.gif',tour,tourDelay);
await sharp(first).flatten({background:'#edf3fc'}).png().toFile(at('previews/contact-sheet-extended.png'));
const sampleIndices=[0,12,24,36,48,60];
await sharp({create:{width:W*6,height:H,channels:4,background:'#edf3fc'}}).composite(sampleIndices.map((i,col)=>({input:frames[i],left:col*W,top:0}))).png().toFile(at('previews/idle-smooth-stills.png'));
const showcase=[frames[0],frames[18],frames[54],work[0],hover[0],fs.readFileSync(at('source/frames/waving/00.png'))];
await sharp({create:{width:W*6,height:H,channels:4,background:'#edf3fc'}}).composite(showcase.map((input,i)=>({input,left:i*W,top:0}))).png().toFile(at('previews/seated-v3-stills.png'));
const firstPixels=await sharp(first).raw().toBuffer(), oldPixels=await sharp(base).raw().toBuffer();
const nonIdleUnchanged=firstPixels.subarray(W*8*H*4).equals(oldPixels.subarray(W*8*H*4));
const stableBody=raw.every(p=>p.subarray(158*W*4).equals(raw[0].subarray(158*W*4)));
const meanChanges=raw.map((p,i)=>{const n=raw[(i+1)%count];let total=0;for(let j=0;j<p.length;j++)total+=Math.abs(p[j]-n[j]);return total/p.length;});
if (!nonIdleUnchanged || !stableBody) throw Error('Smooth idle changed preserved rows or planted lower body');
save('assets/spritesheet.png',apng); save('assets/spritesheet-v3.png',apng);
save('assets/spritesheet-static.png',first);
pet.product_version='3.1'; pet.asset_revision='seated-v3-smooth-idle'; pet.sha256=hash(apng);
pet.staticSpritesheetPath='assets/spritesheet-static.png'; pet.staticSha256=hash(first);
pet.embedded_idle_animation={format:'apng',frames:count,fps,duration_ms:count/fps*1000,amplitude_degrees:amplitude,native_idle_slots:6,synchronization:'identical phase in all native idle slots',reduced_motion:'Install with -StaticIdle; native frame-freeze alone cannot pause an APNG'};
pet.states[0].visual_action='seated-continuous-head-sway'; pet.enhanced_actions.idle='24 fps continuous head rotation around neck; planted seated body';
save('pet.json',JSON.stringify(pet,null,2)+'\n');
const report={valid:true,frames:count,fps,durationMs:3000,amplitudeDegrees:amplitude,maxAdjacentAngleDegrees:Math.max(...angles.map((a,i)=>Math.abs(a-angles[(i+1)%count]))),maxAdjacentMeanRgbaDifference:Math.max(...meanChanges),loopSeamMeanRgbaDifference:meanChanges.at(-1),lowerBodyIdenticalFromY:158,stableBody,nonIdleUnchanged,patchRect,apngBytes:apng.length,sha256:pet.sha256,staticSha256:pet.staticSha256,angles};
save('qa/idle-smooth/continuity.json',JSON.stringify(report,null,2)+'\n');
const registration=JSON.parse(fs.readFileSync(at('qa/v3-registration.json'),'utf8'));
registration.asset_revision=pet.asset_revision;
registration.frames=registration.frames.filter(f=>f.source!=='idle');
registration.idleOverride={source:'source/v3-smooth/rig-layers.png',scale:.34,bodyYOffset:55,neckPivot:[235,330],fps,frames:count,continuityReport:'qa/idle-smooth/continuity.json'};
save('qa/v3-registration.json',JSON.stringify(registration,null,2)+'\n');
console.log(JSON.stringify({...report,angles:undefined},null,2));
await import('./build-cloud-compat.mjs');
