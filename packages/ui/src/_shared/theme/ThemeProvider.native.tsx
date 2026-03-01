import type { PropsWithChildren } from "react";
import { useMemo } from "react";
import { View } from "react-native";
import { createTheme } from "./createTheme";
import { ThemeContext } from "./context";
import type { ThemeProviderProps } from "../types";

export function ThemeProvider({
  children,
  mode = "light",
  theme,
}: PropsWithChildren<ThemeProviderProps>) {
  const resolvedTheme = useMemo(() => createTheme(theme, { mode }), [mode, theme]);

  return (
    <ThemeContext.Provider value={resolvedTheme}>
      <View
        style={{
          flexShrink: 1,
          backgroundColor: resolvedTheme.colors.background,
        }}
      >
        {children}
      </View>
    </ThemeContext.Provider>
  );
}
