import { test, expect } from "@playwright/test";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { PNG } from "pngjs";
import { assertSoloGeometry } from "./helpers/solo-geometry.js";

const folder = "docs/reviews/solo-illustrations-integration/";
const approvedLayouts = JSON.parse(
  await readFile(folder + "approved-layout.json", "utf8"),
);
const standalone = await readFile("dist/index.html", "utf8");

async function ready(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    const urls = new Set();
    for (const el of document.querySelectorAll("*")) {
      for (const pseudo of [null, "::before", "::after"]) {
        for (const m of getComputedStyle(el, pseudo).backgroundImage.matchAll(
          /url\(["']?([^"')]+)["']?\)/g,
        ))
          urls.add(m[1]);
      }
    }
    await Promise.all(
      [...urls].map(
        (url) =>
          new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = resolve;
            image.onerror = () => reject(new Error(url));
            image.src = url;
          }),
      ),
    );
    await Promise.all([...document.images].map((image) => image.decode()));
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
  });
}

async function layout(page) {
  return page.evaluate(() => {
    const selectors = [
      "header",
      "nav",
      ".profile",
      ".footer",
      "h1",
      ".solo-layout",
      ".solo-choices",
      ".choice",
      ".solo-detail",
      ".solo-detail > *",
    ];
    const rects = selectors.flatMap((selector) =>
      [...document.querySelectorAll(selector)].map((el, index) => {
        const r = el.getBoundingClientRect();
        return {
          selector,
          index,
          x: r.x,
          y: r.y + scrollY,
          width: r.width,
          height: r.height,
        };
      }),
    );
    return {
      text: document.querySelector(".app").innerText,
      rects,
      overflow: document.documentElement.scrollWidth > innerWidth,
    };
  });
}

function samePixels(actual, expected, avatar) {
  const a = PNG.sync.read(actual),
    b = PNG.sync.read(expected);
  expect([a.width, a.height]).toEqual([b.width, b.height]);
  let borderVariations = 0,
    otherVariations = 0,
    maxBorderDelta = 0;
  const l = Math.floor(avatar.x),
    t = Math.floor(avatar.y);
  const r = Math.ceil(avatar.x + avatar.width),
    bottom = Math.ceil(avatar.y + avatar.height);
  for (let y = 0; y < a.height; y++)
    for (let x = 0; x < a.width; x++) {
      const offset = (y * a.width + x) * 4;
      if (
        a.data
          .subarray(offset, offset + 4)
          .equals(b.data.subarray(offset, offset + 4))
      )
        continue;
      // Même tolérance que les tests Accueil : arrondi du bord d'avatar Chromium.
      if (
        x >= l &&
        x < r &&
        y >= t &&
        y < bottom &&
        (x < l + 3 || x >= r - 3 || y < t + 3 || y >= bottom - 3)
      ) {
        borderVariations++;
        for (let c = 0; c < 4; c++)
          maxBorderDelta = Math.max(
            maxBorderDelta,
            Math.abs(a.data[offset + c] - b.data[offset + c]),
          );
      } else otherVariations++;
    }
  expect(
    otherVariations,
    "Pixels différents hors bord de l’avatar du profil",
  ).toBe(0);
  expect(borderVariations).toBeLessThanOrEqual(64);
  expect(maxBorderDelta).toBeLessThanOrEqual(2);
}

test("SOLO : les trois PNG et leurs dimensions correspondent aux découpes approuvées", async () => {
  const crops = JSON.parse(
    await readFile(folder + "approved-crops.json", "utf8"),
  );
  for (const crop of crops.crops) {
    const bytes = await readFile(`assets/images/solo-${crop.file}`);
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(crop.sha256);
    const png = PNG.sync.read(bytes);
    expect([png.width, png.height]).toEqual(crop.dimensions);
  }
});

