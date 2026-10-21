import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import * as React from "react";
import { render, cleanup } from "@testing-library/react";
import {
  BRAND_DARK_TEXT,
  BRAND_LIGHT_TEXT,
  accentPresets,
  contrastRatio,
  createTheme,
  resolveForegroundOnDestructive,
  themeToCssVariables,
} from "./createTheme";
import { ThemeProvider } from "./ThemeProvider.web";
import { resolveThemeAccentTheme } from "../../synthex/synthex.shared";
import type { AccentPresetName, ThemeMode } from "../types";

const ACCENTS = Object.keys(accentPresets) as AccentPresetName[];
const MODES: ThemeMode[] = ["light", "dark"];

describe("theme contrast (WCAG sRGB, normal text >= 4.5:1)", () => {
  it("implements the WCAG relative-luminance formula", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 1);
    expect(contrastRatio("#09090b", "#ffffff")).toBeGreaterThan(15);
    // Sanity: identical colors have no contrast.
    expect(contrastRatio("#2563eb", "#2563eb")).toBeCloseTo(1, 5);
    // Non-hex colors are not silently treated as passing.
    expect(contrastRatio("rgba(59, 130, 246, 0.15)", "#09090b")).toBeNaN();
  });

  it("passes foreground/background for all nine accents in light+dark", () => {
    for (const mode of MODES) {
      for (const accent of ACCENTS) {
        const theme = createTheme(undefined, { accentPreset: accent, mode });
        const ratio = contrastRatio(theme.colors.foreground, theme.colors.background);
        expect(
          ratio,
          `${accent}/${mode} foreground/background ${theme.colors.foreground} on ${theme.colors.background}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("passes foregroundMuted on background/surface/surfaceRaised for all accents/modes", () => {
    for (const mode of MODES) {
      for (const accent of ACCENTS) {
        const theme = createTheme(undefined, { accentPreset: accent, mode });
        for (const bg of [
          theme.colors.background,
          theme.colors.surface,
          theme.colors.surfaceRaised,
        ]) {
          const ratio = contrastRatio(theme.colors.foregroundMuted, bg);
          expect(
            ratio,
            `${accent}/${mode} foregroundMuted ${theme.colors.foregroundMuted} on ${bg}`,
          ).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });

  it("passes one shared foregroundOnBrand on opaque primary AND primaryHover (all accents/modes)", () => {
    for (const mode of MODES) {
      for (const accent of ACCENTS) {
        const theme = createTheme(undefined, { accentPreset: accent, mode });
        const onBrand = theme.colors.foregroundOnBrand;
        expect(
          [BRAND_LIGHT_TEXT, BRAND_DARK_TEXT].includes(onBrand),
          `${accent}/${mode} uses fixed palette, got ${onBrand}`,
        ).toBe(true);
        for (const bg of [theme.colors.primary, theme.colors.primaryHover]) {
          const ratio = contrastRatio(onBrand, bg);
          expect(
            ratio,
            `${accent}/${mode} on-brand ${onBrand} on ${bg}`,
          ).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });

  it("passes derived on-destructive text on opaque destructive pairs (all accents/modes)", () => {
    for (const mode of MODES) {
      for (const accent of ACCENTS) {
        const theme = createTheme(undefined, { accentPreset: accent, mode });
        const onDestructive = resolveForegroundOnDestructive(theme);
        for (const bg of [theme.colors.destructive, theme.colors.destructiveHover]) {
          const ratio = contrastRatio(onDestructive, bg);
          expect(
            ratio,
            `${accent}/${mode} on-destructive ${onDestructive} on ${bg}`,
          ).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });

  it("computes accessible foreground after merging explicit theme colors; explicit wins", () => {
    // synthex.shared.ts path arrives as explicit theme colors.
    const steelDark = createTheme(resolveThemeAccentTheme("steel", "dark"), {
      mode: "dark",
    });
    expect(steelDark.colors.primary).toBe("#9db1c6");
    expect(contrastRatio(steelDark.colors.foregroundOnBrand, steelDark.colors.primary)).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(steelDark.colors.foregroundOnBrand, steelDark.colors.primaryHover),
    ).toBeGreaterThanOrEqual(4.5);

    // Explicit custom primary without explicit text -> computed.
    const computed = createTheme(
      { colors: { primary: "#10b981", primaryHover: "#059669" } },
      { mode: "light" },
    );
    expect(computed.colors.foregroundOnBrand).toBe(BRAND_DARK_TEXT);

    // Explicit foregroundOnBrand is preserved even when it fails (caller owns it).
    const explicit = createTheme(
      {
        colors: {
          primary: "#10b981",
          primaryHover: "#059669",
          foregroundOnBrand: "#ffffff",
        },
      },
      { mode: "light" },
    );
    expect(explicit.colors.foregroundOnBrand).toBe("#ffffff");
  });

  it("preserves theme text for custom CSS colors that cannot be measured as hex", () => {
    const theme = createTheme({ colors: { primary: "var(--brand)", primaryHover: "oklch(50% 0.2 270)" } });
    expect(theme.colors.foregroundOnBrand).toBe(BRAND_LIGHT_TEXT);
    const dark = createTheme({ colors: { primary: "var(--brand)", primaryHover: "var(--brand-hover)" } }, { mode: "dark" });
    expect(dark.colors.foregroundOnBrand).toBe(BRAND_DARK_TEXT);
  });

  it("emits on-destructive CSS var with fallback; honors explicit optional field", () => {
    const theme = createTheme(undefined, { accentPreset: "blue", mode: "light" });
    expect(typeof theme.colors.foregroundOnDestructive).toBe("string");
    const vars = themeToCssVariables(theme);
    expect(vars["--sx-color-foreground-on-destructive"]).toBe(
      resolveForegroundOnDestructive(theme),
    );
    const withExplicit = {
      ...theme,
      colors: {
        ...theme.colors,
        foregroundOnDestructive: "#123456",
      },
    };
    expect(resolveForegroundOnDestructive(withExplicit)).toBe("#123456");
    expect(themeToCssVariables(withExplicit)["--sx-color-foreground-on-destructive"]).toBe(
      "#123456",
    );
    // Explicit on-destructive survives createTheme merges (caller owns it).
    const kept = createTheme(
      {
        colors: {
          destructive: "#dc2626",
          destructiveHover: "#b91c1c",
          foregroundOnDestructive: "#123456",
        },
      },
      { mode: "light" },
    );
    expect(kept.colors.foregroundOnDestructive).toBe("#123456");
  });
});

describe("ThemeProvider SSR + nested root sync", () => {
  it("renderToString is SSR-safe and stable for supplied mode/accent", () => {
    const first = renderToString(
      <ThemeProvider mode="dark" accentPreset="violet">
        <span>hello</span>
      </ThemeProvider>,
    );
    const second = renderToString(
      <ThemeProvider mode="dark" accentPreset="violet">
        <span>hello</span>
      </ThemeProvider>,
    );
    expect(first).toBe(second);
    expect(first).toContain('data-theme="dark"');
    expect(first).toContain("--sx-color-primary");
    expect(first).toContain("hello");
  });

  it("nested providers: sequential inner mount applies inner tokens; unmount restores outer", () => {
    // Covers the supported pattern only: stable theme props, inner mounted
    // after outer, then unmounted. Simultaneous mount and outer updates
    // while an inner provider is mounted are last-effect-wins on the
    // document root (documented limitation in ThemeProvider).
    const outer = createTheme(undefined, { accentPreset: "blue", mode: "light" });
    const inner = createTheme(undefined, { accentPreset: "rose", mode: "light" });
    const outerVars = themeToCssVariables(outer);
    const innerVars = themeToCssVariables(inner);

    const outerOverride = { colors: { primary: outer.colors.primary } } as const;
    const innerOverride = { colors: { primary: inner.colors.primary } } as const;
    function Inner({ show }: { show: boolean }) {
      return (
        <ThemeProvider theme={outerOverride}>
          <div data-testid="outer-child">outer</div>
          {show ? (
            <ThemeProvider theme={innerOverride}>
              <div data-testid="inner-child">inner</div>
            </ThemeProvider>
          ) : null}
        </ThemeProvider>
      );
    }

    const { rerender, unmount } = render(<Inner show={false} />);
    const root = document.documentElement;
    expect(root.style.getPropertyValue("--sx-color-primary").trim()).toBe(
      String(outerVars["--sx-color-primary"]),
    );

    // Inner mounts after outer: innermost tokens win on document root.
    rerender(<Inner show />);
    expect(root.style.getPropertyValue("--sx-color-primary").trim()).toBe(
      String(innerVars["--sx-color-primary"]),
    );

    // With stable outer props, inner unmount restores the saved outer tokens.
    rerender(<Inner show={false} />);
    expect(root.style.getPropertyValue("--sx-color-primary").trim()).toBe(
      String(outerVars["--sx-color-primary"]),
    );
    unmount();
    cleanup();
  });
});
