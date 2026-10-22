import { expect, test } from "@playwright/test";

test.setTimeout(60000);

test("assignee combobox shows its default value while closed", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/components", { waitUntil: "domcontentloaded" });
  const trigger = page.locator('[data-slot="combobox-trigger"]').first();
  await expect(trigger).toBeVisible();
  await expect(trigger).toHaveText(/Rijan/);
  await expect(page.locator('[data-slot="combobox-content"]')).toBeHidden();
});

test("combobox search, choose, and Escape flow still works", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/components", { waitUntil: "domcontentloaded" });
  const trigger = page.locator('[data-slot="combobox-trigger"]').first();
  await expect(trigger).toBeVisible();
  await trigger.scrollIntoViewIfNeeded();
  await trigger.focus();
  await page.keyboard.press("Enter");
  const content = page.locator('[data-slot="combobox-content"]');
  await expect(content).toBeVisible();
  const input = page.locator('[data-slot="combobox-input"]');
  await expect(input).toBeVisible();
  await input.fill("lus");
  await expect(page.locator('[data-slot="combobox-item"]').filter({ hasText: "Luseefor" })).toBeVisible();
  await page.locator('[data-slot="combobox-item"]').filter({ hasText: "Luseefor" }).first().click();
  await expect(content).toBeHidden();
  await expect(trigger).toHaveText(/Luseefor/);

  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(content).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(content).toBeHidden();
  await expect(trigger).toHaveText(/Luseefor/);
});

test("closed combobox content stays inert and unfocusable", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/components", { waitUntil: "domcontentloaded" });
  const trigger = page.locator('[data-slot="combobox-trigger"]').first();
  await expect(trigger).toBeVisible();
  await expect(page.locator('[data-slot="combobox-content"]')).toBeHidden();
  const contents = await page.locator('[data-slot="combobox-content"]').count();
  expect(contents).toBeLessThanOrEqual(1);
  await trigger.focus();
  await page.keyboard.press("Tab");
  const activeSlot = await page.evaluate(
    () => (document.activeElement?.closest("[data-slot]")?.getAttribute("data-slot") ?? "none"),
  );
  expect(activeSlot).not.toBe("combobox-input");
});
