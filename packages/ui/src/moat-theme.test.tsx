/**
 * Moat theme/RTL/reduced-motion verification (web + styles.css).
 *
 * - Dark: [data-theme="dark"] overrides + prefers-color-scheme fallback.
 * - RTL: DirectionProvider dir=rtl; styles.css mirrors toast animations
 *   under [dir="rtl"] and text/edge offsets use logical utilities
 *   (`text-start`, `start-*`, `end-*`). `side="left"` / `side="right"`
 *   props stay physical by contract.
 * - Reduced motion: prefers-reduced-motion zeroes CSS durations; web JS
 *   motion is gated (recharts isAnimationActive, embla duration 0).
 *   Native chart/carousel render static frames (no animation code), so
 *   they are reduced-motion compliant by construction.
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

  it("direction RTL renders dir=rtl; styles.css mirrors RTL", () => {
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
    // RTL is now mirrored: toast enter animation has an RTL variant and
    // text/edge offsets use logical utilities. Radix overlay side
    // flipping follows document direction automatically.
    expect(css.includes('[dir="rtl"]')).toBe(true);
    expect(css).toContain("sx-toast-enter-rtl");
  });

  it("prefers-reduced-motion zeroes motion; web JS motion is gated", () => {
    const css = readStylesCss();
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain("animation-duration: 0.01ms");
    expect(css).toContain("transition-duration: 0.01ms");

    const readSource = (rel: string) =>
      fs.readFileSync(path.join(__dirname, rel), "utf8");
    // Recharts animations switch off under reduced motion.
    expect(readSource("chart/chart.web.tsx")).toContain("isAnimationActive={!reducedMotion}");
    // Embla animation duration drops to 0 under reduced motion.
    expect(readSource("carousel/carousel.web.tsx")).toContain("duration: 0");
    // Native chart/carousel render static frames (no Animated/timing code),
    // so they are reduced-motion compliant by construction.
    expect(readSource("chart/chart.native.tsx")).not.toContain("Animated");
    expect(readSource("carousel/carousel.native.tsx")).not.toContain("Animated");
  });
});
