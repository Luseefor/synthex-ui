import { expect, test } from "@playwright/test";

// Runs against a local `vite dev` via the webServer block in
// playwright.config.ts. Wired into CI (.github/workflows/ci.yml, e2e job,
// chromium only).

test("Builder page loads", async ({ page }) => {
  await page.goto("/playground");
  await expect(page.getByText("Synthex Builder")).toBeVisible();
  await expect(page.locator(".bld")).toBeVisible();
  await expect(page.locator(".bld-stage")).toBeVisible();
});

test("LayoutRenderer split contract renders in preview shell", async ({ page }) => {
  // The full split/resize contract for LayoutRenderer lives in
  // @luseefor/synthex-react-web unit tests (LayoutRenderer.test.tsx).
  // Here we smoke-test the preview shell split that hosts the Builder canvas:
  // toolbar + canvas body + stage frame.
  await page.goto("/playground");
  await expect(page.locator(".bld-bd")).toBeVisible();
  await expect(page.locator(".bld-cv")).toBeVisible();
  await expect(page.getByText("Drop components anywhere")).toBeVisible();
});
