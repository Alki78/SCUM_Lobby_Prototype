import { chromium, expect } from "@playwright/test";
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";

const standalone = new URL("../../../dist/index.html", import.meta.url);
const banner = await readFile(
  new URL(
    "../../../assets/images/solo-tutoriel-largage-banniere.png",
    import.meta.url,
  ),
);
const html = await readFile(standalone);
const browser = await chromium.launch({
  executablePath:
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || "/usr/bin/chromium",
  args: ["--disable-gpu"],
});
try {
  const context = await browser.newContext({
    viewport: { width: 1837, height: 856 },
    offline: true,
  });
  let page = await context.newPage();
  const requests = [],
    errors = [];
  const observe = (page) => {
    page.on("request", (request) => requests.push(request.url()));
    page.on("pageerror", (error) => errors.push(error.message));
  };
  observe(page);
  let directFile = true;
  try {
    await page.goto(standalone.href);
  } catch (error) {
    if (!error.message.includes("ERR_BLOCKED_BY_ADMINISTRATOR")) throw error;
    directFile = false;
    // Respecter la politique du navigateur cloud : vérifier les mêmes octets
    // dans un document sans réseau, sans contourner le blocage de file://.
    await page.close();
    page = await context.newPage();
    observe(page);
    await page.setContent(html.toString("utf8"));
  }
  await page.locator(".home-stack").waitFor();
  const tabs = [
    "SOLO",
    "MULTIJOUEUR",
    "OPTIONS",
    "DLC / SHOP",
    "INFOS",
    "CRÉDITS",
    "ACCUEIL",
  ];
  for (const name of tabs) {
    await page
      .locator("nav")
      .getByRole("button", { name, exact: true })
      .click();
    if (name === "CRÉDITS") {
      await expect(page.locator(".credits")).toBeVisible();
      await page.keyboard.press("Space");
    } else {
      await expect(
        page.locator("nav").getByRole("button", { name, exact: true }),
      ).toHaveClass("active");
    }
  }
  await page
    .locator("nav")
    .getByRole("button", { name: "SOLO", exact: true })
    .click();
  await page.locator('[data-solo-action="tutorial"]').click();
  const art = await page
    .locator(".solo-tutorial-intro .illustration")
    .evaluate(async (el) => {
      const background = getComputedStyle(el).backgroundImage;
      const url = background.match(/url\(["']?([^"')]+)["']?\)/)[1];
      const image = new Image();
      image.src = url;
      await image.decode();
      return { url, size: [image.naturalWidth, image.naturalHeight] };
    });
  assert.equal(art.url, "data:image/png;base64," + banner.toString("base64"));
  assert.deepEqual(art.size, [1388, 640]);
  await page
    .getByRole("button", { name: "LANCER LE TUTORIEL", exact: true })
    .click();
  await expect(page.locator(".dialog")).toContainText(
    "Tutoriel — lancement simulé",
  );
  await page.getByRole("button", { name: "FERMER", exact: true }).click();
  await expect(page.locator(".dialog")).toHaveCount(0);
  assert.deepEqual(errors, []);
  assert.equal(
    requests.filter(
      (url) => !url.startsWith("file:") && !url.startsWith("data:"),
    ).length,
    0,
  );
  const fileRequests = requests.filter((url) => url.startsWith("file:")).length;
  // La politique peut bloquer la navigation avant l'émission d'une requête.
  assert.ok(fileRequests <= 1);
  if (directFile) assert.equal(fileRequests, 1);
  const report = {
    opened_as: directFile
      ? "file:///…/dist/index.html"
      : "page.setContent des octets exacts de dist/index.html, sans réseau",
    direct_file_navigation: directFile
      ? "passed"
      : "ERR_BLOCKED_BY_ADMINISTRATOR — politique du navigateur cloud",
    offline: true,
    html_bytes: html.length,
    html_sha256: createHash("sha256").update(html).digest("hex"),
    banner_sha256: createHash("sha256").update(banner).digest("hex"),
    banner_native_dimensions: art.size,
    embedded_banner_exact: true,
    tabs_checked: tabs,
    demo_and_close: true,
    file_navigation_attempts: 1,
    file_requests: fileRequests,
    external_requests: 0,
    errors,
  };
  await writeFile(
    new URL("./offline-file-result.json", import.meta.url),
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(
    "HTML vérifié hors ligne : 7 rubriques, bannière intégrée exacte, dialogue conservé, zéro requête externe. Ouverture file:// : " +
      (directFile
        ? "OK"
        : "bloquée par la politique du navigateur ; contenu vérifié sans réseau"),
  );
} finally {
  await browser.close();
}
