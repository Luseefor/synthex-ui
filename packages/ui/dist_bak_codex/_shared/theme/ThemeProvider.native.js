import { jsx as _jsx } from "react/jsx-runtime";
import { useMemo } from "react";
import { View } from "react-native";
import { createTheme } from "./createTheme";
import { ThemeContext } from "./context";
export function ThemeProvider({ accentPreset, children, mode = "light", theme, }) {
    const resolvedTheme = useMemo(() => createTheme(theme, { accentPreset, mode }), [accentPreset, mode, theme]);
    return (_jsx(ThemeContext.Provider, { value: resolvedTheme, children: _jsx(View, { style: {
                flexShrink: 1,
                backgroundColor: resolvedTheme.colors.background,
            }, children: children }) }));
}
