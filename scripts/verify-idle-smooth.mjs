// Optional browser QA: requires Playwright and an installed Microsoft Edge.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const require=createRequire(import.meta.url),{chromium}=require('playwright'),sharp=require('sharp');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const at=p=>path.join(root,p),hash=p=>crypto.createHash('sha256').update(p).digest('hex');
function memory() {
  try { const bytes=Number(execFileSync('powershell.exe',['-NoProfile','-Command','(Get-Process msedge -ErrorAction SilentlyContinue | Measure-Object -Property WorkingSet64 -Sum).Sum'],{encoding:'utf8'}).trim());return bytes; }
  catch { return null; }
}
const browser=await chromium.launch({channel:'msedge',headless:true});
try {
  const page=await browser.newPage({viewport:{width:1200,height:300},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const baselineMemory=memory();
  const data='data:image/png;base64,'+fs.readFileSync(at('assets/spritesheet.png')).toString('base64');
  await page.setContent(`<style>body{margin:0;background:#edf3fc}#track{display:flex;width:1152px;height:208px}.pet{width:192px;height:208px;background-image:url(${data});background-size:1536px 2288px;flex:none}</style><div id="track">${Array.from({length:6},(_,i)=>`<div class="pet" style="background-position:${-i*192}px 0"></div>`).join('')}</div>`);
  await page.waitForTimeout(100);
  const hashes=[],changedMeans=[],sampleTimes=[];
  let previous,planted,allSlotsSame=true,bodyStable=true;
  const started=performance.now();
  for(let i=0;i<40;i++) {
    await page.waitForTimeout(45);
    const screenshot=await page.locator('#track').screenshot();
    const pixels=await sharp(screenshot).ensureAlpha().raw().toBuffer();
    const first=Buffer.alloc(192*208*4);
    for(let y=0;y<208;y++) pixels.copy(first,y*192*4,y*1152*4,(y*1152+192)*4);
    for(let col=1;col<6;col++) for(let y=0;y<208;y++) {
      if(!pixels.subarray((y*1152+col*192)*4,(y*1152+(col+1)*192)*4).equals(first.subarray(y*192*4,(y+1)*192*4))) allSlotsSame=false;
    }
    const currentBody=hash(first.subarray(158*192*4));
    planted??=currentBody;bodyStable&&=currentBody===planted;
    hashes.push(hash(first));sampleTimes.push(performance.now()-started);
    if(previous){let sum=0;for(let j=0;j<first.length;j++)sum+=Math.abs(first[j]-previous[j]);changedMeans.push(sum/first.length);}
    previous=first;
    if(i%10===0) await sharp(first,{raw:{width:192,height:208,channels:4}}).png().toFile(at(`qa/idle-smooth/browser-${i}.png`));
  }
  const animatedMemory=memory();
  await page.locator('.pet').evaluateAll(elements=>elements.forEach(e=>e.style.backgroundPosition='0px -1456px'));
  const workHashes=[];
  for(let i=0;i<4;i++){await page.waitForTimeout(90);workHashes.push(hash(await page.locator('.pet').first().screenshot()));}
  const workPixelsStable=new Set(workHashes).size===1;
  const staticData='data:image/png;base64,'+fs.readFileSync(at('assets/spritesheet-static.png')).toString('base64');
  await page.locator('.pet').evaluateAll((elements,url)=>elements.forEach(e=>{e.style.backgroundImage=`url(${url})`;e.style.backgroundPosition='0px 0px';}),staticData);
  const stillHashes=[];
  for(let i=0;i<3;i++){await page.waitForTimeout(150);stillHashes.push(hash(await page.locator('.pet').first().screenshot()));}
  const staticVariantStable=new Set(stillHashes).size===1;
  const uniqueFramesObserved=new Set(hashes).size;
  const report={valid:uniqueFramesObserved>15&&allSlotsSame&&bodyStable&&workPixelsStable&&staticVariantStable&&!errors.length,uniqueFramesObserved,samples:hashes.length,elapsedMs:sampleTimes.at(-1),allSixNativeSlotsSamePhase:allSlotsSame,plantedBodyStable:bodyStable,workPixelsStable,staticVariantStable,maxObservedSampleDifference:Math.max(...changedMeans),edgeWorkingSetDeltaMB:baselineMemory&&animatedMemory?(animatedMemory-baselineMemory)/1024/1024:null,errors,scope:'Real-time headless Edge CSS-background rendering through the same PNG data-URL path used by the inspected native loader; not a live Codex UI capture.'};
  fs.writeFileSync(at('qa/idle-smooth/browser.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
  if(!report.valid) throw Error('Smooth idle browser verification failed');
} finally { await browser.close(); }
