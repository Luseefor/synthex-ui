import { createContext, useContext } from "react";
import { defaultTheme } from "./createTheme";
import type { SynthexTheme } from "../types";

// Null default so missing providers are detectable. useTheme() falls back to
// defaultTheme (light) so standalone native components and tests keep rendering;
// use useThemeStrict() when a provider is required.
export const ThemeContext = createContext<SynthexTheme | null>(null);
ThemeContext.displayName = "SynthexThemeContext";

export function useTheme(): SynthexTheme {
  return useContext(ThemeContext) ?? defaultTheme;
}

export function useThemeOptional(): SynthexTheme | null {
  return useContext(ThemeContext);
}

export function useThemeStrict(): SynthexTheme {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error("useThemeStrict must be used within a <ThemeProvider>");
  }
  return theme;
}
