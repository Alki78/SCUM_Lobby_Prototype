import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { assertHomeGeometry } from "./helpers/home-geometry.js";

const before = JSON.parse(
  await readFile("docs/reviews/home-icons/before-layout.json", "utf8"),
);
const standalone = await readFile("dist/index.html", "utf8");
for (const target of ["development", "standalone"]) {
  for (const baseline of before) {
    const [width, height] = baseline.viewport;
    test(`SVG Accueil ${target} ${width} × ${height} : emplacements conservés et export autonome`, async ({
      browser,
    }) => {
      const context = await browser.newContext({
        viewport: { width, height },
        offline: target === "standalone",
      });
      try {
        const page = await context.newPage();
        const failures = [];
        const requests = [];
        page.on("pageerror", (e) => failures.push(e.message));
        page.on("request", (r) => requests.push(r.url()));
        if (target === "standalone") await page.setContent(standalone);
        else await page.goto("http://127.0.0.1:5173");
        await page.locator(".home-stack").waitFor();
        await assertHomeGeometry(page);
        for (const selector of new Set(
          baseline.items.map((item) => item.selector),
        )) {
          const expected = baseline.items.filter(
            (item) => item.selector === selector,
          );
          const actual = await page.locator(selector).evaluateAll((elements) =>
            elements.map((el) => {
              const r = el.getBoundingClientRect();
              return [r.x, r.y, r.width, r.height];
            }),
          );
          expect(actual).toEqual(expected.map((item) => item.rect));
        }
        const icons = page.locator(".home-icon");
        await expect(icons).toHaveCount(8);
        expect(
          await icons.evaluateAll((elements) =>
            elements.every(
              (el) =>
                el.tagName === "svg" &&
                el.getAttribute("aria-hidden") === "true" &&
                el.getAttribute("focusable") === "false" &&
                !el.querySelector("use,image"),
            ),
          ),
        ).toBe(true);
        expect(
          await page
            .locator(".home-icon--play")
            .evaluate((el) => getComputedStyle(el).fill),
        ).toBe("rgb(255, 255, 255)");
        await expect(page.locator(".home-meta").nth(0)).toHaveText(
          "ÎLE DE SCUM",
        );
        await expect(page.locator(".home-meta").nth(1)).toHaveText(
          "42 / 64 JOUEURS",
        );
        await expect(page.locator(".home-meta").nth(2)).toHaveText(
          "18 sept. 2024 · 3 h 27 min",
        );
        await expect(
          page.getByRole("button", { name: "CONTINUER", exact: true }),
        ).toBeVisible();
        await expect(
          page.getByRole("button", { name: "VOIR LES DÉTAILS", exact: true }),
        ).toBeVisible();
        await expect(page.locator(".home-news-dots span")).toHaveCount(6);
        await page.locator(".home-news-controls .btn").last().click();
        await expect(icons).toHaveCount(8);
        await page.evaluate(() => window.go("solo"));
        await expect(page.locator(".home-icon")).toHaveCount(0);
        await expect(
          page.getByRole("button", {
            name: "▶ CONTINUER LA PARTIE",
            exact: true,
          }),
        ).toBeVisible();
        await expect(page.locator(".profile-platform svg")).toHaveCount(1);
        await expect(page.locator(".profile-sync svg")).toHaveCount(1);
        expect(failures).toEqual([]);
        if (target === "standalone") expect(requests).toEqual([]);
      } finally {
        await context.close();
      }
    });
  }
}
