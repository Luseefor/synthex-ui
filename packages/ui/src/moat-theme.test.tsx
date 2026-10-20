/**
 * Moat theme/RTL/reduced-motion verification (web + styles.css).
 *
 * Does NOT rewrite the theme; asserts current contracts and documents gaps:
 * - Dark: [data-theme="dark"] overrides + prefers-color-scheme fallback.
 * - RTL: DirectionProvider dir=rtl; styles.css has no [dir="rtl"] rules
 *   (gap: overlays use physical left/right; logical props not yet adopted).
 * - Reduced motion: prefers-reduced-motion zeroes durations (gap: native has
 *   no AccessibilityInfo reduced-motion gate; JS animations unaffected).
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ThemeProvider } from "./theme";
import { DirectionProvider } from "./direction/direction.web";

function readStylesCss(): string {
  const candidates = [
    path.resolve(__dirname, "styles.css"),
    path.resolve(process.cwd(), "src/styles.css"),
    path.resolve(process.cwd(), "packages/ui/src/styles.css"),
  ];
  for (const p of candidates) {
    try {
      return fs.readFileSync(p, "utf8");
    } catch {
      // try next
    }
  }
  // Fallback: relative to this file (vitest runs with cwd=packages/ui).
  return fs.readFileSync(path.join(__dirname, "styles.css"), "utf8");
}

describe("Moat theme/RTL/motion (styles.css contracts)", () => {
  it("dark [data-theme=dark] overrides apply", () => {
    const css = readStylesCss();
    expect(css).toContain('[data-theme="dark"]');
    expect(css).toContain("--sx-color-background: #09090b");
    expect(css).toContain("color-scheme: dark");

    render(
      <ThemeProvider mode="dark">
        <div data-testid="dark-child">Dark child</div>
      </ThemeProvider>,
    );
    const child = screen.getByTestId("dark-child");
    // ThemeProvider sets data-theme=dark on wrapper (and document root).
    expect(child.closest("[data-theme='dark']")).not.toBeNull();
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("auto dark via prefers-color-scheme fallback exists", () => {
    const css = readStylesCss();
    expect(css).toContain("@media (prefers-color-scheme: dark)");
    expect(css).toContain(":root:not([data-theme])");
  });

  it("direction RTL renders dir=rtl; styles.css gap documented", () => {
    const { container } = render(
      <ThemeProvider>
        <DirectionProvider dir="rtl">
          <div>RTL content</div>
        </DirectionProvider>
      </ThemeProvider>,
    );
    expect(screen.getByText("RTL content").parentElement).toHaveAttribute(
      "dir",
      "rtl",
    );
    expect(container.querySelector('[dir="rtl"]')).not.toBeNull();

    const css = readStylesCss();
    // GAP (documented, not rewritten): no [dir="rtl"] selectors or logical
    // properties (inline-start/end, margin-inline) in styles.css. RTL relies
    // on dir attribute + flex auto-flip; absolute overlays (dialog, dropdown,
    // toast: left/right, translateX) do not mirror. Native mirrors via
    // style={{ direction: dir }} (direction.native.tsx) — same gap.
    expect(css.includes('[dir="rtl"]')).toBe(false);
    expect(css.includes("margin-inline")).toBe(false);
  });

  it("prefers-reduced-motion zeroes motion; native gap documented", () => {
    const css = readStylesCss();
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain("animation-duration: 0.01ms");
    expect(css).toContain("transition-duration: 0.01ms");
    // GAP (documented): native has no prefers-reduced-motion gate
    // (no AccessibilityInfo.isReduceMotionEnabled check in chart/carousel/
    // dialog animations); web JS-driven motion (embla, recharts) is not gated
    // beyond CSS durations. CSS-only surfaces are covered.
  });
});
