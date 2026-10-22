import * as React from "react";
import { useControllableState } from "../hooks/useControllableState";
import { deleteOTPValue, editOTPValue, type OTPEditResult } from "./input-otp.edit";

export { deleteOTPValue, editOTPValue };
export type { OTPEditResult };

export interface InputOTPSharedProps {
  readonly defaultValue?: string;
  readonly length?: number;
  readonly onValueChange?: (value: string) => void;
  readonly value?: string;
}

export interface InputOTPContextValue {
  readonly deleteValueAt: (index: number) => OTPEditResult;
  readonly length: number;
  readonly setValueAt: (index: number, next: string) => OTPEditResult;
  readonly value: string;
}

const InputOTPContext = React.createContext<InputOTPContextValue | null>(null);

export function useInputOTPController(props: InputOTPSharedProps): InputOTPContextValue {
  const length = props.length ?? 6;
  if (!Number.isInteger(length) || length <= 0) {
    throw new RangeError("OTP length must be a positive integer.");
  }
  const [rawValue, setValue] = useControllableState<string>({
    defaultValue: props.defaultValue ?? "",
    onChange: props.onValueChange,
    value: props.value,
  });

  return React.useMemo(() => {
    const canonical = Array.from(rawValue).slice(0, length).join("");
    return {
      length,
      deleteValueAt(index: number) {
        const result = deleteOTPValue(canonical, length, index);
        if (result.value !== canonical) {
          setValue(result.value);
        }
        return result;
      },
      setValueAt(index: number, next: string) {
        const result = editOTPValue(canonical, length, index, next);
        if (result.value !== canonical) {
          setValue(result.value);
        }
        return result;
      },
      value: canonical,
    };
  }, [length, setValue, rawValue]);
}

export function InputOTPProvider({ children, value }: { readonly children: React.ReactNode; readonly value: InputOTPContextValue }) {
  return <InputOTPContext.Provider value={value}>{children}</InputOTPContext.Provider>;
}

export function useInputOTPContext() {
  const context = React.useContext(InputOTPContext);
  if (!context) {
    throw new Error("InputOTP components must be used within <InputOTP>.");
  }
  return context;
}
