import type { ReactNode } from "react";

export type DirectionMode = "ltr" | "rtl";

export interface DirectionProviderSharedProps {
  readonly children: ReactNode;
  readonly dir?: DirectionMode;
}
