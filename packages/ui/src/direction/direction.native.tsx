import * as React from "react";
import { View } from "react-native";
import type { DirectionContextType, DirectionMode, DirectionProviderSharedProps } from "./direction.shared";
import { useControllableState } from "../hooks/useControllableState";

const DirectionContext = React.createContext<DirectionContextType>({
  dir: "ltr",
  setDir: () => { },
  toggleDir: () => { },
});

export interface DirectionProviderProps extends DirectionProviderSharedProps { }

export function DirectionProvider({ children, dir: dirProp, onDirChange: onDirChangeProp }: DirectionProviderProps) {
  const [dir, setDir] = useControllableState<DirectionMode>({
    defaultValue: "ltr",
    value: dirProp,
    onChange: onDirChangeProp,
  });

  const toggleDir = React.useCallback(() => {
    setDir(dir === "ltr" ? "rtl" : "ltr");
  }, [dir, setDir]);

  const value = React.useMemo(() => ({ dir, setDir, toggleDir }), [dir, setDir, toggleDir]);

  return (
    <DirectionContext.Provider value={value}>
      <View style={{ direction: dir, flex: 1 }}>{children}</View>
    </DirectionContext.Provider>
  );
}

export function useDirection() {
  return React.useContext(DirectionContext);
}
