import { expect, test } from "@playwright/test";

const longTitle = `Fix ${"an-unbroken-component-name-".repeat(16)}`;
const snapshot = {
  metrics: [
    { label: "GitHub Stars", value: 24, icon: "★", description: "Public repository stars" },
    { label: "Forks", value: 6, icon: "⑂", description: "Repository forks" },
    { label: "Open Issues", value: 3, icon: "◌", description: "Tracked on GitHub" },
    { label: "Recent Commits", value: 18, icon: "⎇", description: "last 30 days" },
  ],
  updates: Array.from({ length: 5 }, (_, index) => ({
    title: index === 0 ? longTitle : `Improve the web component layout for release ${index}`,
    user: "Luseefor", initials: "LU", time: "2 hours ago",
  })),
  chartData: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month, index) => ({ month, value: index * 8 })),
  chartTitle: "Commit Activity", chartDescription: "Monthly repository activity.",
  latestReleaseLabel: "v1.1.0", repositoryUrl: "https://github.com/Luseefor/synthex-ui",
};

test.beforeEach(async ({ page }) => {
  await page.route("**/api/github-dashboard", (route) => route.fulfill({ json: snapshot }));
});

test("overview metrics form a compact two-column grid on phones", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const stars = page.locator('[data-slot="card"]').filter({ has: page.getByText("GitHub Stars", { exact: true }) });
  const forks = page.locator('[data-slot="card"]').filter({ has: page.getByText("Forks", { exact: true }) });
  await expect(stars.getByText("24", { exact: true })).toBeVisible();
  const first = await stars.boundingBox();
  const second = await forks.boundingBox();
  expect(Math.abs(first!.y - second!.y)).toBeLessThan(1);
  expect(first!.height).toBeLessThanOrEqual(136);
});

for (const width of [390, 1024, 1280]) {
  test(`overview activity remains readable and contained at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const updates = page.locator('[data-slot="card"]').filter({ has: page.getByText("Recent Updates", { exact: true }) });
    const timestamp = updates.getByText("2 hours ago", { exact: true }).first();
    await expect(timestamp).toBeAttached();
    const lines = await timestamp.evaluate((node) => {
      const range = document.createRange();
      range.selectNodeContents(node);
      return new Set(Array.from(range.getClientRects(), (rect) => Math.round(rect.y))).size;
    });
    expect(lines, "timestamps must not wrap into a vertical stack").toBe(1);
    const title = updates.getByText(longTitle, { exact: true });
    const cardBox = await updates.boundingBox();
    const titleBox = await title.boundingBox();
    expect(titleBox!.x + titleBox!.width).toBeLessThanOrEqual(cardBox!.x + cardBox!.width + 1);
    const lineHeight = await title.evaluate((node) => Number.parseFloat(getComputedStyle(node).lineHeight));
    expect(titleBox!.height).toBeLessThanOrEqual(lineHeight * 2 + 1);
    await expect(title).toHaveAttribute("title", longTitle);
    const overflow = await page.locator(".preview-main").evaluate((node) => node.scrollWidth - node.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
}

test("overview uses its available desktop width without nested page gutters", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  const card = page.locator('[data-slot="card"]').filter({ has: page.getByText("GitHub Stars", { exact: true }) });
  await expect(card.getByText("24", { exact: true })).toBeVisible();
  const cardBox = await card.boundingBox();
  const pageBox = await page.locator(".preview-main").boundingBox();
  expect(cardBox!.x - pageBox!.x).toBeLessThanOrEqual(33);
});

test("overview search clears cleanly and documentation navigation works", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const search = page.getByRole("textbox");
  await search.fill("no-matching-overview-result");
  await expect(page.getByRole("heading", { name: "No results found", exact: true })).toBeVisible();
  await page.getByRole("button", { name: /clear search/i }).click();
  await expect(search).toHaveValue("");
  await expect(page.getByText("Commit Activity", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "View Repository", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "View Documentation", exact: true }).click();
  await expect(page).toHaveURL(/\/docs$/);
});

test("overview chart bars stay within the plot and empty activity has an explicit state", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  const chart = page.locator('[data-slot="dashboard-chart"]');
  const bars = page.locator('[data-slot="dashboard-chart-bar"]');
  await expect(bars).toHaveCount(12);
  const geometry = await chart.evaluate((node) => {
    const box = node.getBoundingClientRect();
    return Array.from(node.querySelectorAll('[data-slot="dashboard-chart-bar"]'), (bar) => {
      const bounds = bar.getBoundingClientRect();
      return { contained: bounds.x >= box.x && bounds.right <= box.right + 1 && bounds.top >= box.top - 1 && bounds.bottom <= box.bottom + 1, height: bounds.height };
    });
  });
  expect(geometry.every((bar) => bar.contained)).toBe(true);
  expect(geometry[11]!.height).toBeGreaterThan(100);
  await page.route("**/api/github-dashboard", (route) => route.fulfill({ json: { ...snapshot, chartData: [] } }));
  await page.reload();
  await expect(page.getByText("No activity to show.", { exact: true })).toBeVisible();
  await expect(bars).toHaveCount(0);
});
