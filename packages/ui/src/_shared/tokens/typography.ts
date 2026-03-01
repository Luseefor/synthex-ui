import type { TypographyScale } from "../types";

export const typography: TypographyScale = {
  family: {
    sans: "\"Inter Tight\", \"Segoe UI\", sans-serif",
    mono: "\"JetBrains Mono\", \"SFMono-Regular\", monospace",
  },
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
    "4xl": 36,
  },
  lineHeight: {
    tight: 1.15,
    normal: 1.4,
    relaxed: 1.65,
  },
  weight: {
    medium: "500",
    semibold: "600",
    bold: "700",
  },
};
