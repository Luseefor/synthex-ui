import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { useControllableState } from "../hooks/useControllableState";
const DirectionContext = React.createContext({
    dir: "ltr",
    setDir: () => { },
    toggleDir: () => { },
});
export function DirectionProvider({ children, dir: dirProp, onDirChange: onDirChangeProp }) {
    const [dir, setDir] = useControllableState({
        defaultValue: "ltr",
        value: dirProp,
        onChange: onDirChangeProp,
    });
    const toggleDir = React.useCallback(() => {
        setDir(dir === "ltr" ? "rtl" : "ltr");
    }, [dir, setDir]);
    const value = React.useMemo(() => ({ dir, setDir, toggleDir }), [dir, setDir, toggleDir]);
    return (_jsx(DirectionContext.Provider, { value: value, children: _jsx("div", { dir: dir, className: "min-h-full", children: children }) }));
}
export function useDirection() {
    return React.useContext(DirectionContext);
}
