"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "synthex-ui/theme";

export function Providers({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
