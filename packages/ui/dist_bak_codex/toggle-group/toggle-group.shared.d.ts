import * as React from "react";
export interface ToggleGroupSharedProps {
    readonly disabled?: boolean;
    readonly onValueChange?: (value: string | string[]) => void;
    readonly type?: "single" | "multiple";
    readonly value?: string | string[];
}
interface ToggleGroupContextValue {
    readonly disabled: boolean;
    readonly isPressed: (value: string) => boolean;
    readonly toggleValue: (value: string) => void;
}
export declare function useToggleGroupContext(): ToggleGroupContextValue;
export declare function ToggleGroupProvider({ children, value, }: {
    readonly children: React.ReactNode;
    readonly value: ToggleGroupContextValue;
}): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=toggle-group.shared.d.ts.map