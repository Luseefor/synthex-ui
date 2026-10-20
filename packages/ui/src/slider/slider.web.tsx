import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "../_shared/variants";

export interface SliderProps extends React.ComponentPropsWithoutRef<
  typeof SliderPrimitive.Root
> {}

function thumbCount(value?: number[], defaultValue?: number[]): number {
  if (value !== undefined) {
    return Math.max(value.length, 1);
  }

  if (defaultValue !== undefined) {
    return Math.max(defaultValue.length, 1);
  }

  return 1;
}

const Slider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, SliderProps>(
  (
    {
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      className,
      defaultValue,
      disabled,
      max,
      min,
      onValueChange,
      onValueCommit,
      orientation,
      step,
      value,
      ...props
    },
    ref,
  ) => {
    const normalizedValue = value && value.length > 0 ? value : undefined;
    const normalizedDefaultValue =
      defaultValue && defaultValue.length > 0 ? defaultValue : undefined;
    const count = thumbCount(normalizedValue, normalizedDefaultValue);

    return (
      <SliderPrimitive.Root
        ref={ref}
        data-slot="slider"
        data-orientation={orientation ?? "horizontal"}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        orientation={orientation}
        value={normalizedValue}
        defaultValue={normalizedDefaultValue}
        onValueChange={onValueChange}
        onValueCommit={onValueCommit}
        className={cn(
          "relative flex w-full touch-none select-none items-center data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
          className,
        )}
        {...props}
      >
        <SliderPrimitive.Track
          data-slot="slider-track"
          data-orientation={orientation ?? "horizontal"}
          className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20 data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5 data-[orientation=vertical]:flex-col"
        >
          <SliderPrimitive.Range
            data-slot="slider-range"
            data-orientation={orientation ?? "horizontal"}
            className="absolute h-full bg-primary data-[orientation=vertical]:w-full"
          />
        </SliderPrimitive.Track>
        {Array.from({ length: count }).map((_, index) => (
          <SliderPrimitive.Thumb
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            data-slot="slider-thumb"
            aria-label={
              ariaLabel !== undefined && count > 1 ? `${ariaLabel} ${index + 1}` : (ariaLabel ?? `Value ${index + 1}`)
            }
            aria-labelledby={ariaLabel === undefined ? ariaLabelledBy : undefined}
            className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          />
        ))}
      </SliderPrimitive.Root>
    );
  },
);

Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
