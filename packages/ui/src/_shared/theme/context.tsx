import { createContext, useContext } from "react";
import { defaultTheme } from "./createTheme";
import type { SynthexTheme } from "../types";

export const ThemeContext = createContext<SynthexTheme>(defaultTheme);

export function useTheme(): SynthexTheme {
  return useContext(ThemeContext);
}
