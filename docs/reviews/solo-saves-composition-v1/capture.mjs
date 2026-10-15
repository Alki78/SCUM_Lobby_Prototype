import {chromium, expect} from '@playwright/test';
import {readFile, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {PNG} from 'pngjs';
const folder=fileURLToPath(new URL('.',import.meta.url));
const css=await readFile(folder+'simulation.css','utf8');
const script=await readFile(folder+'simulation.js','utf8');
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const report=[];
async function ready(page){await page.evaluate(async()=>{
  await document.fonts.ready;
  const urls=new Set();
  for(const el of document.querySelectorAll('*'))for(const pseudo of [null,'::before','::after'])for(const m of getComputedStyle(el,pseudo).backgroundImage.matchAll(/url\(["']?([^"')]+)["']?\)/g))urls.add(m[1]);
  await Promise.all([...urls].map(url=>new Promise((resolve,reject)=>{const im=new Image();im.onload=resolve;im.onerror=reject;im.src=url;})));
  await Promise.all([...document.images].map(im=>im.decode()));
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
});}
async function geometry(page){return page.evaluate(()=>{
  const selectors=['header','nav','.profile','.footer','h1','.solo-layout','.solo-choices','.choice','.solo-detail'];
  return selectors.flatMap(selector=>[...document.querySelectorAll(selector)].map((el,index)=>{
    const r=el.getBoundingClientRect();return {selector,index,x:r.x,y:r.y+scrollY,width:r.width,height:r.height};
  }));
});}
async function metrics(page){return page.evaluate(()=>{
  const p=document.querySelector('.solo-detail'),list=p.querySelector('.review-save-list'),btn=p.querySelector(':scope > .btn.big');
  const rect=el=>{const r=el.getBoundingClientRect();return{x:r.x,y:r.y+scrollY,width:r.width,height:r.height,bottom:r.bottom+scrollY};};
  const pr=rect(p),br=rect(btn);
  return {panel:pr,button:br,panelScrollHeight:p.scrollHeight,panelClientHeight:p.clientHeight,
    listScrollHeight:list?.scrollHeight??null,listClientHeight:list?.clientHeight??null,
    buttonFullyInsidePanel:br.y>=pr.y&&br.bottom<=pr.bottom,
    pageScrollY:scrollY,documentHeight:document.documentElement.scrollHeight,
    pageWidth:document.documentElement.scrollWidth,panelText:p.innerText};
});}
function checkOutside(before,after,rect){
  const a=PNG.sync.read(before),b=PNG.sync.read(after);let changed=0;
  for(let y=0;y<a.height;y++)for(let x=0;x<a.width;x++){
    if(x>=Math.floor(rect.x)&&x<Math.ceil(rect.x+rect.width)&&y>=Math.floor(rect.y)&&y<Math.ceil(rect.y+rect.height))continue;
    const i=(y*a.width+x)*4;if(!a.data.subarray(i,i+4).equals(b.data.subarray(i,i+4)))changed++;
  }
  assert.equal(changed,0,'Aucun pixel modifié hors du panneau droit');return changed;
}
try{
  for(const [width,height]of[[1837,856],[1366,768],[390,844]]){
    const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(process.env.SCUM_REVIEW_URL||'http://127.0.0.1:5173');
    await page.locator('.home-stack').waitFor();
    await page.locator('nav').getByRole('button',{name:'SOLO',exact:true}).click();
    await ready(page);const mainBefore=await page.screenshot();
    await page.locator('[data-solo-action="load"]').click();await ready(page);
    const original=await geometry(page),before=await metrics(page);
    const beforeImage=await page.screenshot({path:folder+`avant-${width}x${height}.png`});
    await page.addStyleTag({content:css});await page.addScriptTag({content:script});
    const states=[];
    for(const name of['Alki','Prisonnier 02']){
      await page.getByRole('button',{name,exact:true}).click();
      await expect(page.locator('[data-review-saves]')).toHaveCount(1);
      await ready(page);await page.evaluate(()=>scrollTo(0,0));
      assert.deepEqual(await geometry(page),original,'Cadres extérieurs identiques');
      const slug=name==='Alki'?'alki':'prisonnier-02';
      const image=await page.screenshot({path:folder+`${slug}-${width}x${height}.png`});
      const changed=checkOutside(beforeImage,image,before.panel);
      const current=await metrics(page);
      assert.ok(current.buttonFullyInsidePanel);
      assert.equal(current.panelScrollHeight,current.panelClientHeight);
      assert.equal(current.pageWidth,width);
      if(width===1837)assert.ok(current.listScrollHeight<=current.listClientHeight);
      if(width===390){
        // Montrer le panneau entier au-dessus du footer fixe existant.
        await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight-innerHeight));
        await page.screenshot({path:folder+`${slug}-detail-390x844.png`});
        current.mobileDetail=await metrics(page);
        const footerTop=await page.locator('.footer').evaluate(el=>el.getBoundingClientRect().top);
        assert.ok(current.mobileDetail.button.bottom-current.mobileDetail.pageScrollY<=footerTop);
      }
      states.push({name,...current,outsideChangedPixels:changed});
    }
    // Les vrais boutons et confirmations de production restent opérationnels.
    await page.getByRole('button',{name:'CHARGER CETTE SAUVEGARDE',exact:true}).click();
    await expect(page.locator('.dialog')).toContainText('Chargement de la sauvegarde');
    await page.getByRole('button',{name:'FERMER',exact:true}).click();
    const deletes=()=>page.locator('.review-save-list').getByRole('button',{name:'✕',exact:true});
    await deletes().nth(1).click();
    await expect(page.locator('.dialog')).toContainText('Prisonnier 02');
    await page.getByRole('button',{name:'ANNULER',exact:true}).click();
    await deletes().nth(1).click();
    await page.getByRole('button',{name:'SIMULER LA SUPPRESSION',exact:true}).click();
    await expect(page.locator('.dialog')).toContainText('Suppression simulée');
    await page.getByRole('button',{name:'FERMER',exact:true}).click();
    await expect(deletes()).toHaveCount(3);
    assert.equal(await page.evaluate(()=>window.state.saveIndex),1);
    await page.locator('[data-solo-action="continue"]').click();
    await ready(page);await page.evaluate(()=>scrollTo(0,0));
    assert.ok(mainBefore.equals(await page.screenshot()),'Page principale SOLO identique');
    assert.deepEqual(errors,[]);
    report.push({viewport:[width,height],before,states,mainSoloIdentical:true,existingInteractionsPreserved:true,errors});
    await page.close();
  }
  await writeFile(folder+'verification.json',JSON.stringify(report,null,2)+'\n');
  console.log('Trois résolutions, deux sélections : cadres identiques, aucun pixel changé hors panneau, bouton visible, interactions conservées.');
}finally{await browser.close();}
