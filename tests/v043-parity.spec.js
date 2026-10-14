import { test, expect } from "@playwright/test";
import { readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { PNG } from "pngjs";

const original = await readFile(
  "SCUM_Lobby_Prototype_Interactif_v0.4.3.html",
  "utf8",
);
const standalone = await readFile("dist/index.html", "utf8");

async function openPair(browser, target, viewport) {
  const referenceContext = await browser.newContext({
    viewport,
    offline: true,
  });
  const candidateContext = await browser.newContext({
    viewport,
    offline: target === "standalone",
  });
  const reference = await referenceContext.newPage();
  const candidate = await candidateContext.newPage();
  const errors = [];
  const requests = [];
  candidate.on("pageerror", (error) => errors.push(error.message));
  candidate.on("request", (request) => requests.push(request.url()));
  await reference.setContent(original);
  if (target === "standalone") await candidate.setContent(standalone);
  else await candidate.goto("http://127.0.0.1:5173");
  await candidate.locator("nav").waitFor();
  return {
    reference,
    candidate,
    errors,
    requests,
    close: async () => {
      await referenceContext.close();
      await candidateContext.close();
    },
  };
}

async function visibleState(page) {
  return page.evaluate(() => ({
    text: document.querySelector("#app").innerText,
    fields: [...document.querySelectorAll("input,select")].map((element) => ({
      tag: element.tagName,
      value: element.value,
      checked: element.checked ?? null,
      disabled: element.disabled,
    })),
    buttons: [...document.querySelectorAll("button")].map((element) => ({
      text: element.textContent,
      disabled: element.disabled,
      active: element.classList.contains("active"),
    })),
  }));
}

async function sameBehavior(pair) {
  expect(await visibleState(pair.candidate)).toEqual(
    await visibleState(pair.reference),
  );
  expect(pair.errors).toEqual([]);
}

async function act(pair, action) {
  await action(pair.reference);
  await action(pair.candidate);
  await sameBehavior(pair);
}

async function clickForComparison(page, locator) {
  // The original mobile profile overlays some controls. Dispatch the same
  // event to reach each screen for visual comparison, without fixing that UI.
  // All desktop interaction tests below use real pointer clicks.
  if (page.viewportSize().width < 781) await locator.dispatchEvent("click");
  else await locator.click();
}
const nav = (label) => (page) =>
  clickForComparison(
    page,
    page.locator("nav").getByRole("button", { name: label, exact: true }),
  );
const button = (label) => (page) =>
  clickForComparison(
    page,
    page.getByRole("button", { name: label, exact: true }),
  );
const side = (label) => (page) =>
  clickForComparison(
    page,
    page.locator(".side").getByRole("button", { name: label, exact: true }),
  );

async function samePixels(pair, label, testInfo) {
  await sameBehavior(pair);
  const options = { animations: "disabled" };
  const expected = await pair.reference.screenshot(options);
  const actual = await pair.candidate.screenshot(options);
  const before = PNG.sync.read(expected);
  const after = PNG.sync.read(actual);
  const equal =
    before.width === after.width &&
    before.height === after.height &&
    before.data.equals(after.data);
  if (!equal) {
    await testInfo.attach(`${label}-reference`, {
      body: expected,
      contentType: "image/png",
    });
    await testInfo.attach(`${label}-reconstruction`, {
      body: actual,
      contentType: "image/png",
    });
  }
  expect(equal, `Rendu différent de V0.4.3 : ${label}`).toBe(true);
}

for (const target of ["development", "standalone"]) {
  for (const viewport of [
    { width: 1837, height: 856 },
    { width: 1366, height: 768 },
    { width: 1024, height: 600 },
    { width: 390, height: 844 },
  ]) {
    test(`${target} : rendu V0.4.3 à ${viewport.width} × ${viewport.height}`, async ({
      browser,
    }, testInfo) => {
      const pair = await openPair(browser, target, viewport);
      try {
        for (const label of [
          "ACCUEIL",
          "SOLO",
          "MULTIJOUEUR",
          "OPTIONS",
          "DLC / SHOP",
          "INFOS",
          "CRÉDITS",
        ]) {
          await act(pair, nav(label));
          await samePixels(pair, label, testInfo);
        }
        await act(pair, (page) => page.keyboard.press("Escape"));
        await act(pair, nav("SOLO"));
        for (let i = 0; i < 4; i++) {
          await act(pair, (page) =>
            clickForComparison(page, page.locator(".choice").nth(i)),
          );
          await samePixels(pair, `solo-${i}`, testInfo);
        }
        await act(pair, nav("MULTIJOUEUR"));
        for (const label of [
          "SERVEURS PUBLICS",
          "BATTLEGROUND",
          "CONNEXION DIRECTE",
          "LOUER UN SERVEUR",
        ]) {
          await act(pair, side(label));
          await samePixels(pair, label, testInfo);
        }
        await act(pair, nav("OPTIONS"));
        for (const label of [
          "JEU",
          "VIDÉO",
          "GRAPHISMES",
          "SON",
          "SOURIS",
          "CONTRÔLES",
        ]) {
          await act(pair, side(label));
          await samePixels(pair, label, testInfo);
        }
        await act(pair, nav("INFOS"));
        for (const label of ["TOUT", "ACTUALITÉS", "PATCH NOTES", "HOTFIX"]) {
          await act(pair, button(label));
          await samePixels(pair, label, testInfo);
        }
        if (target === "standalone") expect(pair.requests).toEqual([]);
      } finally {
        await pair.close();
      }
    });
  }

  test(`${target} : parcours et interactions identiques`, async ({
    browser,
  }) => {
    const pair = await openPair(browser, target, { width: 1366, height: 768 });
    try {
      await act(pair, button("▶ CONTINUER"));
      await act(pair, button("FERMER"));
      for (let i = 0; i < 7; i++) await act(pair, button("→"));
      await act(pair, button("←"));
      await act(pair, button("VOIR LES DÉTAILS ↗"));
      await act(pair, (page) => page.locator(".news .card").first().click());
      await act(pair, button("FERMER"));
      await act(pair, nav("ACCUEIL"));
      await act(pair, (page) => page.locator(".promo").nth(2).click());
      await act(pair, button("FERMER"));
      await act(pair, (page) => page.locator(".promo").first().click());
      await act(pair, button("▶ REJOINDRE BATTLEGROUND"));
      await act(pair, button("ANNULER LA RECHERCHE"));
      await act(pair, button("▶ REJOINDRE BATTLEGROUND"));
      await act(pair, button("SIMULER UNE PARTIE TROUVÉE"));
      await act(pair, button("RETOUR AU LOBBY"));
      await act(pair, side("SERVEURS PUBLICS"));
      await act(pair, (page) => page.locator("tbody .star").first().click());
      await act(pair, button("FAVORIS"));
      await act(pair, button("OFFICIELS"));
      await act(pair, (page) => page.locator("tbody tr").first().click());
      await act(pair, (page) =>
        page.locator(".server-controls input").fill("SCUM EU"),
      );
      await act(pair, (page) =>
        page.locator(".server-controls input").fill(""),
      );
      await act(pair, (page) =>
        page.locator(".filters select").first().selectOption("FR"),
      );
      await act(pair, (page) =>
        page.locator(".filters input[type=checkbox]").first().check(),
      );
      await act(pair, button("⟳ RAFRAÎCHIR"));
      await act(pair, button("FERMER"));
      await act(pair, side("CONNEXION DIRECTE"));
      await act(pair, (page) => page.locator("input").fill("invalid"));
      await act(pair, button("VÉRIFIER"));
      await act(pair, (page) =>
        page.locator("input").fill("123.45.67.89:7777"),
      );
      await act(pair, (page) => page.locator("input").press("Enter"));
      await act(pair, (page) => page.locator(".detail .star").click());
      await act(pair, button("▶ REJOINDRE LE SERVEUR"));
      await act(pair, button("FERMER"));
      await act(pair, side("LOUER UN SERVEUR"));
      await act(pair, (page) => page.locator(".provider").first().click());
      await act(pair, button("FERMER"));
      await act(pair, nav("SOLO"));
      await act(pair, (page) => page.locator(".choice").nth(1).click());
      await act(pair, button("Prisonnier 02"));
      await act(pair, (page) =>
        page.getByRole("button", { name: "✕", exact: true }).nth(1).click(),
      );
      await act(pair, button("SIMULER LA SUPPRESSION"));
      await act(pair, button("FERMER"));
      await act(pair, button("CHARGER CETTE SAUVEGARDE"));
      await act(pair, button("FERMER"));
      await act(pair, (page) => page.locator(".choice").nth(2).click());
      await act(pair, button("CRÉER UN PERSONNAGE"));
      await act(pair, button("FERMER"));
      await act(pair, (page) => page.locator(".choice").nth(3).click());
      await act(pair, button("LANCER LE TUTORIEL"));
      await act(pair, button("FERMER"));
      await act(pair, nav("OPTIONS"));
      await act(pair, (page) =>
        page.locator(".setting select").first().selectOption("Français"),
      );
      await act(pair, nav("ACCUEIL"));
      await act(pair, button("ANNULER"));
      await act(pair, nav("ACCUEIL"));
      await act(pair, button("IGNORER"));
      await act(pair, nav("OPTIONS"));
      await act(pair, (page) =>
        page.locator(".setting select").first().selectOption("English"),
      );
      await act(pair, nav("SOLO"));
      await act(pair, button("APPLIQUER"));
      await act(pair, nav("OPTIONS"));
      await act(pair, (page) =>
        page.locator(".layout input.input").fill("sensibilité"),
      );
      await act(pair, (page) => page.locator(".layout input.input").fill(""));
      await act(pair, button("RÉINITIALISER LA CATÉGORIE"));
      await act(pair, button("RÉINITIALISER"));
      await act(pair, button("✓ APPLIQUER"));
      await act(pair, button("TOUT RÉINITIALISER"));
      await act(pair, button("ANNULER"));
      await act(pair, nav("DLC / SHOP"));
      await act(pair, (page) => page.locator(".shop-arrow.right").click());
      await act(pair, (page) =>
        page.locator(".shop-dots button").nth(3).click(),
      );
      await act(pair, (page) => page.locator(".shop-card").nth(2).click());
      await act(pair, (page) => page.locator(".shop-card").nth(1).focus());
      await act(pair, (page) => page.keyboard.press("Enter"));
      await act(pair, (page) =>
        page.locator(".shop-card .shop-steam").first().click(),
      );
      await act(pair, button("FERMER"));
      await act(pair, nav("CRÉDITS"));
      await act(pair, (page) => page.keyboard.press("Space"));
      await act(pair, nav("CRÉDITS"));
      await act(pair, (page) => page.locator(".credits").click());
      await act(pair, (page) => page.locator(".footer button").click());
      await act(pair, button("FERMER"));
      if (target === "standalone") expect(pair.requests).toEqual([]);
    } finally {
      await pair.close();
    }
  });
}

test("ressources originales et export autonome", async () => {
  const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
  const originalHashes = new Set(
    [...original.matchAll(/data:image\/[\w+]+;base64,([A-Za-z0-9+/=]+)/g)].map(
      (match) => hash(Buffer.from(match[1], "base64")),
    ),
  );
  const manifest = JSON.parse(
    await readFile("assets/images/manifest.json", "utf8"),
  );
  expect(manifest).toHaveLength(originalHashes.size);
  for (const asset of manifest) {
    const actualHash = hash(await readFile(`assets/images/${asset.file}`));
    expect(actualHash).toBe(asset.sha256);
    expect(originalHashes.has(actualHash)).toBe(true);
  }
  const builtHashes = new Set(
    [
      ...standalone.matchAll(/data:image\/[\w+]+;base64,([A-Za-z0-9+/=]+)/g),
    ].map((match) => hash(Buffer.from(match[1], "base64"))),
  );
  expect([...builtHashes].sort()).toEqual([...originalHashes].sort());
  expect(await readdir("dist")).toEqual(["index.html"]);
  expect(standalone).not.toMatch(
    /<script[^>]+src=|<link[^>]+rel=["']stylesheet/,
  );
});

test("identifiants de navigation indépendants des libellés", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:5173");
  await page.locator("nav").waitFor();
  await nav("OPTIONS")(page);
  await side("VIDÉO")(page);
  expect(
    await page.evaluate(() => [window.state.tab, window.state.optionCat]),
  ).toEqual(["options", "video"]);
  await nav("MULTIJOUEUR")(page);
  await side("BATTLEGROUND")(page);
  expect(
    await page.evaluate(() => [window.state.tab, window.state.multi]),
  ).toEqual(["multiplayer", "battleground"]);
  await nav("CRÉDITS")(page);
  expect(await page.evaluate(() => window.state.tab)).toBe("credits");
  await page.keyboard.press("Escape");
  await page.evaluate(async () => {
    // Reuse the exact module URL, including Vite's HMR revision when present.
    const moduleURL = performance
      .getEntriesByType("resource")
      .find(
        (entry) => new URL(entry.name).pathname === "/src/data/navigation.js",
      ).name;
    const { topNavigation, soloNavigation, infoTabs } = await import(moduleURL);
    topNavigation.find((item) => item.id === "home").label = "Accueil renommé";
    soloNavigation.find((item) => item.id === "load").label =
      "Sauvegardes renommées";
    infoTabs.find((item) => item.id === "patch-notes").label =
      "Versions renommées";
    window.go("home");
  });
  await expect(page.locator("nav button.active")).toHaveText("Accueil renommé");
  await nav("SOLO")(page);
  await page.getByRole("button", { name: /Sauvegardes renommées/ }).click();
  expect(await page.evaluate(() => window.state.solo)).toBe("load");
  await expect(page.locator(".choice.active span")).toHaveText(
    "Choisir un personnage existant",
  );
  await nav("INFOS")(page);
  await button("Versions renommées")(page);
  await expect(page.locator(".news .card")).toHaveCount(2);
});
