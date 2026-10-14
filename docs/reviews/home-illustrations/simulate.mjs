// Capture du véritable Accueil avec styles temporaires, sans modifier src/.
import { chromium } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { PNG } from 'pngjs';

const folder = fileURLToPath(new URL('.', import.meta.url));
const baseURL = process.env.SCUM_REVIEW_URL || 'http://127.0.0.1:5173';
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || '/usr/bin/chromium',
  args: ['--no-sandbox'],
});
try {
  const page = await browser.newPage({ viewport: { width: 1837, height: 856 }, deviceScaleFactor: 1 });
  const failures = [];
  page.on('pageerror', error => failures.push(error.message));
  await page.goto(baseURL);
  await page.locator('.home-news-v04').waitFor();
  await page.evaluate(() => document.fonts.ready);
  // Les images ajoutées par render() peuvent charger après l’événement load.
  await page.evaluate(async () => {
    const urls = new Set();
    for (const el of document.querySelectorAll('*')) {
      for (const pseudo of [null, '::before', '::after']) {
        for (const match of getComputedStyle(el, pseudo).backgroundImage.matchAll(/url\(["']?([^"')]+)["']?\)/g)) urls.add(match[1]);
      }
    }
    await Promise.all([...urls].map(url => new Promise((resolve, reject) => {
      const img = new Image(); img.onload = resolve; img.onerror = reject; img.src = url;
    })));
    await Promise.all([...document.images].map(img => img.decode()));
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  const inspect = () => page.evaluate(() => {
    const selectors = ['header', 'nav', '.footer', '.home-stack', '.home-session', '.home-session-art', '.home-session-details .btn', '.home-news-v04', '.home-news-controls', '.home-promo-v04', '.home-promo-v04 .promo'];
    const geometry = Object.fromEntries(selectors.map(selector => [selector, [...document.querySelectorAll(selector)].map(el => {
      const r = el.getBoundingClientRect();
      return [r.x, r.y, r.width, r.height];
    })]));
    const app = document.querySelector('.app');
    const decor = getComputedStyle(app, '::before');
    return { geometry, texts: document.querySelector('.app').innerText,
      decor: [decor.backgroundImage, decor.backgroundSize, decor.backgroundPosition, decor.top, decor.bottom],
      dots: document.querySelectorAll('.home-news-dots span').length };
  });
  const initial = await inspect();
  await page.screenshot({ path: folder + 'accueil-avant-simulation-1837x856.png' });
  const style = await readFile(folder + 'simulation.css', 'utf8');
  await page.addStyleTag({ content: style });
  // CSS backgrounds are not covered by document.fonts.ready: explicitly await PNGs.
  await page.evaluate(async () => {
    await Promise.all(['communication-officielle', 'battleground', 'dlc', 'communaute'].map(slug => new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = resolve;
      image.onerror = () => reject(new Error('Image indisponible : ' + slug));
      image.src = '/docs/reviews/home-illustrations/' + slug + '.png';
    })));
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  assert.deepEqual(await inspect(), initial, 'Géométrie, textes, décor et indicateurs doivent rester identiques.');
  await page.screenshot({ path: folder + 'accueil-simulation-1837x856.png' });
  const beforePNG = PNG.sync.read(await readFile(folder + 'accueil-avant-simulation-1837x856.png'));
  const afterPNG = PNG.sync.read(await readFile(folder + 'accueil-simulation-1837x856.png'));
  const changedRegions = [...initial.geometry['.home-news-v04'], ...initial.geometry['.home-promo-v04 .promo']];
  let checkedPixelsOutsidePanels = 0;
  for (let y = 0; y < afterPNG.height; y++) {
    for (let x = 0; x < afterPNG.width; x++) {
      if (changedRegions.some(([rx, ry, width, height]) => x >= Math.floor(rx) && x < Math.ceil(rx + width) && y >= Math.floor(ry) && y < Math.ceil(ry + height))) continue;
      const offset = (y * afterPNG.width + x) * 4;
      assert.ok(beforePNG.data.subarray(offset, offset + 4).equals(afterPNG.data.subarray(offset, offset + 4)), `Pixel modifié hors des panneaux : ${x}, ${y}`);
      checkedPixelsOutsidePanels++;
    }
  }
  await page.locator('.home-news-v04').screenshot({ path: folder + 'communication-simulation.png' });
  await page.locator('.home-promo-v04').screenshot({ path: folder + 'cartes-simulation.png' });
  const dlc = page.locator('.home-promo-v04 .promo').nth(1);
  await dlc.screenshot({ path: folder + 'dlc-compromis.png' });
  // Variante témoin : cover centré, seule la peinture du DLC change.
  const alternative = await page.addStyleTag({ content: `.app[data-bg="home"] .home-promo-v04 .promo:nth-child(2) { background-image: linear-gradient(0deg, #06090df5 0%, #06090d10 90%), url('/docs/reviews/home-illustrations/dlc.png'); background-size: auto, cover; background-position: 0 0, center; }` });
  await dlc.screenshot({ path: folder + 'dlc-cover-temoin.png' });
  await alternative.evaluate(el => el.remove());
  // Six communications : aller-retour complet avec les vrais boutons.
  const titles = [];
  for (let i = 0; i < 6; i++) {
    titles.push(await page.locator('.home-news-v04 h2').innerText());
    assert.equal(await page.locator('.home-news-dots span').count(), 6);
    assert.equal(await page.locator('.home-news-dots span.active').count(), 1);
    await page.locator('.home-news-controls button').last().click();
  }
  assert.equal(new Set(titles).size, 6);
  assert.equal(await page.locator('.home-news-v04 h2').innerText(), titles[0]);
  await page.locator('.home-news-controls button').first().click();
  assert.equal(await page.locator('.home-news-v04 h2').innerText(), titles[5]);
  await page.locator('.home-news-controls button').last().click();
  assert.deepEqual(await inspect(), initial);
  assert.deepEqual(failures, []);
  await writeFile(folder + 'simulation-verification.json', JSON.stringify({
    viewport: [1837, 856], geometryTextsDecorUnchanged: true,
    pixelsOutsideIllustrationPanelsUnchanged: true, checkedPixelsOutsidePanels,
    sixCommunicationsForwardAndBackward: true, titles, pageErrors: failures,
    geometry: initial.geometry,
    note: 'Styles injectés uniquement dans Chromium ; aucune intégration dans src/ ou assets/.',
  }, null, 2) + '\n');
  console.log('Capture complète, rapprochés et vérifications de géométrie/décor/textes/carrousel : OK.');
} finally {
  await browser.close();
}
