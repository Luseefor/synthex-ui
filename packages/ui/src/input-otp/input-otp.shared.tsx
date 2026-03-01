import * as React from "react";
import { useControllableState } from "../hooks/useControllableState";

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

const InputOTPContext = React.createContext<InputOTPContextValue | null>(null);

export function useInputOTPController(props: InputOTPSharedProps): InputOTPContextValue {
  const length = props.length ?? 6;
  const [value, setValue] = useControllableState<string>({
    defaultValue: props.defaultValue ?? "",
    onChange: props.onValueChange,
    value: props.value,
  });

  return React.useMemo(
    () => ({
      length,
      setValueAt(index: number, next: string) {
        const chars = Array.from({ length }, (_, currentIndex) => value[currentIndex] ?? "");
        chars[index] = next.slice(-1);
        setValue(chars.join(""));
      },
      value,
    }),
    [length, setValue, value],
  );
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
