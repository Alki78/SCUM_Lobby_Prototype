import { chromium } from "@playwright/test";
import { PNG } from "pngjs";
import assert from "node:assert/strict";
import { writeFile, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const output = new URL("./unchanged-views.json", import.meta.url);
const record = process.argv.includes("--record");
const expected = record ? null : JSON.parse(await readFile(output, "utf8"));
const browser = await chromium.launch({
  executablePath:
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || "/usr/bin/chromium",
  args: ["--disable-gpu"],
});
const captures = [];
async function ready(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    const urls = new Set();
    for (const el of document.querySelectorAll("*"))
      for (const pseudo of [null, "::before", "::after"])
        for (const m of getComputedStyle(el, pseudo).backgroundImage.matchAll(
          /url\(["']?([^"')]+)["']?\)/g,
        ))
          urls.add(m[1]);
    await Promise.all(
      [...urls].map(
        (url) =>
          new Promise((resolve, reject) => {
            const im = new Image();
            im.onload = resolve;
            im.onerror = reject;
            im.src = url;
          }),
      ),
    );
    await Promise.all([...document.images].map((im) => im.decode()));
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
  });
  // Laisser Chromium terminer le rééchantillonnage différé des fonds CSS.
  await page.waitForTimeout(400);
}
try {
  for (const [width, height] of [
    [1837, 856],
    [1366, 768],
    [390, 844],
  ]) {
    const page = await browser.newPage({
      viewport: { width, height },
      deviceScaleFactor: 1,
    });
    await page.goto(process.env.SCUM_COMPARE_URL || "http://127.0.0.1:5173");
    for (const [tab, label] of [
      ["home", "ACCUEIL"],
      ["solo", "SOLO"],
      ["multiplayer", "MULTIJOUEUR"],
      ["options", "OPTIONS"],
      ["shop", "DLC / SHOP"],
      ["infos", "INFOS"],
      ["credits", "CRÉDITS"],
    ]) {
      await page
        .locator("nav")
        .getByRole("button", { name: label, exact: true })
        .click();
      for (const state of tab === "solo"
        ? ["continue", "load", "new"]
        : [null]) {
        if (state) await page.locator(`[data-solo-action="${state}"]`).click();
        await page.mouse.move(0, 0);
        await page.evaluate(() => scrollTo(0, 0));
        await ready(page);
        const png = PNG.sync.read(
          await page.screenshot({ animations: "disabled" }),
        );
        captures.push({
          viewport: [width, height],
          tab,
          state,
          rgba_sha256: createHash("sha256").update(png.data).digest("hex"),
        });
      }
    }
    await page.close();
  }
  if (record)
    await writeFile(
      output,
      JSON.stringify({ base: "1d77987", captures }, null, 2) + "\n",
    );
  else {
    assert.deepEqual(
      captures,
      expected.captures,
      "Toutes les vues hors Tutoriel sont identiques au dernier main",
    );
    await writeFile(
      new URL("./unchanged-views-result.json", import.meta.url),
      JSON.stringify(
        { all_identical: true, views: captures.length, base: expected.base },
        null,
        2,
      ) + "\n",
    );
  }
  console.log(
    captures.length +
      " vues " +
      (record ? "enregistrées depuis main" : "identiques au dernier main"),
  );
} finally {
  await browser.close();
}
