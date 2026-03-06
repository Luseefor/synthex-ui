import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useMemo } from "react";
import { createTheme, themeToCssVariables } from "./createTheme";
import { ThemeContext } from "./context";
export function ThemeProvider({ accentPreset, children, mode = "light", theme, }) {
    const resolvedTheme = useMemo(() => createTheme(theme, { accentPreset, mode }), [accentPreset, mode, theme]);
    const style = useMemo(() => ({
        ...themeToCssVariables(resolvedTheme),
        backgroundColor: "var(--sx-color-background)",
        color: "var(--sx-color-foreground)",
        fontFamily: "var(--sx-font-family-sans)",
    }), [resolvedTheme]);
    // Sync theme to document root so portalled components (Sheet, Dialog, etc.)
    // rendered via createPortal to document.body inherit the correct mode and tokens.
    useEffect(() => {
        const root = document.documentElement;
        root.setAttribute("data-theme", resolvedTheme.mode);
        const vars = themeToCssVariables(resolvedTheme);
        for (const [key, value] of Object.entries(vars)) {
            root.style.setProperty(key, value);
        }
        return () => {
            root.removeAttribute("data-theme");
            for (const key of Object.keys(vars)) {
                root.style.removeProperty(key);
            }
        };
    }, [resolvedTheme]);
    return (_jsx(ThemeContext.Provider, { value: resolvedTheme, children: _jsx("div", { style: style, "data-theme": resolvedTheme.mode, "data-synthex-theme": "web", children: children }) }));
}
