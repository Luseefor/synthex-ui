import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { cn } from "../_shared/variants";
import { InputOTPProvider, useInputOTPContext, useInputOTPController } from "./input-otp.shared";
export function InputOTP({ children, defaultValue, length, onValueChange, value, ...props }) {
    const controller = useInputOTPController({ defaultValue, length, onValueChange, value });
    return (_jsx(InputOTPProvider, { value: controller, children: _jsx("div", { ...props, children: children }) }));
}
export const InputOTPGroup = React.forwardRef(({ className, ...props }, ref) => (_jsx("div", { ref: ref, className: cn("flex max-w-full flex-wrap items-center gap-2", className), ...props })));
InputOTPGroup.displayName = "InputOTPGroup";
export const InputOTPSlot = React.forwardRef(({ className, index, onChange, onKeyDown, ...props }, ref) => {
    const context = useInputOTPContext();
    const inputRef = React.useRef(null);
    React.useImperativeHandle(ref, () => inputRef.current);
    return (_jsx("input", { ref: inputRef, inputMode: "numeric", maxLength: 1, value: context.value[index] ?? "", className: cn("flex h-11 w-11 items-center justify-center rounded-[var(--sx-radius-md)] border border-[color:var(--sx-color-border-strong)] bg-[color:var(--sx-color-surface)] text-center text-lg font-semibold text-[color:var(--sx-color-foreground)] outline-none transition-colors duration-[var(--sx-motion-fast)] focus:border-[color:var(--sx-color-primary)] focus:ring-2 focus:ring-[color:var(--sx-color-ring)]", className), onChange: (event) => {
            const next = event.currentTarget.value.replace(/\s+/g, "");
            context.setValueAt(index, next);
            onChange?.(event);
            if (next && inputRef.current?.nextElementSibling instanceof HTMLInputElement) {
                inputRef.current.nextElementSibling.focus();
            }
        }, onKeyDown: (event) => {
            if (event.key === "Backspace" &&
                !context.value[index] &&
                inputRef.current?.previousElementSibling instanceof HTMLInputElement) {
                inputRef.current.previousElementSibling.focus();
            }
            onKeyDown?.(event);
        }, ...props }));
});
InputOTPSlot.displayName = "InputOTPSlot";
export const InputOTPSeparator = React.forwardRef(({ className, children = "—", ...props }, ref) => (_jsx("span", { ref: ref, className: cn("text-[color:var(--sx-color-foreground-muted)]", className), ...props, children: children })));
InputOTPSeparator.displayName = "InputOTPSeparator";
