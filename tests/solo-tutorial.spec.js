import { test, expect } from "@playwright/test";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { PNG } from "pngjs";
import { assertSoloGeometry } from "./helpers/solo-geometry.js";

test.use({
  launchOptions: {
    args: ["--disable-gpu"],
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
      : {}),
  },
});

const approvedFolder = "docs/reviews/solo-tutorial-v2-parachute/";
const references = JSON.parse(
  await readFile(approvedFolder + "verification.json", "utf8"),
);
const manifest = JSON.parse(
  await readFile(approvedFolder + "illustration.json", "utf8"),
);
const banner = await readFile(
  "assets/images/solo-tutoriel-largage-banniere.png",
);
const standalone = await readFile("dist/index.html", "utf8");
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");

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
  // Même stabilisation de peinture que les captures de revue approuvées.
  await page.waitForTimeout(400);
}

function samePixels(actual, expected) {
  const a = PNG.sync.read(actual),
    b = PNG.sync.read(expected);
  expect([a.width, a.height]).toEqual([b.width, b.height]);
  expect(
    a.data.equals(b.data),
    "Pixels identiques à la simulation v2 approuvée",
  ).toBe(true);
}

test("SOLO Tutoriel v2 : découpe native et provenance de la bannière", async () => {
  const sourceBytes = await readFile(
    "docs/references/SCUM_Tutoriel_Largage_Reference.png",
  );
  expect(hash(sourceBytes)).toBe(manifest.source_sha256);
  expect(hash(banner)).toBe(manifest.output_sha256);
  expect(
    banner.equals(
      await readFile(approvedFolder + "tutoriel-largage-banniere.png"),
    ),
  ).toBe(true);
  const source = PNG.sync.read(sourceBytes),
    crop = PNG.sync.read(banner);
  expect([source.width, source.height]).toEqual([1650, 928]);
  expect([crop.width, crop.height]).toEqual([1388, 640]);
  for (let y = 0; y < 640; y++) {
    const offset = ((140 + y) * source.width + 131) * 4;
    expect(
      source.data
        .subarray(offset, offset + 1388 * 4)
        .equals(crop.data.subarray(y * 1388 * 4, (y + 1) * 1388 * 4)),
    ).toBe(true);
  }
  expect(standalone).toContain(
    "data:image/png;base64," + banner.toString("base64"),
  );
  expect(standalone).not.toContain("/docs/reviews/solo-tutorial-v2-parachute/");
  expect(standalone).not.toContain("data-review-tutorial");
  expect(standalone).not.toContain("--review-tutorial-original-height");
});

