import {chromium,expect} from '@playwright/test';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {PNG} from 'pngjs';
import assert from 'node:assert/strict';
const folder=fileURLToPath(new URL('.',import.meta.url));
const css=await readFile(folder+'simulation.css','utf8');
const script=await readFile(folder+'simulation.js','utf8');
const v1css=await readFile(folder+'reference-v1.css','utf8');
assert.equal(css.replace('/docs/reviews/solo-tutorial-v2-parachute/tutoriel-largage-banniere.png', '/assets/images/home-battleground.png'),v1css,'CSS identique à la v1 hors URL de bannière');
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-gpu']});
const report=[];
async function ready(page){await page.evaluate(async()=>{
  await document.fonts.ready;
  const urls=new Set();
  for(const el of document.querySelectorAll('*'))for(const pseudo of[null,'::before','::after'])for(const m of getComputedStyle(el,pseudo).backgroundImage.matchAll(/url\(["']?([^"')]+)["']?\)/g))urls.add(m[1]);
  await Promise.all([...urls].map(url=>new Promise((resolve,reject)=>{const im=new Image();im.onload=resolve;im.onerror=reject;im.src=url;})));
  await Promise.all([...document.images].map(im=>im.decode()));
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
});
  // Laisser Chromium terminer le rééchantillonnage différé des fonds CSS.
  await page.waitForTimeout(400);
}
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
  for(const [width,height] of [[1837,856],[1366,768],[390,844]]){
    const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(process.env.SCUM_REVIEW_URL||'http://127.0.0.1:5173');
    await page.locator('.home-stack').waitFor();
    await ready(page);
    const homeBefore=await page.screenshot();
    await page.locator('nav').getByRole('button',{name:'SOLO',exact:true}).click();
    const baselines={};let continueWidth;
    for(const state of ['continue','load','new']){
      await page.locator(`[data-solo-action="${state}"]`).click();
      await ready(page);await page.evaluate(()=>scrollTo(0,0));
      baselines[state]=await page.screenshot();
      if(state==='continue')continueWidth=(await page.locator('.solo-detail > .btn.big').boundingBox()).width;
    }
    await page.locator('[data-solo-action="tutorial"]').click();
    await ready(page);await page.evaluate(()=>scrollTo(0,0));
    const originalGeometry=await geometry(page),production=await metrics(page);
    await page.getByRole('button',{name:'LANCER LE TUTORIEL',exact:true}).click();
    await expect(page.locator('.dialog')).toContainText('Tutoriel — lancement simulé');
    const originalDialog=await page.locator('.dialog').evaluate(el=>el.outerHTML);
    await page.getByRole('button',{name:'FERMER',exact:true}).click();
    await page.evaluate(()=>scrollTo(0,0));await ready(page);
    const productionShot=await page.screenshot();

    // Reconstitution exacte de la composition validée v1, sur le dernier main.
    await page.addStyleTag({content:v1css});await page.addScriptTag({content:script});
    await expect(page.locator('[data-review-tutorial]')).toHaveCount(1);
    await ready(page);await page.evaluate(()=>scrollTo(0,0));
    const v1=await metrics(page);
    assert.deepEqual(await geometry(page),originalGeometry);
    const v1shot=await page.screenshot({path:folder+`v1-${width}x${height}.png`});
    let v1detail=null;
    if(width===390){
      await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight-innerHeight));
      v1detail=await page.screenshot({path:folder+'v1-detail-390x844.png'});
      await page.evaluate(()=>scrollTo(0,0));
    }

    // Seule l'URL d'image change ; aucun nouveau rendu applicatif ni nouveau contenu.
    await page.addStyleTag({content:css});await ready(page);
    const v2=await metrics(page);
    assert.deepEqual(await geometry(page),originalGeometry,'Géométrie extérieure identique');
    for(const key of ['panel','button','illustration','texts','panelScrollHeight','panelClientHeight','documentHeight']){
      assert.deepEqual(v2[key],v1[key],`${key} identique à la v1`);
    }
    assert.deepEqual(v2.texts,production.texts);
    assert.equal(v2.button.width,continueWidth);
    assert.equal(v2.panelScrollHeight,v2.panelClientHeight);
    assert.equal(v2.pageWidth,width);
    assert.ok(v2.buttonInsidePanel);
    assert.equal(v2.illustration.width,v2.button.width);
    assert.ok(v2.illustration.width<=1388&&v2.illustration.height<=640);
    assert.ok(Math.abs(v2.illustration.width/v2.illustration.height-1388/640)<.001);
    assert.ok(v2.image.includes('tutoriel-largage-banniere.png'));
    const loadedImage=await page.evaluate(async()=>{
      const img=new Image();img.src='/docs/reviews/solo-tutorial-v2-parachute/tutoriel-largage-banniere.png';
      await img.decode();return [img.naturalWidth,img.naturalHeight];
    });
    assert.deepEqual(loadedImage,[1388,640]);
    const shot=await page.screenshot({path:folder+`tutoriel-${width}x${height}.png`});
    const outsideIllustration=outsideDiff(v1shot,shot,v1.illustration);
    const outsidePanel=outsideDiff(productionShot,shot,production.panel);
    let detail=null,mobileOutsideIllustration=null;
    if(width===390){
      await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight-innerHeight));
      const detailShot=await page.screenshot({path:folder+'tutoriel-detail-390x844.png'});
      detail=await metrics(page);assert.ok(detail.buttonAboveFooter);
      mobileOutsideIllustration=outsideDiff(v1detail,detailShot,{
        ...detail.illustration,y:detail.illustration.y-detail.pageScrollY
      });
    }else assert.ok(v2.buttonAboveFooter);
    await page.getByRole('button',{name:'LANCER LE TUTORIEL',exact:true}).click();
    await expect(page.locator('.dialog')).toContainText('Tutoriel — lancement simulé');
    assert.equal(await page.locator('.dialog').evaluate(el=>el.outerHTML),originalDialog);
    if(width===1837)await page.screenshot({path:folder+'message-demonstration-1837x856.png'});
    await page.getByRole('button',{name:'FERMER',exact:true}).click();
    await expect(page.locator('.solo-detail input, .solo-detail select, .solo-detail textarea')).toHaveCount(0);
    for(const state of ['continue','load','new']){
      await page.locator(`[data-solo-action="${state}"]`).click();
      await ready(page);await page.evaluate(()=>scrollTo(0,0));
      assert.ok(baselines[state].equals(await page.screenshot()),`${state} identique à la production`);
    }
    await page.locator('nav').getByRole('button',{name:'ACCUEIL',exact:true}).click();
    // Écarter le survol du bouton de navigation pour comparer le même état.
    await page.mouse.move(0,0);
    await ready(page);await page.evaluate(()=>scrollTo(0,0));
    assert.ok(homeBefore.equals(await page.screenshot()),'Accueil identique à la production');
    assert.deepEqual(errors,[]);
    report.push({viewport:[width,height],production,v1,v2,mobileDetail:detail,
      v1ToV2OutsideIllustrationChangedPixels:outsideIllustration,
      productionToV2OutsidePanelChangedPixels:outsidePanel,
      mobileOutsideIllustrationChangedPixels:mobileOutsideIllustration,
      imageNativeDimensions:loadedImage,otherSoloStatesIdentical:true,homeIdentical:true,
      dialogIdentical:true,noForm:true,errors});
    await page.close();
  }
  await writeFile(folder+'verification.json',JSON.stringify(report,null,2)+'\n');
  console.log('Trois résolutions vérifiées : composition v1 identique, seule la bannière change, zéro pixel hors panneau modifié, autres parcours et Accueil identiques, dialogue conservé.');
}finally{await browser.close();}
