import { expect, test } from "@playwright/test";

test.setTimeout(60000);

async function expectSettledNoPageJump(page: import("@playwright/test").Page, width: number) {
  // Settled signal: command items registered and page scroll stays 0 (bounded poll, no fixed sleep).
  await expect
    .poll(() => page.locator('[data-slot="command-item"]').count(), `command items registered at ${width}px`)
    .toBeGreaterThan(0);
  const heading = page.getByRole("heading", { name: "Component gallery", exact: true });
  await expect(heading).toBeVisible();
  await expect
    .poll(
      () => page.locator(".preview-main").evaluate((node) => node.scrollTop),
      `preview-main scrollTop stable at 0 at ${width}px`,
    )
    .toBe(0);
  await expect(heading, `heading should stay in viewport at ${width}px`).toBeInViewport();
}

for (const width of [390, 1280]) {
  test(`fresh gallery keeps heading in viewport with main scrollTop 0 at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/components", { waitUntil: "domcontentloaded" });
    await expectSettledNoPageJump(page, width);
  });

  test(`keyboard Enter selects first and ArrowDown moves inside the list at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/components", { waitUntil: "domcontentloaded" });
    await expectSettledNoPageJump(page, width);

    const input = page.getByPlaceholder("Search commands").first();
    await expect(input).toBeVisible();
    await input.scrollIntoViewIfNeeded();
    await input.focus();

    // Focus gate restores first-item selection so initial Enter works.
    const first = page.getByRole("option", { name: "Publish preview" });
    await expect(first, "focus restores first selection").toHaveAttribute("aria-selected", "true");

    // Initial Enter dispatches cmdk-item-select on the focused selection.
    const enterCount = await page.evaluate(() => {
      (window as unknown as { __cmdkSelects?: number }).__cmdkSelects = 0;
      document.addEventListener(
        "cmdk-item-select",
        () => {
          (window as unknown as { __cmdkSelects: number }).__cmdkSelects += 1;
        },
        { capture: true },
      );
      return 0;
    });
    expect(enterCount).toBe(0);
    await page.keyboard.press("Enter");
    await expect
      .poll(
        () => page.evaluate(() => (window as unknown as { __cmdkSelects?: number }).__cmdkSelects ?? 0),
        "initial Enter selects focused item",
      )
      .toBe(1);

    // ArrowDown moves to second item and keeps it inside the list box.
    await page.keyboard.press("ArrowDown");
    const second = page.getByRole("option", { name: "Open docs" });
    await expect(second, "arrow down moves selection").toHaveAttribute("aria-selected", "true");
    const listBox = await page.locator('[data-slot="command-list"]').first().boundingBox();
    const itemBox = await second.boundingBox();
    expect(listBox, "command list visible").not.toBeNull();
    expect(itemBox, "selected item visible").not.toBeNull();
    expect(itemBox!.y, "selected stays inside list top").toBeGreaterThanOrEqual(listBox!.y - 2);
    expect(itemBox!.y + itemBox!.height, "selected stays inside list bottom").toBeLessThanOrEqual(
      listBox!.y + listBox!.height + 2,
    );
  });

  test(`constrained list scrolls internally on ArrowDown without page jump at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/components", { waitUntil: "domcontentloaded" });
    await expectSettledNoPageJump(page, width);

    const input = page.getByPlaceholder("Search commands").first();
    await input.scrollIntoViewIfNeeded();
    await input.focus();
    // Force overflow with the existing 2-item gallery list to prove internal scrolling.
    await page.locator('[data-slot="command-list"]').first().evaluate((node) => {
      node.style.maxHeight = "56px";
    });
    const pageTopBefore = await page.locator(".preview-main").evaluate((node) => node.scrollTop);
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await expect
      .poll(
        () => page.locator('[data-slot="command-list"]').first().evaluate((node) => node.scrollTop),
        "list scrolls internally",
      )
      .toBeGreaterThan(0);
    const pageTopAfter = await page.locator(".preview-main").evaluate((node) => node.scrollTop);
    expect(pageTopAfter, "page does not jump while list scrolls").toBe(pageTopBefore);
  });
}
