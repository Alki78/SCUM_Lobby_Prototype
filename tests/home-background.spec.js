import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";

test("la géométrie validée de PR #2 reste inchangée", async () => {
  const css = await readFile("src/styles/pages/home.css", "utf8");
  // Fingerprint of the validated stylesheet at f0941d4, excluding comments and
  // the painted backdrop. The same check covers desktop and responsive rules.
  const uiStyles = css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\.app\[data-bg="home"\]::before\s*\{[^}]*\}/g, "")
    .replace(/@media[^{}]+\{\s*\}/g, "")
    .replace(/\s+/g, "");
  expect(createHash("sha256").update(uiStyles).digest("hex")).toBe(
    "536e24eb94d54f42b4ef65c22930d8f1ad713219646cb515fc3d82832ce939b5",
  );
  expect(css).toContain(
    'url("../../../docs/references/SCUM_Lobby_Original.png.png")',
  );
});

test("le fond authentique est intégré sans retouche dans le HTML autonome", async () => {
  const source = await readFile("docs/references/SCUM_Lobby_Original.png.png");
  const built = await readFile("dist/index.html", "utf8");
  expect(
    built.includes(`data:image/png;base64,${source.toString("base64")}`),
  ).toBe(true);
});
