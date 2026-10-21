import { expect, test } from "@playwright/test";

test.setTimeout(60000);

test.beforeEach(async ({ page }) => {
  await page.goto("/e2e/fixtures/contracts.html", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
});

test("server markup hydrates with working labels and no recovery errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  const input = page.getByRole("textbox", { name: "Email", exact: true });
  await expect(input).toHaveAttribute("aria-invalid", "true");
  const ids = (await input.getAttribute("aria-describedby"))!.split(/\s+/);
  expect(ids).toContain("external-help");
  for (const id of ids) await expect(page.locator(`[id=${JSON.stringify(id)}]`)).toHaveCount(1);
  await page.getByText("Email", { exact: true }).click();
  await expect(input).toBeFocused();
  expect(errors).toEqual([]);
});

test("horizontal keyboard navigation follows RTL, skips disabled tabs, and responds to direction changes", async ({ page }) => {
  const first = page.getByRole("tab", { name: "First tab" });
  const second = page.getByRole("tab", { name: "Second tab" });
  await first.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(second).toBeFocused();
  await expect(second).toHaveAttribute("aria-selected", "true");
  await page.getByRole("combobox", { name: "Direction" }).selectOption("ltr");
  await first.focus();
  await page.keyboard.press("ArrowRight");
  await expect(second).toBeFocused();
  const firstRadio = page.getByRole("radio", { name: "First option", exact: true });
  const secondRadio = page.getByRole("radio", { name: "Second option", exact: true });
  await page.getByRole("combobox", { name: "Direction" }).selectOption("rtl");
  await firstRadio.focus();
  // Radix defers roving focus; hold the physical key until the focus event
  // selects the radio, then release it (no synthetic click fallback).
  await page.keyboard.down("ArrowLeft");
  try {
    await expect(secondRadio).toBeFocused();
    await expect(secondRadio).toBeChecked();
  } finally { await page.keyboard.up("ArrowLeft"); }
});

test("Tab is contained in the dialog and Escape restores trigger focus", async ({ page }) => {
  const trigger = page.getByRole("button", { name: "Open dialog" });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(page.getByRole("button", { name: "First dialog action" })).toBeFocused();
  // The fixture has two focusable actions; Tab must wrap at either end.
  await dialog.getByRole("button", { name: "Last dialog action", exact: true }).focus();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "First dialog action" })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(dialog.getByRole("button", { name: "Last dialog action", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test("disabled slotted links cannot activate or enter the tab order", async ({ page }) => {
  const link = page.getByRole("link", { name: "Disabled link" });
  await expect(link).toHaveAttribute("aria-disabled", "true");
  await expect(link).toHaveAttribute("tabindex", "-1");
  // Force a real pointer click past Playwright's aria-disabled actionability check.
  await link.click({ force: true });
  await link.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("Activation count")).toHaveText("0");
  expect(new URL(page.url()).hash).toBe("");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Enabled link" })).toBeFocused();
});

test("checkbox and switch participate in native submit and reset", async ({ page }) => {
  const subscribed = page.getByRole("checkbox", { name: "Subscribed" });
  const notifications = page.getByRole("switch", { name: "Notifications" });
  await subscribed.click();
  await notifications.click();
  await page.getByRole("button", { name: "Submit form" }).click();
  await expect(page.getByLabel("Form payload")).toHaveText('{"account":"Ada"}');
  await page.getByRole("button", { name: "Reset form" }).click();
  await expect(subscribed).toBeChecked();
  await expect(notifications).toBeChecked();
  await page.getByRole("button", { name: "Submit form" }).click();
  await expect(page.getByLabel("Form payload")).toHaveText('{"account":"Ada","subscribed":"yes","notifications":"on"}');
});

test("rendered primary and destructive text meets minimum contrast in every built-in theme", async ({ page }) => {
  test.setTimeout(90000);
  for (const mode of ["light", "dark"]) {
    await page.getByRole("combobox", { name: "Mode" }).selectOption(mode);
    for (const accent of ["blue", "emerald", "violet", "amber", "rose", "steel", "stone", "bronze", "mulberry"]) {
      await page.getByRole("combobox", { name: "Accent" }).selectOption(accent);
      for (const name of ["brand", "destructive", "destructive-badge"]) {
        const button = page.getByTestId(name);
        for (const hover of [false, true]) {
          if (hover) await button.hover(); else await page.getByRole("heading", { level: 1 }).hover();
          // Wait for transition-colors to finish before reading pixels' colors.
          await expect.poll(async () => button.evaluate((element) => element.getAnimations().filter((animation) => animation.playState === "running").length)).toBe(0);
          const ratio = await button.evaluate((element) => {
            function luminance(css: string) {
              const channels = css.match(/[\d.]+/g)?.map(Number);
              if (!/^rgba?\(/.test(css) || !channels || channels.length < 3 || (channels.length > 3 && channels[3] !== 1)) {
                throw new Error(`Expected an opaque sRGB fill/text color, received ${css}`);
              }
              const values = channels.slice(0, 3).map((value) => { const x = value / 255; return x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4; });
              return values[0]! * .2126 + values[1]! * .7152 + values[2]! * .0722;
            }
            const style = getComputedStyle(element);
            const foreground = luminance(style.color);
            const background = luminance(style.backgroundColor);
            return (Math.max(foreground, background) + .05) / (Math.min(foreground, background) + .05);
          });
          expect(ratio, `${mode}/${accent}/${name}/${hover ? "hover" : "rest"}`).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  }
});
