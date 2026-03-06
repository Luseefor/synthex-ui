import * as React from "react";
import { type InputOTPSharedProps } from "./input-otp.shared";
export interface InputOTPProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange" | "value">, InputOTPSharedProps {
    readonly children?: React.ReactNode;
}
export declare function InputOTP({ children, defaultValue, length, onValueChange, value, ...props }: InputOTPProps): import("react/jsx-runtime").JSX.Element;
export declare const InputOTPGroup: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export interface InputOTPSlotProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value"> {
    readonly index: number;
}
export declare const InputOTPSlot: React.ForwardRefExoticComponent<InputOTPSlotProps & React.RefAttributes<HTMLInputElement>>;
export declare const InputOTPSeparator: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLSpanElement> & React.RefAttributes<HTMLSpanElement>>;
//# sourceMappingURL=input-otp.web.d.ts.map