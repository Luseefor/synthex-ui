import * as React from "react";
import { cn } from "../_shared/variants";
import {
  RadioGroupProvider,
  useRadioGroupContext,
  useRadioGroupController,
  type RadioGroupItemSharedProps,
  type RadioGroupSharedProps,
} from "./radio-group.shared";

export interface RadioGroupProps
  extends Omit<
      React.HTMLAttributes<HTMLDivElement>,
      "defaultValue" | "onChange" | "value"
    >,
    RadioGroupSharedProps {}

export function RadioGroup({
  children,
  className,
  defaultValue,
  disabled = false,
  onValueChange,
  value,
  ...props
}: RadioGroupProps) {
  const controller = useRadioGroupController({ defaultValue, disabled, onValueChange, value });

  return (
    <RadioGroupProvider value={controller}>
      <div
        role="radiogroup"
        aria-disabled={disabled || undefined}
        data-disabled={disabled || undefined}
        className={cn("grid gap-3", className)}
        {...props}
      >
        {children}
      </div>
    </RadioGroupProvider>
  );
}

export interface RadioGroupItemProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "disabled" | "value">,
    RadioGroupItemSharedProps {}

function getEnabledTriggers(group: HTMLElement | null): HTMLElement[] {
  if (!group) {
    return [];
  }
  return Array.from(group.querySelectorAll<HTMLElement>('[role="radio"]:not([disabled])'));
}

function getEnabledValuesInDomOrder(group: HTMLElement | null): string[] {
  return getEnabledTriggers(group).map((el) => el.getAttribute("data-value") ?? "");
}

export const RadioGroupItem = React.forwardRef<HTMLButtonElement, RadioGroupItemProps>(
  ({ children, className, disabled: itemDisabled, onClick, onKeyDown, value, ...props }, ref) => {
    const context = useRadioGroupContext();
    const isActive = context.value === value;
    const effectiveDisabled = Boolean(itemDisabled ?? context.disabled);
    const { registerItem, unregisterItem } = context;

    React.useEffect(() => {
      registerItem(value, effectiveDisabled);
      return () => unregisterItem(value);
    }, [registerItem, unregisterItem, value, effectiveDisabled]);

    const hasSelection = context.items.some(
      (entry) => !entry.disabled && entry.value === context.value,
    );
    const firstEnabled = context.items.find((entry) => !entry.disabled)?.value;
    const tabIndex = effectiveDisabled
      ? -1
      : isActive
        ? 0
        : !hasSelection && (firstEnabled === undefined || firstEnabled === value)
          ? 0
          : -1;

    return (
      <button
        ref={ref}
        type="button"
        role="radio"
        aria-checked={isActive}
        data-state={isActive ? "checked" : "unchecked"}
        data-value={value}
        data-disabled={effectiveDisabled || undefined}
        disabled={effectiveDisabled}
        tabIndex={tabIndex}
        className={cn(
          "inline-flex items-center gap-3 rounded-[var(--sx-radius-md)] px-1 py-1 text-left text-sm font-medium text-[color:var(--sx-color-foreground)] transition-colors duration-[var(--sx-motion-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sx-color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--sx-color-background)] disabled:pointer-events-none disabled:opacity-45",
          className,
        )}
        onClick={(event) => {
          if (effectiveDisabled) {
            return;
          }
          context.setValue(value);
          onClick?.(event);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented || effectiveDisabled) {
            return;
          }
          const group = (event.currentTarget as HTMLElement).closest<HTMLElement>(
            '[role="radiogroup"]',
          );
          const enabledValues = getEnabledValuesInDomOrder(group);
          const list = enabledValues.length > 0 ? enabledValues : context.items.filter((e) => !e.disabled).map((e) => e.value);
          if (list.length === 0) {
            return;
          }
          const currentIndex = list.indexOf(value);
          if (currentIndex === -1) {
            return;
          }
          let nextIndex: number | undefined;
          switch (event.key) {
            case "ArrowDown":
            case "ArrowRight":
              nextIndex = (currentIndex + 1) % list.length;
              break;
            case "ArrowUp":
            case "ArrowLeft":
              nextIndex = (currentIndex - 1 + list.length) % list.length;
              break;
            case "Home":
              nextIndex = 0;
              break;
            case "End":
              nextIndex = list.length - 1;
              break;
            default:
              return;
          }
          event.preventDefault();
          const nextValue = list[nextIndex];
          if (nextValue !== undefined) {
            context.setValue(nextValue);
            getEnabledTriggers(group)[nextIndex]?.focus();
          }
        }}
        {...props}
      >
        <span
          aria-hidden="true"
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-[border-color,box-shadow] duration-[var(--sx-motion-fast)]",
            isActive
              ? "border-[color:var(--sx-color-primary)] shadow-[0_0_0_4px_color-mix(in_srgb,var(--sx-color-primary)_12%,transparent)]"
              : "border-[color:var(--sx-color-border-strong)]",
          )}
        >
          <span
            className={cn(
              "h-2.5 w-2.5 rounded-full bg-[color:var(--sx-color-primary)] transition-[transform,opacity] duration-[var(--sx-motion-fast)]",
              isActive ? "scale-100 opacity-100" : "scale-50 opacity-0",
            )}
          />
        </span>
        <span>{children}</span>
      </button>
    );
  },
);

RadioGroupItem.displayName = "RadioGroupItem";
