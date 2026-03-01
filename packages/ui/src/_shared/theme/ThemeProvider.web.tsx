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
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", resolvedTheme.mode);

    const vars = themeToCssVariables(resolvedTheme);

    for (const [key, value] of Object.entries(vars)) {
      root.style.setProperty(key, value as string);
    }

    return () => {
      root.removeAttribute("data-theme");

      for (const key of Object.keys(vars)) {
        root.style.removeProperty(key);
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
