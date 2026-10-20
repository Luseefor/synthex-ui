import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import type { VariantProps } from "class-variance-authority";
import { cn } from "../_shared/variants";
import { toggleVariants } from "../toggle/toggle.web";
import type { ToggleGroupSharedProps } from "./toggle-group.shared";

const ToggleGroupContext = React.createContext<VariantProps<typeof toggleVariants>>({
  size: "default",
  variant: "default",
});

export interface ToggleGroupProps extends ToggleGroupSharedProps, VariantProps<typeof toggleVariants> {
  readonly children?: React.ReactNode;
  readonly className?: string;
  readonly defaultValue?: string | string[];
  readonly dir?: "ltr" | "rtl";
  readonly loop?: boolean;
  readonly orientation?: "horizontal" | "vertical";
  readonly rovingFocus?: boolean;
}

function ToggleGroup({
  children,
  className,
  defaultValue,
  dir,
  disabled,
  loop,
  onValueChange,
  orientation,
  rovingFocus,
  size,
  type = "single",
  value,
  variant,
}: ToggleGroupProps) {
  const contextValue = React.useMemo(() => ({ size, variant }), [size, variant]);
  const rootClassName = cn("flex w-fit items-center gap-1", className);
  const sharedProps = {
    "data-slot": "toggle-group",
    "data-variant": variant ?? undefined,
    "data-size": size ?? undefined,
    className: rootClassName,
    dir,
    disabled,
    loop,
    orientation,
    rovingFocus,
  } as const;

  return (
    <ToggleGroupContext.Provider value={contextValue}>
      {type === "multiple" ? (
        <ToggleGroupPrimitive.Root
          {...sharedProps}
          type="multiple"
          defaultValue={defaultValue as string[] | undefined}
          value={value as string[] | undefined}
          onValueChange={onValueChange as ((value: string[]) => void) | undefined}
        >
          {children}
        </ToggleGroupPrimitive.Root>
      ) : (
        <ToggleGroupPrimitive.Root
          {...sharedProps}
          type="single"
          defaultValue={defaultValue as string | undefined}
          value={value as string | undefined}
          onValueChange={onValueChange as ((value: string) => void) | undefined}
        >
          {children}
        </ToggleGroupPrimitive.Root>
      )}
    </ToggleGroupContext.Provider>
  );
}

export interface ToggleGroupItemProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>,
    "value"
  >,
    VariantProps<typeof toggleVariants> {
  readonly value: string;
}

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  ToggleGroupItemProps
>(({ className, size, variant, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext);

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      data-slot="toggle-group-item"
      data-variant={variant ?? context.variant ?? undefined}
      data-size={size ?? context.size ?? undefined}
      className={cn(
        toggleVariants({
          size: size ?? context.size ?? undefined,
          variant: variant ?? context.variant ?? undefined,
        }),
        className,
      )}
      {...props}
    />
  );
});

ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;

export { ToggleGroup, ToggleGroupItem };
