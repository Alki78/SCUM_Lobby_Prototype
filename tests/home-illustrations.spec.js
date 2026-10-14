import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { PNG } from "pngjs";
import { assertHomeGeometry } from "./helpers/home-geometry.js";

function expectSamePixels(actual, expected, avatar) {
  const left = Math.floor(avatar.x);
  const top = Math.floor(avatar.y);
  const right = Math.ceil(avatar.x + avatar.width);
  const bottom = Math.ceil(avatar.y + avatar.height);
  expect([actual.width, actual.height]).toEqual([
    expected.width,
    expected.height,
  ]);
  let roundedBorderVariations = 0;
  for (let y = 0; y < actual.height; y++) {
    for (let x = 0; x < actual.width; x++) {
      const offset = (y * actual.width + x) * 4;
      if (
        actual.data
          .subarray(offset, offset + 4)
          .equals(expected.data.subarray(offset, offset + 4))
      )
        continue;
      // Chromium varie parfois deux niveaux RGB sur les bords arrondis de l’avatar.
      // Aucun écart n’est accepté sur les illustrations ou ailleurs dans l’UI.
      const insideAvatar = x >= left && x < right && y >= top && y < bottom;
      const onBorder =
        x < left + 3 || x >= right - 3 || y < top + 3 || y >= bottom - 3;
      expect(
        insideAvatar && onBorder,
        `Pixel différent hors bord d’avatar : ${x}, ${y}`,
      ).toBe(true);
      for (let channel = 0; channel < 4; channel++)
        expect(
          Math.abs(
            actual.data[offset + channel] - expected.data[offset + channel],
          ),
        ).toBeLessThanOrEqual(2);
      roundedBorderVariations++;
    }
  }
  expect(roundedBorderVariations).toBeLessThanOrEqual(64);
}

async function ready(page) {
  await page.locator(".home-stack").waitFor();
  await page.evaluate(async () => {
    await document.fonts.ready;
    const urls = new Set();
    for (const el of document.querySelectorAll("*")) {
      for (const pseudo of [null, "::before", "::after"]) {
        for (const match of getComputedStyle(
          el,
          pseudo,
        ).backgroundImage.matchAll(/url\(["']?([^"')]+)["']?\)/g))
          urls.add(match[1]);
      }
    }
    await Promise.all(
      [...urls].map(
        (url) =>
          new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = reject;
            img.src = url;
          }),
      ),
    );
    await Promise.all([...document.images].map((img) => img.decode()));
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
  });
}

test("les quatre PNG intégrés sont identiques aux découpes validées", async () => {
  for (const slug of [
    "communication-officielle",
    "battleground",
    "dlc",
    "communaute",
  ]) {
    expect(
      (await readFile(`assets/images/home-${slug}.png`)).equals(
        await readFile(`docs/reviews/home-illustrations/${slug}.png`),
      ),
    ).toBe(true);
  }
});

for (const viewport of [
  { width: 1837, height: 856 },
  { width: 1366, height: 768 },
  { width: 390, height: 844 },
]) {
  test(`illustrations ${viewport.width} × ${viewport.height} : rendu intégré et export hors ligne`, async ({
    browser,
  }, testInfo) => {
    const online = await browser.newContext({ viewport });
    const offline = await browser.newContext({ viewport, offline: true });
    try {
      const development = await online.newPage();
      const standalone = await offline.newPage();
      const failures = [];
      const requests = [];
      for (const page of [development, standalone])
        page.on("pageerror", (error) => failures.push(error.message));
      standalone.on("request", (request) => requests.push(request.url()));
      await development.goto("http://127.0.0.1:5173");
      await standalone.setContent(await readFile("dist/index.html", "utf8"));
      const captures = [];
      for (const page of [development, standalone]) {
        await ready(page);
        await assertHomeGeometry(page);
        const screenshot = await page.screenshot();
        captures.push(PNG.sync.read(screenshot));
        await testInfo.attach(
          page === development ? "development" : "offline",
          { body: screenshot, contentType: "image/png" },
        );
      }
      const avatar = await development.locator(".profile-avatar").boundingBox();
      expectSamePixels(captures[0], captures[1], avatar);
      if (viewport.width === 1837) {
        const approved = PNG.sync.read(
          await readFile(
            "docs/reviews/home-illustrations/accueil-simulation-1837x856.png",
          ),
        );
        expectSamePixels(captures[0], approved, avatar);
      }
      expect(requests).toEqual([]);
      expect(failures).toEqual([]);
    } finally {
      await online.close();
      await offline.close();
    }
  });
}
