import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const folder = fileURLToPath(new URL('.', import.meta.url));
const css = await readFile(folder + 'simulation.css', 'utf8');
const browser = await chromium.launch({executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || '/usr/bin/chromium', args: ['--no-sandbox']});
const report = [];
async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    const urls = new Set();
    for (const el of document.querySelectorAll('*')) {
      for (const pseudo of [null, '::before', '::after']) {
        for (const m of getComputedStyle(el, pseudo).backgroundImage.matchAll(/url\(["']?([^"')]+)["']?\)/g)) urls.add(m[1]);
      }
    }
    await Promise.all([...urls].map(url => new Promise((resolve, reject) => {
      const image = new Image(); image.onload = resolve; image.onerror = () => reject(new Error(url)); image.src = url;
    })));
    await Promise.all([...document.images].map(image => image.decode()));
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
}
async function measure(page) {
  return page.evaluate(() => {
    const selectors = ['header', 'nav', '.profile', '.footer', 'h1', '.solo-layout', '.solo-choices', '.choice', '.solo-detail', '.solo-detail > *'];
    const rects = selectors.flatMap(selector => [...document.querySelectorAll(selector)].map((el, index) => {
      const r = el.getBoundingClientRect();
      return {selector, index, x: r.x, y: r.y + scrollY, width: r.width, height: r.height};
    }));
    return {text: document.querySelector('.app').innerText, rects, overflow: document.documentElement.scrollWidth > innerWidth};
  });
}
try {
  for (const [width, height] of [[1837,856], [1366,768], [390,844]]) {
    const page = await browser.newPage({viewport: {width,height}, deviceScaleFactor: 1});
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(process.env.SCUM_REVIEW_URL || 'http://127.0.0.1:5173');
    await page.locator('.home-stack').waitFor();
    await settle(page);
    const homeBefore = await page.screenshot();
    await page.locator('nav').getByRole('button', {name:'SOLO', exact:true}).click();
    await settle(page);
    const beforeStates = [];
    for (let i=0; i<4; i++) {
      await page.locator('.choice').nth(i).click();
      beforeStates.push(await measure(page));
    }
    await page.locator('.choice').first().click();
    await page.evaluate(() => scrollTo(0,0));
    await page.screenshot({path:folder+`avant-${width}x${height}.png`});
    await page.addStyleTag({content:css});
    await settle(page);
    const afterStates = [];
    for (let i=0; i<4; i++) {
      await page.locator('.choice').nth(i).click();
      const current = await measure(page);
      assert.deepEqual(current, beforeStates[i], `Géométrie/textes inchangés : ${width}, état ${i}`);
      afterStates.push(current);
    }
    await page.locator('.choice').first().click();
    await page.evaluate(() => scrollTo(0,0));
    await settle(page);
    await page.screenshot({path:folder+`solo-simulation-${width}x${height}.png`});
    if (width===1837) {
      await page.locator('.solo-choices').screenshot({path:folder+'cartes-1837.png'});
      await page.locator('.solo-detail').screenshot({path:folder+'derniere-session-1837.png'});
    }
    if (width===390) {
      await page.locator('.solo-detail > .btn.big').scrollIntoViewIfNeeded();
      await page.screenshot({path:folder+'solo-detail-390x844.png'});
    }
    async function dialog(button, message) {
      await page.getByRole('button', {name:button, exact:true}).click();
      await expect(page.locator('.dialog')).toContainText(message);
      await page.getByRole('button', {name:'FERMER', exact:true}).click();
    }
    await dialog('▶ CONTINUER LA PARTIE', 'Chargement de la partie solo');
    await page.locator('.choice').nth(1).click();
    await page.getByRole('button', {name:'Prisonnier 02', exact:true}).click();
    await expect(page.locator('.solo-detail')).toContainText('Personnage sélectionné : Prisonnier 02');
    await page.locator('.solo-detail').getByRole('button', {name:'✕', exact:true}).nth(1).click();
    await expect(page.locator('.dialog')).toContainText('Prisonnier 02');
    await page.getByRole('button', {name:'ANNULER', exact:true}).click();
    await page.locator('.solo-detail').getByRole('button', {name:'✕', exact:true}).nth(1).click();
    await page.getByRole('button', {name:'SIMULER LA SUPPRESSION', exact:true}).click();
    await expect(page.locator('.dialog')).toContainText('Suppression simulée');
    await page.getByRole('button', {name:'FERMER', exact:true}).click();
    await expect(page.locator('.solo-detail').getByRole('button', {name:'✕', exact:true})).toHaveCount(3);
    await dialog('CHARGER CETTE SAUVEGARDE', 'Chargement de la sauvegarde');
    await page.locator('.choice').nth(2).click();
    await dialog('CRÉER UN PERSONNAGE', 'Création de personnage');
    await page.locator('.choice').nth(3).click();
    await dialog('LANCER LE TUTORIEL', 'Tutoriel — lancement simulé');
    await page.locator('nav').getByRole('button', {name:'ACCUEIL', exact:true}).click();
    await page.evaluate(() => scrollTo(0,0));
    await settle(page);
    assert.ok(homeBefore.equals(await page.screenshot()), 'Accueil identique pixel par pixel avec la CSS de revue');
    assert.deepEqual(errors, []);
    report.push({viewport:[width,height], geometryAndTextIdentical:true, states:afterStates,
      fourPathsAndConfirmations:true, homePixelsIdentical:true, pageErrors:errors});
    await page.close();
  }
  await writeFile(folder+'verification.json', JSON.stringify(report,null,2)+'\n');
  console.log('Trois résolutions vérifiées : quatre états, géométrie/textes identiques, quatre parcours et confirmations, Accueil identique pixel par pixel, aucune erreur JS.');
} finally { await browser.close(); }
