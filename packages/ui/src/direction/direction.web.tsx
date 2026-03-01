import * as React from "react";
import type { DirectionMode, DirectionProviderSharedProps } from "./direction.shared";

const DirectionContext = React.createContext<DirectionMode>("ltr");

export interface DirectionProviderProps extends DirectionProviderSharedProps {}

export function DirectionProvider({ children, dir = "ltr" }: DirectionProviderProps) {
  return (
    <DirectionContext.Provider value={dir}>
      <div dir={dir}>{children}</div>
    </DirectionContext.Provider>
  );
}

export function useDirection() {
  return React.useContext(DirectionContext);
}
