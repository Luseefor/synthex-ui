import { expect, test } from "@playwright/test";

// Bounded chart layout: gallery charts must fit their card at 390 and 1280.
// Red before fix: .recharts-wrapper is fixed 640px, overflows 308px card at 390.
for (const width of [390, 1280]) {
  test(`charts fit container at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/components");
    await expect(page.getByRole("heading", { name: "Component gallery", exact: true })).toBeAttached();

    const charts = page.locator('[data-slot="chart"]');
    await expect.poll(async () => charts.count(), { timeout: 10000 }).toBeGreaterThan(0);

    const count = await charts.count();
    // Gallery DataShowcase requests height 180 for Area/Bar/Line.
    const expectedHeight = 180;
    for (let i = 0; i < count; i++) {
      const card = charts.nth(i);
      await expect(card).toBeAttached();
      const svg = card.locator("svg.recharts-surface").first();
      await expect(svg).toBeAttached({ timeout: 10000 });

      // Poll real layout: nonzero, fits left/right, requested height stable.
      await expect.poll(async () => {
        const svgBox = await svg.boundingBox();
        const cardBox = await card.boundingBox();
        if (!svgBox || !cardBox) return "missing-box";
        if (svgBox.width <= 0 || svgBox.height <= 0) return "zero-area";
        if (svgBox.x < cardBox.x - 1) return `left-overflow:${Math.round(svgBox.x - cardBox.x)}`;
        if (svgBox.x + svgBox.width > cardBox.x + cardBox.width + 1) {
          return `right-overflow:${Math.round(svgBox.x + svgBox.width - (cardBox.x + cardBox.width))}`;
        }
        if (svgBox.width > cardBox.width + 1) return "too-wide";
        if (Math.abs(svgBox.height - expectedHeight) > 2) return `height:${Math.round(svgBox.height)}`;
        return "fit";
      }, { timeout: 10000 }).toBe("fit");
    }

    // Resize within the same test and re-check charts stay fitted and nonzero.
    // Poll real layout, no fixed sleep. Checks left/right fit, not only width.
    // Height must stay at the requested 180 after the container remeasures.
    const other = width === 390 ? 1280 : 390;
    await page.setViewportSize({ width: other, height: 800 });
    for (let i = 0; i < count; i++) {
      const card = charts.nth(i);
      const svg = card.locator("svg.recharts-surface").first();
      await expect.poll(async () => {
        const svgBox = await svg.boundingBox();
        const cardBox = await card.boundingBox();
        if (!svgBox || !cardBox) return "missing-box";
        if (svgBox.width <= 0 || svgBox.height <= 0) return "zero-area";
        if (svgBox.x < cardBox.x - 1) return `left-overflow:${Math.round(svgBox.x - cardBox.x)}`;
        if (svgBox.x + svgBox.width > cardBox.x + cardBox.width + 1) {
          return `right-overflow:${Math.round(svgBox.x + svgBox.width - (cardBox.x + cardBox.width))}`;
        }
        if (svgBox.width > cardBox.width + 1) return "too-wide";
        if (Math.abs(svgBox.height - expectedHeight) > 2) return `height:${Math.round(svgBox.height)}`;
        return "fit";
      }, { timeout: 10000 }).toBe("fit");
    }
  });
}
