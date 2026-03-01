import * as React from "react";
import { cn } from "../_shared/variants";
import { InputOTPProvider, useInputOTPContext, useInputOTPController, type InputOTPSharedProps } from "./input-otp.shared";

export interface InputOTPProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange" | "value">,
    InputOTPSharedProps {
  readonly children?: React.ReactNode;
}

export function InputOTP({ children, defaultValue, length, onValueChange, value, ...props }: InputOTPProps) {
  const controller = useInputOTPController({ defaultValue, length, onValueChange, value });
  return (
    <InputOTPProvider value={controller}>
      <div {...props}>{children}</div>
    </InputOTPProvider>
  );
}

export const InputOTPGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center gap-2", className)} {...props} />
  ),
);
InputOTPGroup.displayName = "InputOTPGroup";

export interface InputOTPSlotProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value"> {
  readonly index: number;
}

export const InputOTPSlot = React.forwardRef<HTMLInputElement, InputOTPSlotProps>(
  ({ className, index, onChange, onKeyDown, ...props }, ref) => {
    const context = useInputOTPContext();
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    return (
      <input
        ref={inputRef}
        inputMode="numeric"
        maxLength={1}
        value={context.value[index] ?? ""}
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-[var(--sx-radius-md)] border border-[color:var(--sx-color-border-strong)] bg-[color:var(--sx-color-surface)] text-center text-lg font-semibold text-[color:var(--sx-color-foreground)] outline-none transition-colors duration-150 focus:border-[color:var(--sx-color-primary)] focus:ring-2 focus:ring-[color:var(--sx-color-ring)]",
          className,
        )}
        onChange={(event) => {
          const next = event.currentTarget.value.replace(/\s+/g, "");
          context.setValueAt(index, next);
          onChange?.(event);
          if (next && inputRef.current?.nextElementSibling instanceof HTMLInputElement) {
            inputRef.current.nextElementSibling.focus();
          }
        }}
        onKeyDown={(event) => {
          if (
            event.key === "Backspace" &&
            !context.value[index] &&
            inputRef.current?.previousElementSibling instanceof HTMLInputElement
          ) {
            inputRef.current.previousElementSibling.focus();
          }
          onKeyDown?.(event);
        }}
        {...props}
      />
    );
  },
);
InputOTPSlot.displayName = "InputOTPSlot";

export const InputOTPSeparator = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, children = "—", ...props }, ref) => (
    <span ref={ref} className={cn("text-[color:var(--sx-color-foreground-muted)]", className)} {...props}>
      {children}
    </span>
  ),
);
InputOTPSeparator.displayName = "InputOTPSeparator";
