// Captures de la branche courante ; les fichiers « avant » restent inchangés.
import { chromium } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const folder = fileURLToPath(new URL('.', import.meta.url));
const before = JSON.parse(await readFile(folder + 'before-layout.json', 'utf8'));
const browser = await chromium.launch({executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || '/usr/bin/chromium', args: ['--no-sandbox']});
const results = [];
try {
  for (const baseline of before) {
    const [width,height] = baseline.viewport;
    const page = await browser.newPage({viewport: {width,height}, deviceScaleFactor: 1});
    await page.goto(process.env.SCUM_REVIEW_URL || 'http://127.0.0.1:5173');
    await page.locator('.home-stack').waitFor();
    await page.evaluate(async () => {
      await document.fonts.ready;
      const urls = new Set();
      for (const el of document.querySelectorAll('*')) for (const pseudo of [null, '::before', '::after']) for (const m of getComputedStyle(el,pseudo).backgroundImage.matchAll(/url\(["']?([^"')]+)["']?\)/g)) urls.add(m[1]);
      await Promise.all([...urls].map(url => new Promise((resolve,reject) => {const img = new Image(); img.onload = resolve; img.onerror = reject; img.src = url;})));
      await Promise.all([...document.images].map(img => img.decode()));
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
    const layout = await page.evaluate(selectors => selectors.flatMap(selector => [...document.querySelectorAll(selector)].map(el => {const r=el.getBoundingClientRect(); return {selector,rect:[r.x,r.y,r.width,r.height]};})), [...new Set(baseline.items.map(item=>item.selector))]);
    assert.deepEqual(layout, baseline.items.map(({selector,rect}) => ({selector,rect})));
    await page.screenshot({path: `${folder}apres-${width}x${height}.png`});
    results.push({viewport:[width,height], geometryIdentical:true, layout});
    await page.close();
  }
  await writeFile(folder + 'after-layout.json', JSON.stringify(results,null,2) + '\n');
  console.log('Trois captures enregistrées ; emplacements identiques avant/après.');
} finally {await browser.close();}
