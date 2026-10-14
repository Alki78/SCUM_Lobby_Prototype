import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { assertHomeGeometry } from "./helpers/home-geometry.js";

const original = await readFile(
  "SCUM_Lobby_Prototype_Interactif_v0.4.3.html",
  "utf8",
);
const standalone = await readFile("dist/index.html", "utf8");
const selectors = [
  "header",
  ".logo",
  "nav button",
  ".profile",
  ".profile-avatar",
  ".profile-name b",
  ".footer",
  ".footer button",
  ".home-session",
  ".home-label",
  ".home-session-art",
  ".home-session-details h2",
  ".home-session-details p",
  ".home-meta",
  ".home-session-details .btn",
  ".home-news-v04",
  ".home-news-v04 h2",
  ".home-news-v04 p",
  ".home-news-controls .btn",
  ".home-news-dots span",
  ".promo",
  ".promo strong",
  ".promo small",
  ".promo span",
];

async function visualProperties(page) {
  return page.evaluate((selectors) => {
    const properties = [
      "fontFamily",
      "fontSize",
      "fontWeight",
      "lineHeight",
      "letterSpacing",
      "color",
      "backgroundColor",
      "borderColor",
      "boxShadow",
      "backgroundSize",
      "backgroundPosition",
    ];
    return Object.fromEntries(
      selectors.map((selector) => {
        const styles = getComputedStyle(document.querySelector(selector));
        return [
          selector,
          Object.fromEntries(properties.map((key) => [key, styles[key]])),
        ];
      }),
    );
  }, selectors);
}

for (const target of ["development", "standalone"]) {
  for (const viewport of [
    { width: 1837, height: 856 },
    { width: 1366, height: 768 },
    { width: 390, height: 844 },
  ]) {
    test(`Accueil ${target} à ${viewport.width} × ${viewport.height} : géométrie et styles conservés`, async ({
      browser,
    }) => {
      const context = await browser.newContext({
        viewport,
        offline: target === "standalone",
      });
      const page = await context.newPage();
      const reference = await context.newPage();
      const errors = [];
      const requests = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("request", (request) => requests.push(request.url()));
      try {
        await reference.setContent(original);
        if (target === "standalone") await page.setContent(standalone);
        else await page.goto("http://127.0.0.1:5173");
        await page.locator(".home-stack").waitFor();
        await assertHomeGeometry(page);
        expect(await visualProperties(page)).toEqual(
          await visualProperties(reference),
        );
        const titles = [];
        for (let i = 0; i < 6; i++) {
          titles.push(await page.locator(".home-news-v04 h2").textContent());
          await page.locator(".home-news-controls .btn").last().click();
          await assertHomeGeometry(page);
        }
        expect(new Set(titles).size).toBe(6);
        await expect(page.locator(".home-news-v04 h2")).toHaveText(titles[0]);
        await page.locator(".home-news-controls .btn").first().click();
        await expect(page.locator(".home-news-v04 h2")).toHaveText(titles[5]);
        await page.locator(".home-session-details .btn").click();
        await expect(page.locator(".dialog h2")).toHaveText(
          "MODE DÉMONSTRATION",
        );
        await page.getByRole("button", { name: "FERMER", exact: true }).click();
        await page
          .locator("nav")
          .getByRole("button", { name: "ACCUEIL", exact: true })
          .click();
        await page.locator(".promo").nth(2).click();
        await expect(page.locator(".dialog")).toContainText(
          "Espace communautaire",
        );
        await page.getByRole("button", { name: "FERMER", exact: true }).click();
        // Verify each home shortcut with a real click. Return through the
        // existing navigation API: other screens' mobile layout is out of scope.
        await page.locator(".home-news-controls .btn").nth(1).click();
        await expect(page.locator(".news .card")).toHaveCount(6);
        await page.evaluate(() => window.go("home"));
        await page.locator(".promo").first().click();
        await expect(page.locator("h1")).toHaveText("BATTLEGROUND");
        await page.evaluate(() => window.go("home"));
        await page.locator(".promo").nth(1).click();
        await expect(page.locator(".shop-v03")).toBeVisible();
        await page.evaluate(() => window.go("home"));
        await page.locator(".footer button").click();
        await expect(page.locator(".dialog")).toContainText("Quitter le jeu");
        await page.getByRole("button", { name: "FERMER", exact: true }).click();
        await page
          .locator("nav")
          .getByRole("button", { name: "CRÉDITS", exact: true })
          .click();
        await expect(page.locator(".credits")).toBeVisible();
        await page.keyboard.press("Escape");
        await assertHomeGeometry(page);
        expect(errors).toEqual([]);
        if (target === "standalone") expect(requests).toEqual([]);
      } finally {
        await context.close();
      }
    });
  }
}
