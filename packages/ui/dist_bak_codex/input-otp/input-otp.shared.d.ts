import * as React from "react";
export interface InputOTPSharedProps {
    readonly defaultValue?: string;
    readonly length?: number;
    readonly onValueChange?: (value: string) => void;
    readonly value?: string;
}
interface InputOTPContextValue {
    readonly length: number;
    readonly setValueAt: (index: number, next: string) => void;
    readonly value: string;
}
export declare function useInputOTPController(props: InputOTPSharedProps): InputOTPContextValue;
export declare function InputOTPProvider({ children, value }: {
    readonly children: React.ReactNode;
    readonly value: InputOTPContextValue;
}): import("react/jsx-runtime").JSX.Element;
export declare function useInputOTPContext(): InputOTPContextValue;
export {};
//# sourceMappingURL=input-otp.shared.d.ts.map