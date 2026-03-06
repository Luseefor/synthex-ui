import type { DirectionContextType, DirectionProviderSharedProps } from "./direction.shared";
export interface DirectionProviderProps extends DirectionProviderSharedProps {
}
export declare function DirectionProvider({ children, dir: dirProp, onDirChange: onDirChangeProp }: DirectionProviderProps): import("react/jsx-runtime").JSX.Element;
export declare function useDirection(): DirectionContextType;
//# sourceMappingURL=direction.web.d.ts.map