for (const reference of references) {
  const [width, height] = reference.viewport;
  test(`SOLO Tutoriel v2 ${width} × ${height} : fidélité, géométrie et export hors ligne`, async ({
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
        page.on("pageerror", (error) => errors.push(error.message));
        page.on("request", (request) => requests.push(request.url()));
        if (target === "offline") await page.setContent(standalone);
        else await page.goto("http://127.0.0.1:5173");
        await page.locator(".home-stack").waitFor();
        await page
          .locator("nav")
          .getByRole("button", { name: "SOLO", exact: true })
          .click();
        await ready(page);
        const continueBefore = await page.screenshot();
        const continueWidth = (
          await page.locator(".solo-detail > .btn.big").boundingBox()
        ).width;
        await page.locator('[data-solo-action="tutorial"]').click();
        const create = () =>
          page.getByRole("button", {
            name: "LANCER LE TUTORIEL",
            exact: true,
          });
        // Même cycle de rendu que la revue : ouverture/fermeture du message.
        await create().click();
        await expect(page.locator(".dialog")).toContainText(
          "Tutoriel — lancement simulé",
        );
        await page.getByRole("button", { name: "FERMER", exact: true }).click();
        await page.evaluate(() => scrollTo(0, 0));
        await ready(page);
        const geometry = await assertSoloGeometry(page);
        for (const key of ["x", "y", "width", "height"])
          expect(geometry.panel[key]).toBe(reference.v2.panel[key]);
        const metrics = await page.locator(".solo-detail").evaluate((el) => {
          const art = el.querySelector(".illustration"),
            r = art.getBoundingClientRect();
          return {
            scroll: [el.scrollHeight, el.clientHeight],
            art: [r.width, r.height],
            background: getComputedStyle(art).backgroundImage,
            text: el.querySelector("p").textContent,
            heading: el.querySelector("h2").textContent,
          };
        });
        expect(metrics.scroll[0]).toBe(metrics.scroll[1]);
        expect(metrics.art).toEqual([
          reference.v2.illustration.width,
          reference.v2.illustration.height,
        ]);
        expect(metrics.art[0]).toBeLessThanOrEqual(1388);
        expect(metrics.art[1]).toBeLessThanOrEqual(640);
        // Chromium quantifie les boîtes au 1/64 de pixel CSS ; la hauteur
        // peut donc différer de moins d'un pas du ratio mathématique exact.
        expect(
          Math.abs(metrics.art[1] - (metrics.art[0] * 640) / 1388),
        ).toBeLessThanOrEqual(1 / 64);
        expect(metrics.text).toBe(
          "Apprenez les bases de la survie dans un mode de jeu dédié avant de vous lancer sur l'île.",
        );
        expect(metrics.heading).toBe("TUTORIEL");
        expect(geometry.button.width).toBe(continueWidth);
        expect(geometry.button.bottom).toBeLessThanOrEqual(
          geometry.panel.bottom - geometry.padding,
        );
        if (target === "offline")
          expect(
            metrics.background.includes(
              "data:image/png;base64," + banner.toString("base64"),
            ),
          ).toBe(true);
        else
          expect(metrics.background).toContain(
            "/assets/images/solo-tutoriel-largage-banniere.png",
          );
        const screenshot = await page.screenshot();
        samePixels(
          screenshot,
          await readFile(approvedFolder + `tutoriel-${width}x${height}.png`),
        );
        await testInfo.attach(target, {
          body: screenshot,
          contentType: "image/png",
        });
        if (process.env.SCUM_TUTORIAL_CAPTURE_DIR) {
          await mkdir(process.env.SCUM_TUTORIAL_CAPTURE_DIR, {
            recursive: true,
          });
          await writeFile(
            `${process.env.SCUM_TUTORIAL_CAPTURE_DIR}/${target}-${width}x${height}.png`,
            screenshot,
          );
        }
        if (width === 390) {
          await page.evaluate(() =>
            scrollTo(0, document.documentElement.scrollHeight - innerHeight),
          );
          const detail = await page.screenshot();
          samePixels(
            detail,
            await readFile(approvedFolder + "tutoriel-detail-390x844.png"),
          );
          const button = await create().boundingBox(),
            footer = await page.locator(".footer").boundingBox();
          expect(button.y + button.height).toBeLessThanOrEqual(footer.y);
          if (process.env.SCUM_TUTORIAL_CAPTURE_DIR)
            await writeFile(
              `${process.env.SCUM_TUTORIAL_CAPTURE_DIR}/${target}-detail-390x844.png`,
              detail,
            );
        }
        await create().click();
        await expect(page.locator(".dialog")).toContainText(
          "Tutoriel — lancement simulé",
        );
        await page.getByRole("button", { name: "FERMER", exact: true }).click();
        await expect(
          page.locator(
            ".solo-detail input, .solo-detail select, .solo-detail textarea",
          ),
        ).toHaveCount(0);
        await page.locator('[data-solo-action="continue"]').click();
        await page.evaluate(() => scrollTo(0, 0));
        await ready(page);
        samePixels(await page.screenshot(), continueBefore);
        expect(errors).toEqual([]);
        if (target === "offline") expect(requests).toEqual([]);
      } finally {
        await context.close();
      }
    }
  });
}
