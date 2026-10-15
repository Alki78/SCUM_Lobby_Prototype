import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const folder=fileURLToPath(new URL('.',import.meta.url));
const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || '/usr/bin/chromium',args:['--no-sandbox']});
const results=[];
try {
  for (const [width,height] of [[1837,856],[1366,768],[390,844]]) {
    const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
    await page.goto(process.env.SCUM_REVIEW_URL || 'http://127.0.0.1:5173');
    await page.locator('.home-stack').waitFor();
    await page.locator('nav').getByRole('button',{name:'SOLO',exact:true}).click();
    await page.evaluate(async()=>{
      await document.fonts.ready;
      const urls=new Set();
      for(const el of document.querySelectorAll('*')) for(const pseudo of [null,'::before','::after']) for(const m of getComputedStyle(el,pseudo).backgroundImage.matchAll(/url\(["']?([^"')]+)["']?\)/g)) urls.add(m[1]);
      await Promise.all([...urls].map(url=>new Promise((resolve,reject)=>{const image=new Image();image.onload=resolve;image.onerror=reject;image.src=url;})));
      await Promise.all([...document.images].map(image=>image.decode()));
      await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    });
    await page.screenshot({path:`${folder}after-${width}x${height}.png`});
    const states=[];
    for(let i=0;i<4;i++) {
      await page.locator('.choice').nth(i).click();
      states.push(await page.evaluate(()=>{
        const rect=el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y+scrollY,width:r.width,height:r.height};};
        const panel=document.querySelector('.solo-detail');
        return {view:panel.dataset.soloView,choices:[...document.querySelectorAll('.choice')].map(rect),panel:rect(panel),scrollHeight:panel.scrollHeight,clientHeight:panel.clientHeight};
      }));
      if(i===1 && width===1837) await page.screenshot({path:folder+'after-saves-1837x856.png'});
    }
    await page.locator('.choice').first().click();
    if(width===390) {
      await page.locator('.solo-detail>.btn.big').scrollIntoViewIfNeeded();
      await page.screenshot({path:folder+'after-detail-390x844.png'});
    }
    results.push({viewport:[width,height],states});
    await page.close();
  }
  await writeFile(folder+'measurements.json',JSON.stringify(results,null,2)+'\n');
  console.log('Captures et mesures des quatre états enregistrées aux trois résolutions.');
} finally {await browser.close();}
