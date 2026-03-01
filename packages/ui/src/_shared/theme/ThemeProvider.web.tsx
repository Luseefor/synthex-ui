import type { CSSProperties, PropsWithChildren } from "react";
import { useMemo } from "react";
import { createTheme, themeToCssVariables } from "./createTheme";
import { ThemeContext } from "./context";
import type { ThemeProviderProps } from "../types";

export function ThemeProvider({
  children,
  mode = "light",
  theme,
}: PropsWithChildren<ThemeProviderProps>) {
  const resolvedTheme = useMemo(() => createTheme(theme, { mode }), [mode, theme]);
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
