import { expect } from "@playwright/test";

export async function assertHomeGeometry(page) {
  const layout = await page.evaluate(() => {
    const rect = (selector) => {
      const element = document.querySelector(selector);
      const box = element.getBoundingClientRect();
      return {
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
        right: box.right,
        bottom: box.bottom,
        clipped: element.scrollHeight > element.clientHeight + 2,
      };
    };
    return {
      viewport: innerWidth,
      pageWidth: document.documentElement.scrollWidth,
      header: rect("header"),
      nav: rect("nav"),
      profile: rect(".profile"),
      footer: rect(".footer"),
      stack: rect(".home-stack"),
      session: rect(".home-session"),
      art: rect(".home-session-art"),
      details: rect(".home-session-details"),
      button: rect(".home-session-details .btn"),
      news: rect(".home-news-v04"),
      controls: rect(".home-news-controls"),
      promos: rect(".home-promo-v04"),
      indicators: document.querySelectorAll(".home-news-dots span").length,
    };
  });
  expect(layout.pageWidth).toBe(layout.viewport);
  expect(layout.indicators).toBe(6);
  expect(layout.session.bottom).toBeLessThan(layout.news.y);
  expect(layout.news.bottom).toBeLessThan(layout.promos.y);
  expect(Math.abs(layout.button.bottom - layout.art.bottom)).toBeLessThan(1);
  expect(layout.button.height).toBe(48);
  expect(layout.details.clipped).toBe(false);
  expect(layout.button.right).toBeLessThanOrEqual(layout.session.right);
  expect(layout.controls.right).toBeLessThanOrEqual(layout.news.right);
  if (layout.viewport <= 780) {
    expect(layout.profile.bottom).toBeLessThanOrEqual(layout.nav.y);
    expect(layout.nav.bottom).toBeLessThanOrEqual(layout.header.bottom);
    expect(layout.stack.y).toBeGreaterThanOrEqual(layout.header.bottom);
    expect(layout.footer.y).toBeGreaterThanOrEqual(layout.promos.bottom);
  } else {
    expect(layout.header.height).toBe(77);
    expect(layout.footer.height).toBe(42);
    expect(layout.nav.right).toBeLessThanOrEqual(layout.profile.x);
    expect(layout.promos.bottom).toBeLessThan(layout.footer.y);
  }
  if (layout.viewport === 1837) {
    // Bounds read from the approved 1837 × 856 reference, within 2 px.
    const targets = {
      footer: { y: 814, height: 42 },
      stack: { x: 65, y: 103, width: 734, height: 693 },
      session: { y: 103, height: 264 },
      art: { x: 84, y: 146, width: 353, height: 199 },
      button: { x: 461, y: 296, width: 315, height: 48 },
      news: { y: 378, height: 254 },
      controls: { x: 87, y: 560, height: 44 },
      promos: { y: 646, height: 150 },
    };
    for (const [element, properties] of Object.entries(targets)) {
      for (const [property, expected] of Object.entries(properties)) {
        expect(
          Math.abs(layout[element][property] - expected),
          `${element}.${property}`,
        ).toBeLessThanOrEqual(2);
      }
    }
  }
}
