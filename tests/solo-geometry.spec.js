import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { assertSoloGeometry } from "./helpers/solo-geometry.js";

const original = await readFile(
  "SCUM_Lobby_Prototype_Interactif_v0.4.3.html",
  "utf8",
);
const standalone = await readFile("dist/index.html", "utf8");
async function palette(page, recomposed = false) {
  return page.evaluate((recomposed) => {
    const properties = [
      "fontFamily",
      "fontSize",
      "fontWeight",
      "lineHeight",
      "letterSpacing",
      "color",
      "backgroundColor",
      "backgroundImage",
      "backgroundSize",
      "backgroundPosition",
      "borderColor",
      "boxShadow",
    ];
    return [
      "h1",
      ".choice",
      ".choice span",
      ".solo-layout>.panel",
      ".solo-layout h2",
      ".illustration",
      ".solo-layout>.panel>.btn.big",
    ]
      .filter((selector) => !recomposed || selector !== ".illustration")
      .flatMap((selector) =>
        [...document.querySelectorAll(selector)].map((el) => {
          const style = getComputedStyle(el);
          return {
            selector,
            properties: Object.fromEntries(
              properties.map((key) => [
                key,
                style[key].replace(/url\([^)]*\)/g, "url(IMAGE)"),
              ]),
            ),
          };
        }),
      );
  }, recomposed);
}

for (const target of ["development", "standalone"]) {
  for (const viewport of [
    { width: 1837, height: 856 },
    { width: 1366, height: 768 },
    { width: 390, height: 844 },
  ]) {
    test(`SOLO ${target} ${viewport.width} × ${viewport.height} : géométrie stable et quatre parcours`, async ({
      browser,
    }) => {
      const context = await browser.newContext({
        viewport,
        offline: target === "standalone",
      });
      try {
        const page = await context.newPage();
        const reference = await context.newPage();
        const errors = [];
        const requests = [];
        page.on("pageerror", (e) => errors.push(e.message));
        page.on("request", (r) => requests.push(r.url()));
        await reference.setContent(original);
        // La référence utilise les anciens libellés comme identifiants.
        await reference
          .locator("nav")
          .getByRole("button", { name: "SOLO", exact: true })
          .dispatchEvent("click");
        if (target === "standalone") await page.setContent(standalone);
        else await page.goto("http://127.0.0.1:5173");
        await page.locator(".home-stack").waitFor();
        await page
          .locator("nav")
          .getByRole("button", { name: "SOLO", exact: true })
          .click();
        const initial = await assertSoloGeometry(page);
        async function select(index) {
          // Vrais clics, y compris retour à Continuer après défilement mobile.
          await page.locator(".choice").nth(index).click();
          // La référence monolithique garde son état dans une constante
          // lexicale, sans window.state. Déclencher son bouton existant.
          await reference.locator(".choice").nth(index).dispatchEvent("click");
          const layout = await assertSoloGeometry(page);
          expect(layout.choices).toEqual(initial.choices);
          if (viewport.width > 700) expect(layout.panel).toEqual(initial.panel);
          // Sauvegardes et Nouvelle partie ont leurs captures approuvées propres.
          expect(await palette(page, index === 1 || index === 2)).toEqual(
            await palette(reference, index === 1 || index === 2),
          );
        }
        async function dialog(button, content) {
          await page.getByRole("button", { name: button, exact: true }).click();
          await expect(page.locator(".dialog")).toContainText(content);
          await page
            .getByRole("button", { name: "FERMER", exact: true })
            .click();
        }
        await select(0);
        await dialog("▶ CONTINUER LA PARTIE", "Chargement de la partie solo");
        await select(1);
        await page
          .getByRole("button", { name: "Prisonnier 02", exact: true })
          .click();
        await expect(page.locator(".solo-save-name")).toHaveText(
          "Prisonnier 02",
        );
        await page
          .getByRole("button", { name: "✕", exact: true })
          .nth(1)
          .click();
        await expect(page.locator(".dialog")).toContainText("Prisonnier 02");
        await page
          .getByRole("button", { name: "ANNULER", exact: true })
          .click();
        await page
          .getByRole("button", { name: "✕", exact: true })
          .nth(1)
          .click();
        await page
          .getByRole("button", { name: "SIMULER LA SUPPRESSION", exact: true })
          .click();
        await expect(page.locator(".dialog")).toContainText(
          "Suppression simulée",
        );
        await page.getByRole("button", { name: "FERMER", exact: true }).click();
        await expect(
          page
            .locator(".solo-detail")
            .getByRole("button", { name: "✕", exact: true }),
        ).toHaveCount(3);
        await dialog("CHARGER CETTE SAUVEGARDE", "Chargement de la sauvegarde");
        await select(2);
        await dialog("CRÉER UN PERSONNAGE", "Création de personnage");
        await select(3);
        await dialog("LANCER LE TUTORIEL", "Tutoriel — lancement simulé");
        await select(0);
        expect(errors).toEqual([]);
        if (target === "standalone") expect(requests).toEqual([]);
      } finally {
        await context.close();
      }
    });
  }
}
