// Offline diagnostic only: encode the approved motion; never uploads or activates a pet.
// Cloud readback on 2026-10-15 stripped this animation. Use spritesheet-cloud.png for dot.
// Uses lossless per-frame patches, per the WebP RIFF container specification.
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url),sharp=require('sharp');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const at=p=>path.join(root,p);
function chunk(type,data){const b=Buffer.alloc(8+data.length+data.length%2);b.write(type);b.writeUInt32LE(data.length,4);data.copy(b,8);return b;}
function imageChunks(webp){const chunks=[];for(let o=12;o<webp.length;){const n=webp.readUInt32LE(o+4),t=webp.toString('ascii',o,o+4);if(['VP8L','VP8 ','ALPH'].includes(t))chunks.push(webp.subarray(o,o+8+n+n%2));o+=8+n+n%2;}return Buffer.concat(chunks);}
const vp8x=Buffer.alloc(10);vp8x[0]=0x12;vp8x.writeUIntLE(1535,4,3);vp8x.writeUIntLE(2287,7,3);
const output=[chunk('VP8X',vp8x),chunk('ANIM',Buffer.alloc(6))];
for(let i=0;i<72;i++){
  let webp,x=0,y=0,w=1536,h=2288;
  if(i===0)webp=await sharp(at('assets/spritesheet-static.png')).webp({lossless:true,effort:4}).toBuffer();
  else{
    const frame=await sharp(at(`source/v3-smooth/frames/${String(i).padStart(3,'0')}.png`)).raw().toBuffer();
    x=14;y=16;w=1122;h=138;const pixels=Buffer.alloc(w*h*4);
    for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){const sx=(xx+x)%192,sy=yy+y;frame.copy(pixels,(yy*w+xx)*4,(sy*192+sx)*4,(sy*192+sx+1)*4);}
    webp=await sharp(pixels,{raw:{width:w,height:h,channels:4}}).webp({lossless:true,effort:4}).toBuffer();
  }
  const header=Buffer.alloc(16);header.writeUIntLE(x/2,0,3);header.writeUIntLE(y/2,3,3);header.writeUIntLE(w-1,6,3);header.writeUIntLE(h-1,9,3);
  header.writeUIntLE(Math.round((i+1)*1000/24)-Math.round(i*1000/24),12,3);header[15]=2;
  output.push(chunk('ANMF',Buffer.concat([header,imageChunks(webp)])));
}
const body=Buffer.concat([Buffer.from('WEBP'),...output]),header=Buffer.alloc(8);header.write('RIFF');header.writeUInt32LE(body.length,4);
const result=Buffer.concat([header,body]);fs.mkdirSync(at('qa/idle-smooth'),{recursive:true});fs.writeFileSync(at('qa/idle-smooth/animated-webp-probe.webp'),result);
console.log(JSON.stringify({bytes:result.length,frames:72,fps:24,path:'qa/idle-smooth/animated-webp-probe.webp'}));
