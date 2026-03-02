import type { ReactNode } from "react";

export type DirectionMode = "ltr" | "rtl";

export interface DirectionContextType {
  readonly dir: DirectionMode;
  readonly setDir: (dir: DirectionMode) => void;
  readonly toggleDir: () => void;
}

export interface DirectionProviderSharedProps {
  readonly children: ReactNode;
  readonly dir?: DirectionMode;
  readonly onDirChange?: (dir: DirectionMode) => void;
}
