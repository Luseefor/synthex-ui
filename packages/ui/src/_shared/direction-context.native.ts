import * as React from "react";

// Keep the context below component families so copied overlays share direction
// without pulling the whole direction component into every shared-file install.
export const NativeDirectionContext = React.createContext<{
  readonly dir: "ltr" | "rtl";
  readonly setDir: (dir: "ltr" | "rtl") => void;
  readonly toggleDir: () => void;
}>({ dir: "ltr", setDir: () => {}, toggleDir: () => {} });
