// Cloud Pets currently re-encodes PNGs without APNG blocks. Keep a gentle
// six-slot idle using poses from the approved continuous-animation source.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require=createRequire(import.meta.url),sharp=require('sharp');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const at=p=>path.join(root,p);
const {data,info}=await sharp(at('assets/spritesheet-static.png')).raw().toBuffer({resolveWithObject:true});
const indices=[0,2,3,0,69,70];
const pngs=[];
for(const [col,index] of indices.entries()) {
  const file=at(`source/v3-smooth/frames/${String(index).padStart(3,'0')}.png`);
  const png=fs.readFileSync(file);pngs.push(png);
  const cell=await sharp(png).raw().toBuffer();
  for(let y=0;y<208;y++)cell.copy(data,(y*1536+col*192)*4,y*192*4,(y+1)*192*4);
}
const result=await sharp(data,{raw:{width:info.width,height:info.height,channels:4}}).png().toBuffer();
fs.writeFileSync(at('assets/spritesheet-cloud.png'),result);
const frames=await Promise.all(pngs.map(p=>sharp(p).flatten({background:'#edf3fc'}).png().toBuffer()));
await sharp(frames,{join:{animated:true}}).gif({loop:0,delay:[1680,660,660,840,840,1920],dither:0,keepDuplicateFrames:true}).toFile(at('previews/idle-cloud-compatible.gif'));
const report={format:'PNG v2',width:1536,height:2288,sourceFrameIndices:indices,amplitudeDegrees:1.2940952255126037,nativeIdleSlots:6,sha256:crypto.createHash('sha256').update(result).digest('hex'),reason:'Cloud Pets re-encoding removes embedded APNG animation; native animation must be represented by the six atlas slots.'};
fs.writeFileSync(at('qa/cloud-compatibility.json'),JSON.stringify(report,null,2)+'\n');
const manifest=JSON.parse(fs.readFileSync(at('pet.json'),'utf8'));
manifest.cloudSpritesheetPath='assets/spritesheet-cloud.png';
manifest.cloudSha256=report.sha256;
fs.writeFileSync(at('pet.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
