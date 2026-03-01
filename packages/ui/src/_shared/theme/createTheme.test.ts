import { describe, expect, it } from "vitest";
import { createTheme, darkTheme } from "./createTheme";

describe("createTheme", () => {
  it("keeps dark surfaces neutral when only accent tokens are overridden", () => {
    const theme = createTheme(
      {
        colors: {
          primary: "#8b5cf6",
          primaryHover: "#7c3aed",
          primaryMuted: "#f5f3ff",
          ring: "#8b5cf6",
        },
      },
      { mode: "dark" },
    );

    expect(theme.colors.background).toBe(darkTheme.colors.background);
    expect(theme.colors.backgroundSubtle).toBe(darkTheme.colors.backgroundSubtle);
    expect(theme.colors.surface).toBe(darkTheme.colors.surface);
    expect(theme.colors.surfaceMuted).toBe(darkTheme.colors.surfaceMuted);
    expect(theme.colors.surfaceRaised).toBe(darkTheme.colors.surfaceRaised);
    expect(theme.colors.primary).toBe("#8b5cf6");
    expect(theme.colors.ring).toBe("#8b5cf6");
  });

  it("resolves accent presets through createTheme without changing dark surfaces", () => {
    const theme = createTheme(undefined, {
      accentPreset: "rose",
      mode: "dark",
    });

    expect(theme.colors.background).toBe(darkTheme.colors.background);
    expect(theme.colors.surface).toBe(darkTheme.colors.surface);
    expect(theme.colors.primary).toBe("#f43f5e");
    expect(theme.colors.ring).toBe("#f43f5e");
  });
});
