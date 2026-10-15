import { test, expect } from "@playwright/test";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { PNG } from "pngjs";
import { assertSoloGeometry } from "./helpers/solo-geometry.js";

const folder = "docs/reviews/solo-saves-integration/";
const approved = JSON.parse(
  await readFile(folder + "approved-verification.json", "utf8"),
);
const standalone = await readFile("dist/index.html", "utf8");

async function ready(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    const urls = new Set();
    for (const el of document.querySelectorAll("*"))
      for (const pseudo of [null, "::before", "::after"]) {
        for (const m of getComputedStyle(el, pseudo).backgroundImage.matchAll(
          /url\(["']?([^"')]+)["']?\)/g,
        ))
          urls.add(m[1]);
      }
    await Promise.all(
      [...urls].map(
        (url) =>
          new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = resolve;
            image.onerror = reject;
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

function samePixels(actual, expected) {
  const a = PNG.sync.read(actual),
    b = PNG.sync.read(expected);
  expect([a.width, a.height]).toEqual([b.width, b.height]);
  expect(
    a.data.equals(b.data),
    "Rendu identique à la simulation approuvée",
  ).toBe(true);
}

for (const reference of approved) {
  const [width, height] = reference.viewport;
  test(`SOLO Sauvegardes ${width} × ${height} : composition validée, interactions et export hors ligne`, async ({
    browser,
  }, testInfo) => {
    for (const target of ["development", "offline"]) {
      const context = await browser.newContext({
        viewport: { width, height },
        offline: target === "offline",
      });
      try {
        const page = await context.newPage(),
          errors = [],
          requests = [];
        page.on("pageerror", (e) => errors.push(e.message));
        page.on("request", (r) => requests.push(r.url()));
        if (target === "offline") await page.setContent(standalone);
        else await page.goto("http://127.0.0.1:5173");
        await page.locator(".home-stack").waitFor();
        await page
          .locator("nav")
          .getByRole("button", { name: "SOLO", exact: true })
          .click();
        await ready(page);
        const continueImage = await page.screenshot();
        const continueButton = await page
          .locator(".solo-detail > .btn.big")
          .boundingBox();
        await page.locator('[data-solo-action="load"]').click();
        const panel = page.locator(".solo-detail");
        for (const [index, name, slug] of [
          [0, "Alki", "alki"],
          [1, "Prisonnier 02", "prisonnier-02"],
          [2, "Survivante 03", "survivante-03"],
        ]) {
          await page.getByRole("button", { name, exact: true }).click();
          await ready(page);
          await page.evaluate(() => scrollTo(0, 0));
          const geometry = await assertSoloGeometry(page);
          for (const key of ["x", "y", "width", "height"])
            expect(geometry.panel[key]).toBe(reference.before.panel[key]);
          expect(geometry.button.width).toBe(continueButton.width);
          expect(geometry.button.x).toBe(continueButton.x);
          expect(geometry.button.bottom).toBeLessThanOrEqual(
            geometry.panel.bottom - geometry.padding,
          );
          await expect(panel.locator(".illustration, img")).toHaveCount(0);
          await expect(panel.locator(".solo-save-list > .row")).toHaveCount(3);
          await expect(
            panel.locator(".is-selected > button:first-child"),
          ).toHaveText(name);
          await expect(panel.locator(".solo-save-name")).toHaveText(name);
          await expect(panel.locator(".solo-save-meta b")).toHaveText(
            index === 0
              ? ["24 h 12 min", "Secteur A3"]
              : ["Non renseigné", "Non renseigné"],
          );
          const metrics = await panel.evaluate((el) => {
            const list = el.querySelector(".solo-save-list");
            return {
              panel: [el.scrollHeight, el.clientHeight],
              list: [list.scrollHeight, list.clientHeight],
              rowHeights: [...list.children].map(
                (row) => row.getBoundingClientRect().height,
              ),
            };
          });
          expect(metrics.panel[0]).toBe(metrics.panel[1]);
          expect(metrics.list[0]).toBe(metrics.list[1]);
          expect(metrics.rowHeights).toEqual([52, 52, 52]);
          if (index < 2) {
            const screenshot = await page.screenshot();
            samePixels(
              screenshot,
              await readFile(
                folder + `approved-${slug}-${width}x${height}.png`,
              ),
            );
            await testInfo.attach(`${target}-${slug}`, {
              body: screenshot,
              contentType: "image/png",
            });
            if (process.env.SCUM_SAVES_CAPTURE_DIR) {
              await mkdir(process.env.SCUM_SAVES_CAPTURE_DIR, {
                recursive: true,
              });
              await writeFile(
                `${process.env.SCUM_SAVES_CAPTURE_DIR}/${target}-${slug}-${width}x${height}.png`,
                screenshot,
              );
            }
            if (width === 390) {
              await page.evaluate(() =>
                scrollTo(
                  0,
                  document.documentElement.scrollHeight - innerHeight,
                ),
              );
              const detail = await page.screenshot();
              samePixels(
                detail,
                await readFile(folder + `approved-${slug}-detail-390x844.png`),
              );
              const b = await panel.locator(".btn.big").boundingBox();
              const footer = await page.locator(".footer").boundingBox();
              expect(b.y + b.height).toBeLessThanOrEqual(footer.y);
              if (process.env.SCUM_SAVES_CAPTURE_DIR)
                await writeFile(
                  `${process.env.SCUM_SAVES_CAPTURE_DIR}/${target}-${slug}-detail-390x844.png`,
                  detail,
                );
            }
          }
        }
        await page
          .getByRole("button", { name: "Prisonnier 02", exact: true })
          .click();
        await page
          .getByRole("button", {
            name: "CHARGER CETTE SAUVEGARDE",
            exact: true,
          })
          .click();
        await expect(page.locator(".dialog")).toContainText(
          "Chargement de la sauvegarde",
        );
        await page.getByRole("button", { name: "FERMER", exact: true }).click();
        const deletes = () =>
          panel.getByRole("button", { name: "✕", exact: true });
        await deletes().nth(2).click();
        await expect(page.locator(".dialog")).toContainText("Survivante 03");
        await page
          .getByRole("button", { name: "ANNULER", exact: true })
          .click();
        await expect(deletes()).toHaveCount(3);
        await expect(panel.locator(".solo-save-name")).toHaveText(
          "Prisonnier 02",
        );
        await deletes().nth(2).click();
        await page
          .getByRole("button", { name: "SIMULER LA SUPPRESSION", exact: true })
          .click();
        await expect(page.locator(".dialog")).toContainText(
          "Suppression simulée",
        );
        await page.getByRole("button", { name: "FERMER", exact: true }).click();
        await expect(deletes()).toHaveCount(3);
        await expect(panel.locator(".solo-save-name")).toHaveText(
          "Prisonnier 02",
        );
        await page.locator('[data-solo-action="continue"]').click();
        await ready(page);
        await page.evaluate(() => scrollTo(0, 0));
        expect(await page.locator(".solo-detail h3").textContent()).toBe(
          "Alki",
        );
        samePixels(await page.screenshot(), continueImage);
        expect(errors).toEqual([]);
        if (target === "offline") expect(requests).toEqual([]);
      } finally {
        await context.close();
      }
    }
  });
}
