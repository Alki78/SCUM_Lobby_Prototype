// Observation uniquement : vrais clics, aucune injection CSS ou modification DOM.
import {chromium, expect} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const folder=fileURLToPath(new URL('.',import.meta.url));
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1837,height:856},deviceScaleFactor:1});
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
const report={base:'5dd61923be6df5eb6e9b0cf28eb0f1c9e02d4985',viewport:[1837,856],states:[],observations:{}};
async function ready(){await page.evaluate(async()=>{
  await document.fonts.ready;
  const urls=new Set();
  for(const el of document.querySelectorAll('*'))for(const pseudo of [null,'::before','::after'])for(const m of getComputedStyle(el,pseudo).backgroundImage.matchAll(/url\(["']?([^"')]+)["']?\)/g))urls.add(m[1]);
  await Promise.all([...urls].map(url=>new Promise((resolve,reject)=>{const im=new Image();im.onload=resolve;im.onerror=reject;im.src=url;})));
  await Promise.all([...document.images].map(im=>im.decode()));
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
});}
async function capture(name){
  await ready();
  await page.screenshot({path:folder+name+'.png'});
  report.states.push(await page.evaluate(name=>{
    const panel=document.querySelector('.solo-detail'),button=panel.querySelector('.btn.big');
    const rect=el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom};};
    const p=rect(panel),b=rect(button);
    return {capture:name+'.png',view:panel.dataset.soloView,saveIndex:window.state.saveIndex,
      panel:p,button:b,buttonFullyInsidePanel:b.y>=p.y&&b.bottom<=p.bottom,
      scrollTop:panel.scrollTop,scrollHeight:panel.scrollHeight,clientHeight:panel.clientHeight,
      panelText:panel.innerText,dialogText:document.querySelector('.dialog')?.innerText??null,
      activeElement:document.activeElement.tagName,roleDialogCount:document.querySelectorAll('[role="dialog"]').length};
  },name));
}
const select=async id=>{await page.locator(`[data-solo-action="${id}"]`).click();};
const button=name=>page.getByRole('button',{name,exact:true});
async function close(){await button('FERMER').click();}
try{
  await page.goto(process.env.SCUM_REVIEW_URL||'http://127.0.0.1:5173');
  await page.locator('.home-stack').waitFor();
  await page.locator('nav').getByRole('button',{name:'SOLO',exact:true}).click();
  await capture('01-continuer');
  await button('▶ CONTINUER LA PARTIE').click();
  await capture('02-continuer-demonstration');
  await page.keyboard.press('Escape');
  report.observations.escapeClosesDialog=await page.locator('.dialog').count()===0;
  await page.keyboard.press('Tab');
  report.observations.firstTabAfterDialog=await page.evaluate(()=>({tag:document.activeElement.tagName,text:document.activeElement.textContent,insideDialog:!!document.activeElement.closest('.dialog')}));
  await page.locator('.overlay').click({position:{x:10,y:10}});
  report.observations.backdropClosesDialog=await page.locator('.dialog').count()===0;
  await close();
  await select('load');
  await capture('03-sauvegardes-haut');
  await button('Prisonnier 02').click();
  await capture('04-sauvegardes-selection');
  const row=page.locator('.solo-detail > .row').nth(2);
  await row.click({position:{x:250,y:25}});
  report.observations.clickEmptyPartOfRowSelects=await page.evaluate(()=>window.state.saveIndex===2);
  await button('CHARGER CETTE SAUVEGARDE').scrollIntoViewIfNeeded();
  await capture('05-sauvegardes-bas');
  await button('CHARGER CETTE SAUVEGARDE').click();
  await expect(page.locator('.dialog')).toContainText('Chargement de la sauvegarde');
  await capture('06-sauvegardes-chargement');
  await close();
  await page.locator('.solo-detail').getByRole('button',{name:'✕',exact:true}).nth(2).click();
  await expect(page.locator('.dialog')).toContainText('Survivante 03');
  await capture('07-confirmer-suppression');
  report.observations.deletingUnselectedSave=await page.evaluate(()=>({selected:window.state.saveIndex,dialog:window.state.modal}));
  await button('ANNULER').click();
  report.observations.cancelPreservesThreeSaves=await page.locator('.solo-detail').getByRole('button',{name:'✕',exact:true}).count()===3;
  await page.locator('.solo-detail').getByRole('button',{name:'✕',exact:true}).nth(2).click();
  await button('SIMULER LA SUPPRESSION').click();
  await capture('08-suppression-simulee');
  await close();
  await capture('09-sauvegardes-apres-suppression');
  report.observations.saveCountAfterSimulatedDelete=await page.locator('.solo-detail').getByRole('button',{name:'✕',exact:true}).count();
  await select('continue');
  report.observations.continueAfterLoadingOtherSave=await page.evaluate(()=>({selectedSaveIndex:window.state.saveIndex,continueName:document.querySelector('.solo-detail h3').textContent}));
  await select('new');
  await capture('10-nouvelle-partie');
  await button('CRÉER UN PERSONNAGE').click();
  await capture('11-creation-demonstration');
  await close();
  await select('tutorial');
  await capture('12-tutoriel');
  await button('LANCER LE TUTORIEL').click();
  await capture('13-tutoriel-demonstration');
  await close();
  await page.locator('nav').getByRole('button',{name:'ACCUEIL',exact:true}).click();
  await page.locator('nav').getByRole('button',{name:'SOLO',exact:true}).click();
  report.observations.stateAfterLeavingAndReturning=await page.evaluate(()=>({solo:window.state.solo,saveIndex:window.state.saveIndex}));
  await page.reload();
  report.observations.stateAfterReload=await page.evaluate(()=>({tab:window.state.tab,solo:window.state.solo,saveIndex:window.state.saveIndex}));
  report.pageErrors=errors;
  await writeFile(folder+'observations.json',JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({captures:report.states.length,observations:report.observations,errors},null,2));
}finally{await browser.close();}