for (const reference of approvedLayouts) {
  const [width, height] = reference.viewport;
  test(`SOLO illustrations ${width} × ${height} : simulation approuvée et export hors ligne`, async ({
    browser,
  }, testInfo) => {
    const contexts = [];
    const captures = [];
    try {
      for (const target of ["development", "offline"]) {
        const context = await browser.newContext({
          viewport: { width, height },
          offline: target === "offline",
        });
        contexts.push(context);
        const page = await context.newPage();
        const errors = [],
          requests = [];
        page.on("pageerror", (error) => errors.push(error.message));
        page.on("request", (request) => requests.push(request.url()));
        if (target === "offline") await page.setContent(standalone);
        else await page.goto("http://127.0.0.1:5173");
        await page.locator(".home-stack").waitFor();
        const homeBackground = await page
          .locator(".app")
          .evaluate((el) => getComputedStyle(el, "::before").backgroundImage);
        await page
          .locator("nav")
          .getByRole("button", { name: "SOLO", exact: true })
          .click();
        await ready(page);
        expect(
          await page
            .locator(".app")
            .evaluate((el) => getComputedStyle(el, "::before").backgroundImage),
        ).toBe(homeBackground);
        await page.evaluate(() => scrollTo(0, 0));
        const screenshot = await page.screenshot();
        const avatar = await page.locator(".profile-avatar").boundingBox();
        samePixels(
          screenshot,
          await readFile(folder + `approved-${width}x${height}.png`),
          avatar,
        );
        captures.push(screenshot);
        await testInfo.attach(target, {
          body: screenshot,
          contentType: "image/png",
        });
        if (process.env.SCUM_CAPTURE_DIR) {
          await mkdir(process.env.SCUM_CAPTURE_DIR, { recursive: true });
          await writeFile(
            `${process.env.SCUM_CAPTURE_DIR}/${target}-${width}x${height}.png`,
            screenshot,
          );
        }
        for (let i = 0; i < 4; i++) {
          await page.locator(".choice").nth(i).click();
          await assertSoloGeometry(page);
          const currentLayout = await layout(page);
          if (i === 1 || i === 2) {
            // Sauvegardes et Nouvelle partie ont leurs captures approuvées propres.
            // Les cadres et cartes restent comparés à la géométrie de PR #9.
            const outer = (value) =>
              value.rects.filter((r) => r.selector !== ".solo-detail > *");
            expect(outer(currentLayout)).toEqual(outer(reference.states[i]));
            expect(currentLayout.overflow).toBe(reference.states[i].overflow);
          } else expect(currentLayout).toEqual(reference.states[i]);
          await expect(page.locator(".choice.active")).toHaveCount(1);
          expect(
            await page
              .locator(".choice.active")
              .evaluate((el) => getComputedStyle(el).backgroundColor),
          ).toBe("rgba(76, 25, 23, 0.863)");
          const backgrounds = await page
            .locator(".choice")
            .evaluateAll((elements) =>
              elements.map(
                (el) => getComputedStyle(el, "::before").backgroundImage,
              ),
            );
          for (const background of backgrounds)
            expect(background).toContain("url(");
        }
        await page.locator(".choice").first().click();
        if (width === 390 && process.env.SCUM_CAPTURE_DIR) {
          await page
            .locator(".solo-detail > .btn.big")
            .scrollIntoViewIfNeeded();
          await page.screenshot({
            path: `${process.env.SCUM_CAPTURE_DIR}/${target}-detail-390x844.png`,
          });
        }
        expect(errors).toEqual([]);
        if (target === "offline") expect(requests).toEqual([]);
      }
      // Le rendu final exporté doit aussi égaler celui servi par Vite.
      const page = contexts[0].pages()[0];
      await page.evaluate(() => scrollTo(0, 0));
      samePixels(
        captures[1],
        captures[0],
        await page.locator(".profile-avatar").boundingBox(),
      );
    } finally {
      for (const context of contexts) await context.close();
    }
  });
}
