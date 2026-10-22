import { expect, test } from "@playwright/test";

for (const mode of ["light", "dark"]) {
  test(`gallery borders and destructive text use the library theme in ${mode} mode`, async ({ page }) => {
    await page.addInitScript((value) => {
      localStorage.setItem("synthex-preview-mode", value);
      localStorage.setItem("synthex-preview-accent", "steel");
    }, mode);
    await page.goto("/components");
    await expect(page.getByRole("heading", { name: "Component gallery", exact: true })).toBeVisible();
    const checks = [
      { element: page.locator('[data-slot="card"]').first(), property: "border-bottom-color", token: "--sx-color-border" },
      { element: page.locator('[data-slot="badge"]').filter({ hasText: /^Token aware$/ }), property: "border-bottom-color", token: "--sx-color-border" },
      { element: page.getByRole("heading", { name: "Component gallery", exact: true }), property: "border-bottom-color", token: "--sx-color-border" },
      { element: page.locator('[data-slot="badge"]').filter({ hasText: /^Critical$/ }), property: "color", token: "--sx-color-foreground-on-destructive" },
    ];
    for (const { element, property, token } of checks) {
      const expected = await element.evaluate((node, name) => {
        const sample = document.createElement("span");
        sample.style.color = getComputedStyle(node).getPropertyValue(name);
        node.appendChild(sample);
        const color = getComputedStyle(sample).color;
        sample.remove();
        return color;
      }, token);
      await expect(element, `${mode}/${property}/${token}`).toHaveCSS(property, expected);
    }
  });
}

test("gallery renders without React errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/components");
  await expect(page.getByRole("heading", { name: "Component gallery", exact: true })).toBeVisible();
  await expect(page.getByPlaceholder("Project name", { exact: true })).toBeEditable();
  expect(errors).toEqual([]);
});

test("gallery feedback includes a toast that can be opened and dismissed", async ({ page }) => {
  await page.goto("/components");
  await page.getByRole("button", { name: "Show regular toast", exact: true }).click();
  const toast = page.locator('[data-slot="toast"]').filter({ hasText: "Regular toast" });
  await expect(toast).toBeVisible();
  await toast.getByRole("button", { name: "Dismiss toast" }).click();
  await expect(toast).toBeHidden();
});

for (const width of [390, 1280]) {
  test(`gallery carousel controls fit and advance slides at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/components");
    const carousel = page.locator('[data-slot="carousel"]').first();
    const next = carousel.getByRole("button", { name: "Next slide" });
    await expect(next).toBeEnabled();
    const bounds = await carousel.boundingBox();
    const control = await next.boundingBox();
    expect(bounds).not.toBeNull();
    expect(control!.x).toBeGreaterThanOrEqual(bounds!.x);
    expect(control!.x + control!.width).toBeLessThanOrEqual(bounds!.x + bounds!.width + 1);
    await next.click();
    await expect(carousel.getByRole("button", { name: "Previous slide" })).toBeEnabled();
    await expect.poll(() => carousel.getByText("Step 2", { exact: true }).evaluate((element) => {
      const viewport = element.closest('[data-slot="carousel-content"]')!.getBoundingClientRect();
      const slide = element.getBoundingClientRect();
      return slide.left >= viewport.left - 1 && slide.right <= viewport.right + 1;
    })).toBe(true);
  });
}

test("resizing to a phone keeps navigation closed until requested", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/components");
  const sidebar = page.locator('[data-slot="sidebar"]').first();
  await expect(sidebar).toHaveAttribute("data-state", "open");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(sidebar).toHaveAttribute("data-state", "closed");
  const trigger = page.getByRole("button", { name: "Open navigation", exact: true });
  await trigger.click();
  await expect(sidebar).toHaveAttribute("data-state", "open");
  await page.getByRole("button", { name: "Toggle Sidebar", exact: true }).click();
  await expect(sidebar).toHaveAttribute("data-state", "closed");
});

test("gallery fields stack on phones and use two columns on desktop", async ({ page }) => {
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/components");
    const name = page.getByPlaceholder("Project name", { exact: true });
    await expect(name).toBeVisible();
    const fields = await name.evaluate((node) => {
      const first = node.closest(".preview-field")!.getBoundingClientRect();
      const second = document.querySelector('[data-slot="select-trigger"]')!.closest(".preview-field")!.getBoundingClientRect();
      return { first: { top: first.top, bottom: first.bottom }, second: { top: second.top } };
    });
    if (width < 768) expect(fields.second.top).toBeGreaterThan(fields.first.bottom);
    else expect(Math.abs(fields.second.top - fields.first.top)).toBeLessThan(1);
  }
});
