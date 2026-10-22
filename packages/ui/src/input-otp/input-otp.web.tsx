import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { Minus } from "lucide-react";
import { cn } from "../_shared/variants";
import type { InputOTPSharedProps } from "./input-otp.shared";

export interface InputOTPProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof OTPInput>,
    "children" | "maxLength" | "onChange" | "render" | "value"
  > {
  readonly children?: React.ReactNode;
  readonly length?: number;
  readonly maxLength?: number;
  readonly onChange?: (value: string) => void;
  readonly onValueChange?: InputOTPSharedProps["onValueChange"];
  readonly value?: string;
  readonly ref?: React.Ref<HTMLInputElement>;
}

function InputOTP({
  children,
  className,
  containerClassName,
  defaultValue,
  length,
  maxLength = 6,
  onChange,
  onValueChange,
  value,
  ref,
  ...props
}: InputOTPProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState<string>(
    typeof defaultValue === "string" ? defaultValue : "",
  );
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : uncontrolledValue;
  const handleChange = React.useCallback(
    (next: string) => {
      if (!isControlled) {
        setUncontrolledValue(next);
      }
      onChange?.(next);
      onValueChange?.(next);
    },
    [isControlled, onChange, onValueChange],
  );
  return (
    <OTPInput
      ref={ref}
      data-slot="input-otp"
      containerClassName={cn("flex items-center gap-2 has-disabled:opacity-50", containerClassName)}
      maxLength={length ?? maxLength}
      value={currentValue}
      onChange={handleChange}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    >
      {children}
    </OTPInput>
  );
}

export interface InputOTPGroupProps extends React.ComponentPropsWithoutRef<"div"> {}

function InputOTPGroup({ className, ...props }: InputOTPGroupProps) {
  return (
    <div data-slot="input-otp-group" className={cn("flex items-center", className)} {...props} />
  );
}

export interface InputOTPSlotProps extends React.ComponentPropsWithoutRef<"div"> {
  readonly index: number;
}

function InputOTPSlot({ className, index, ...props }: InputOTPSlotProps) {
  const inputOTPContext = React.useContext(OTPInputContext);
  const slot = inputOTPContext?.slots[index];
  const { char, hasFakeCaret, isActive } = slot ?? {
    char: null,
    hasFakeCaret: false,
    isActive: false,
  };

  return (
    <div
      data-slot="input-otp-slot"
      data-index={index}
      data-active={isActive}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center border-y border-r border-input text-sm shadow-xs transition-all outline-none first:rounded-l-md first:border-l last:rounded-r-md data-active:z-10 data-active:ring-1 data-active:ring-ring",
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink bg-foreground h-4 w-px duration-1000" />
        </div>
      ) : null}
    </div>
  );
}

export interface InputOTPSeparatorProps extends React.ComponentPropsWithoutRef<"div"> {}

function InputOTPSeparator({ children, ...props }: InputOTPSeparatorProps) {
  return (
    <div data-slot="input-otp-separator" role="separator" {...props}>
      {children ?? <Minus size={16} aria-hidden="true" />}
    </div>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot };
