import {chromium,expect} from '@playwright/test';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {PNG} from 'pngjs';
import assert from 'node:assert/strict';
const folder=fileURLToPath(new URL('.',import.meta.url));
const css=await readFile(folder+'simulation.css','utf8');
const script=await readFile(folder+'simulation.js','utf8');
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const report=[];
async function ready(page){await page.evaluate(async()=>{
  await document.fonts.ready;
  const urls=new Set();
  for(const el of document.querySelectorAll('*'))for(const pseudo of[null,'::before','::after'])for(const m of getComputedStyle(el,pseudo).backgroundImage.matchAll(/url\(["']?([^"')]+)["']?\)/g))urls.add(m[1]);
  await Promise.all([...urls].map(url=>new Promise((resolve,reject)=>{const im=new Image();im.onload=resolve;im.onerror=reject;im.src=url;})));
  await Promise.all([...document.images].map(im=>im.decode()));
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
});}
async function geometry(page){return page.evaluate(()=>{
  const selectors=['header','nav','.profile','.footer','h1','.solo-layout','.solo-choices','.choice','.solo-detail'];
  return selectors.flatMap(selector=>[...document.querySelectorAll(selector)].map((el,index)=>{
    const r=el.getBoundingClientRect();return{selector,index,x:r.x,y:r.y+scrollY,width:r.width,height:r.height};
  }));
});}
async function metrics(page){return page.evaluate(()=>{
  const panel=document.querySelector('.solo-detail'),btn=panel.querySelector('.btn.big'),art=panel.querySelector('.illustration');
  const rect=el=>{const r=el.getBoundingClientRect();return{x:r.x,y:r.y+scrollY,width:r.width,height:r.height,bottom:r.bottom+scrollY};};
  const p=rect(panel),b=rect(btn),footer=document.querySelector('.footer').getBoundingClientRect();
  return{panel:p,button:b,illustration:rect(art),image:getComputedStyle(art).backgroundImage,
    panelScrollHeight:panel.scrollHeight,panelClientHeight:panel.clientHeight,
    buttonInsidePanel:b.y>=p.y&&b.bottom<=p.bottom,buttonAboveFooter:b.bottom-scrollY<=footer.top,
    texts:[panel.querySelector('h2').textContent,panel.querySelector('p').textContent,btn.textContent],
    pageScrollY:scrollY,documentHeight:document.documentElement.scrollHeight,pageWidth:document.documentElement.scrollWidth};
});}
function outsideDiff(a,b,p){
  const left=PNG.sync.read(a),right=PNG.sync.read(b);let changed=0;
  for(let y=0;y<left.height;y++)for(let x=0;x<left.width;x++){
    if(x>=Math.floor(p.x)&&x<Math.ceil(p.x+p.width)&&y>=Math.floor(p.y)&&y<Math.ceil(p.y+p.height))continue;
    const i=(y*left.width+x)*4;if(!left.data.subarray(i,i+4).equals(right.data.subarray(i,i+4)))changed++;
  }
  assert.equal(changed,0,'Aucun pixel changé hors panneau droit');return changed;
}
try{
  for(const[width,height]of[[1837,856],[1366,768],[390,844]]){
    const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(process.env.SCUM_REVIEW_URL||'http://127.0.0.1:5173');
    await page.locator('.home-stack').waitFor();
    await page.locator('nav').getByRole('button',{name:'SOLO',exact:true}).click();
    const baselines={};let continueWidth;
    for(const state of['continue','load','tutorial']){
      await page.locator(`[data-solo-action="${state}"]`).click();
      await ready(page);await page.evaluate(()=>scrollTo(0,0));
      baselines[state]=await page.screenshot();
      if(state==='continue')continueWidth=(await page.locator('.solo-detail > .btn.big').boundingBox()).width;
    }
    await page.locator('[data-solo-action="new"]').click();
    await ready(page);await page.evaluate(()=>scrollTo(0,0));
    const originalGeometry=await geometry(page),before=await metrics(page);
    const beforeImage=await page.screenshot({path:folder+`avant-${width}x${height}.png`});
    if(width===390){
      await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight-innerHeight));
      await page.screenshot({path:folder+'avant-detail-390x844.png'});
      await page.evaluate(()=>scrollTo(0,0));
    }
    await page.getByRole('button',{name:'CRÉER UN PERSONNAGE',exact:true}).click();
    const originalDialog=await page.locator('.dialog').evaluate(el=>el.outerHTML);
    await page.getByRole('button',{name:'FERMER',exact:true}).click();
    await page.addStyleTag({content:css});await page.addScriptTag({content:script});
    await expect(page.locator('[data-review-new]')).toHaveCount(1);
    await ready(page);await page.evaluate(()=>scrollTo(0,0));
    const after=await metrics(page);
    assert.deepEqual(await geometry(page),originalGeometry,'Géométrie extérieure conservée');
    assert.deepEqual(after.texts,before.texts,'Textes conservés');
    assert.equal(after.button.width,continueWidth);
    assert.equal(after.panelScrollHeight,after.panelClientHeight);
    assert.equal(after.pageWidth,width);
    assert.ok(after.buttonInsidePanel);
    assert.deepEqual([after.illustration.width,after.illustration.height],[264,118]);
    assert.ok(after.image.includes('solo-nouvelle-partie.png')&&!after.image.includes('solo-background.jpg'));
    const shot=await page.screenshot({path:folder+`nouvelle-partie-${width}x${height}.png`});
    const changed=outsideDiff(beforeImage,shot,before.panel);
    let detail=null;
    if(width===390){
      await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight-innerHeight));
      await page.screenshot({path:folder+'nouvelle-partie-detail-390x844.png'});
      detail=await metrics(page);assert.ok(detail.buttonAboveFooter);
    }
    await page.getByRole('button',{name:'CRÉER UN PERSONNAGE',exact:true}).click();
    await expect(page.locator('.dialog')).toContainText('Création de personnage — écran du jeu non reproduit');
    assert.equal(await page.locator('.dialog').evaluate(el=>el.outerHTML),originalDialog);
    if(width===1837)await page.screenshot({path:folder+'message-demonstration-1837x856.png'});
    await page.getByRole('button',{name:'FERMER',exact:true}).click();
    await expect(page.locator('.solo-detail input, .solo-detail select, .solo-detail textarea')).toHaveCount(0);
    for(const state of['continue','load','tutorial']){
      await page.locator(`[data-solo-action="${state}"]`).click();
      await ready(page);await page.evaluate(()=>scrollTo(0,0));
      assert.ok(baselines[state].equals(await page.screenshot()),`${state} identique`);
    }
    assert.deepEqual(errors,[]);
    report.push({viewport:[width,height],before,after,mobileDetail:detail,outsideChangedPixels:changed,
      otherSoloStatesIdentical:true,dialogIdentical:true,noForm:true,errors});
    await page.close();
  }
  await writeFile(folder+'verification.json',JSON.stringify(report,null,2)+'\n');
  console.log('Trois résolutions : cadres et autres parcours identiques, image à taille native, bouton visible, dialogue inchangé, aucune erreur JS.');
}finally{await browser.close();}
