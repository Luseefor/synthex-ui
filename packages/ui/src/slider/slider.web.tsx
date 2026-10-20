import * as React from "react";
import { cn } from "../_shared/variants";
import { useControllableState } from "../hooks/useControllableState";
import type { SliderSharedProps } from "./slider.shared";

export interface SliderProps
  extends Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      "defaultValue" | "disabled" | "max" | "min" | "onChange" | "step" | "value"
    >,
    SliderSharedProps {}

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      className,
      defaultValue = [50],
      disabled = false,
      max = 100,
      min = 0,
      onValueChange,
      onValueCommit,
      orientation = "horizontal",
      step = 1,
      value,
      ...props
    },
    ref,
  ) => {
    const [currentValue, setCurrentValue] = useControllableState<number[]>({
      defaultValue,
      onChange: onValueChange,
      value,
    });
    const percentage = (((currentValue[0] ?? min) - min) / (max - min || 1)) * 100;
    const isVertical = orientation === "vertical";

    const commit = React.useCallback(
      (next: number[]) => {
        onValueCommit?.(next);
      },
      [onValueCommit],
    );

    return (
      <div
        data-disabled={disabled || undefined}
        data-orientation={orientation}
        className={cn(
          "relative flex",
          isVertical ? "h-40 w-10 flex-col items-center justify-center" : "h-10 w-full items-center",
          disabled && "opacity-45",
          className,
        )}
      >
        <div
          className={
            isVertical
              ? "absolute bottom-0 top-0 w-2 rounded-full bg-[color:var(--sx-color-secondary-muted)]"
              : "absolute left-0 right-0 h-2 rounded-full bg-[color:var(--sx-color-secondary-muted)]"
          }
        />
        <div
          aria-hidden="true"
          className={
            isVertical
              ? "absolute bottom-0 w-2 rounded-full bg-[color:var(--sx-color-primary)]"
              : "absolute left-0 h-2 rounded-full bg-[color:var(--sx-color-primary)]"
          }
          style={isVertical ? { height: `${percentage}%` } : { width: `${percentage}%` }}
        />
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          aria-orientation={orientation}
          value={currentValue[0] ?? min}
          className={
            isVertical
              ? "relative z-10 h-40 w-10 cursor-pointer appearance-none bg-transparent accent-[color:var(--sx-color-primary)] disabled:cursor-not-allowed disabled:opacity-45 [writing-mode:vertical-lr] [direction:rtl]"
              : "relative z-10 h-10 w-full cursor-pointer appearance-none bg-transparent disabled:cursor-not-allowed disabled:opacity-45 [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:mt-[-6px] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-[color:var(--sx-color-border-strong)] [&::-webkit-slider-thumb]:bg-[color:var(--sx-color-surface)] [&::-webkit-slider-thumb]:shadow-[0_4px_12px_rgba(15,23,42,0.12)]"
          }
          onChange={(event) => setCurrentValue([Number(event.currentTarget.value)])}
          onPointerUp={() => commit(currentValue)}
          onKeyUp={() => commit(currentValue)}
          onBlur={() => commit(currentValue)}
          {...props}
        />
      </div>
    );
  },
);

Slider.displayName = "Slider";
