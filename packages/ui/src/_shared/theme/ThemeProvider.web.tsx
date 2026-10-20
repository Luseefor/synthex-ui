import type { CSSProperties, PropsWithChildren } from "react";
import { useEffect, useMemo } from "react";
import { createTheme, themeToCssVariables } from "./createTheme";
import { ThemeContext } from "./context";
import type { ThemeProviderProps } from "../types";

export function ThemeProvider({
  accentPreset,
  children,
  mode = "light",
  theme,
}: PropsWithChildren<ThemeProviderProps>) {
  const resolvedTheme = useMemo(
    () => createTheme(theme, { accentPreset, mode }),
    [accentPreset, mode, theme],
  );
  const style = useMemo<CSSProperties>(
    () =>
      ({
        ...themeToCssVariables(resolvedTheme),
        backgroundColor: "var(--sx-color-background)",
        color: "var(--sx-color-foreground)",
        fontFamily: "var(--sx-font-family-sans)",
      }) as CSSProperties,
    [resolvedTheme],
  );

  // Sync theme to document root so portalled components (Sheet, Dialog, etc.)
  // rendered via createPortal to document.body inherit the correct mode and tokens.
  // Save/restore previous values so nested providers and StrictMode remounts
  // don't wipe an outer provider's tokens on cleanup.
  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    const root = document.documentElement;
    const prevTheme = root.getAttribute("data-theme");

    const vars = themeToCssVariables(resolvedTheme);
    const prevVars = new Map<string, string | null>();
    for (const key of Object.keys(vars)) {
      const current = root.style.getPropertyValue(key);
      prevVars.set(key, current === "" ? null : current);
    }

    root.setAttribute("data-theme", resolvedTheme.mode);

    for (const [key, value] of Object.entries(vars)) {
      root.style.setProperty(key, value as string);
    }

    return () => {
      if (prevTheme === null) {
        root.removeAttribute("data-theme");
      } else {
        root.setAttribute("data-theme", prevTheme);
      }

      for (const [key, prev] of prevVars) {
        if (prev === null) {
          root.style.removeProperty(key);
        } else {
          root.style.setProperty(key, prev);
        }
      }
    };
  }, [resolvedTheme]);

  return (
    <ThemeContext.Provider value={resolvedTheme}>
      <div
        style={style}
        data-theme={resolvedTheme.mode}
        data-synthex-theme="web"
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
