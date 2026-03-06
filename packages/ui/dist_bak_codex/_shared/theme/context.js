import { createContext, useContext } from "react";
import { defaultTheme } from "./createTheme";
export const ThemeContext = createContext(defaultTheme);
export function useTheme() {
    return useContext(ThemeContext);
}
