import { expect } from "@playwright/test";

export async function assertSoloGeometry(page) {
  const layout = await page.evaluate(() => {
    const rect = (el) => {
      const r = el.getBoundingClientRect();
      return {
        x: r.x,
        y: r.y + scrollY,
        width: r.width,
        height: r.height,
        right: r.right,
        bottom: r.bottom + scrollY,
      };
    };
    const panel = document.querySelector(".solo-detail");
    const style = getComputedStyle(panel);
    return {
      viewport: innerWidth,
      pageWidth: document.documentElement.scrollWidth,
      state: panel.dataset.soloView,
      choices: [...document.querySelectorAll(".choice")].map(rect),
      panel: rect(panel),
      profileBottom: document.querySelector(".profile").getBoundingClientRect()
        .bottom,
      headerBottom: document.querySelector("header").getBoundingClientRect()
        .bottom,
      padding: parseFloat(style.paddingLeft),
      border: parseFloat(style.borderLeftWidth),
      button: rect(panel.querySelector(".btn.big")),
      remainingScroll:
        panel.scrollHeight - panel.clientHeight - panel.scrollTop,
    };
  });
  expect(layout.pageWidth).toBe(layout.viewport);
  expect(layout.choices).toHaveLength(4);
  for (const [i, choice] of layout.choices.entries()) {
    expect(choice.width).toBeCloseTo(layout.choices[0].width, 1);
    expect(choice.height).toBeCloseTo(layout.choices[0].height, 1);
    if (i)
      expect(choice.y - layout.choices[i - 1].bottom).toBeCloseTo(
        layout.viewport <= 700 ? 10 : 12,
        1,
      );
  }
  if (layout.viewport <= 700) {
    expect(layout.headerBottom).toBeGreaterThanOrEqual(layout.profileBottom);
    expect(layout.choices[0].y).toBe(252);
    expect(layout.choices[0].height).toBe(88);
    expect(layout.panel.width).toBe(layout.viewport - 24);
    expect(layout.panel.y).toBeGreaterThan(layout.choices[3].bottom);
  } else {
    expect(layout.panel.height).toBeGreaterThanOrEqual(440);
    expect(layout.panel.y).toBeCloseTo(layout.choices[0].y, 1);
    expect(layout.panel.right).toBeLessThan(layout.viewport * 0.79);
  }
  if (layout.state === "continue") {
    expect(layout.button.x).toBeCloseTo(
      layout.panel.x + layout.padding + layout.border,
      1,
    );
    expect(layout.button.width).toBeCloseTo(
      layout.panel.width - 2 * (layout.padding + layout.border),
      1,
    );
    expect(layout.button.bottom).toBeLessThanOrEqual(
      layout.panel.bottom - layout.padding + layout.remainingScroll + 1,
    );
  }
  return layout;
}
