import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { cn } from "../_shared/variants";
import { CheckIcon } from "../icons/index.web";
import {
  resolveCheckboxVariants,
  type CheckboxCheckedState,
  type CheckboxVariantProps,
} from "./checkbox.shared";

export interface CheckboxProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
    "checked" | "defaultChecked" | "onCheckedChange"
  > {
  readonly checked?: CheckboxCheckedState;
  readonly defaultChecked?: CheckboxCheckedState;
  readonly invalid?: boolean;
  readonly onCheckedChange?: (checked: boolean) => void;
  readonly uiSize?: CheckboxVariantProps["size"];
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(
  (
    { checked, className, defaultChecked, invalid, onCheckedChange, uiSize, ...props },
    ref,
  ) => {
    const resolved = resolveCheckboxVariants({ invalid, uiSize });
    const isControlled = checked !== undefined;
    // Radix only supports boolean `defaultChecked`; manage the
    // `defaultChecked="indeterminate"` legacy case locally.
    const managesIndeterminate = !isControlled && defaultChecked === "indeterminate";
    const [uncontrolledState, setUncontrolledState] =
      React.useState<CheckboxCheckedState>(defaultChecked ?? false);
    const currentState: CheckboxCheckedState | undefined = managesIndeterminate
      ? uncontrolledState
      : checked;
    const isIndeterminate = currentState === "indeterminate";

    return (
      <CheckboxPrimitive.Root
        ref={ref}
        data-slot="checkbox"
        data-size={resolved.size}
        data-invalid={resolved.tone === "invalid" || undefined}
        checked={managesIndeterminate ? currentState : checked}
        defaultChecked={typeof defaultChecked === "boolean" ? defaultChecked : undefined}
        onCheckedChange={(next) => {
          if (managesIndeterminate) {
            // Preserve "indeterminate" so a native form reset that restores the
            // initial mixed state does not drift to checked.
            setUncontrolledState(next);
          }

          if (next !== "indeterminate") {
            onCheckedChange?.(next);
          }
        }}
        className={cn(
          "peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
          resolved.size === "md" && "h-5 w-5",
          resolved.tone === "invalid" &&
            "border-destructive data-[state=checked]:bg-destructive focus-visible:ring-destructive/30",
          className,
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator
          data-slot="checkbox-indicator"
          className={cn("flex items-center justify-center text-current")}
        >
          {isIndeterminate ? (
            <span className="block h-[2px] w-[10px] rounded-full bg-current" />
          ) : (
            <CheckIcon size={resolved.size === "sm" ? 12 : 14} strokeWidth={2.6} />
          )}
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    );
  },
);

Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
