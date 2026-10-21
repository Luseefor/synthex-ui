import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "../_shared/variants";
import type { ButtonSharedProps } from "./button.shared";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-[var(--sx-color-primary-hover)]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-[var(--sx-color-destructive-hover)]",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        md: "h-9 px-4 py-2",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly asChild?: boolean;
  readonly size?: ButtonSharedProps["size"];
  readonly variant?: ButtonSharedProps["variant"];
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild = false, children, className, disabled, size, type = "button", variant, ...props }, ref) => {
    if (asChild) {
      const preventActivation = (event: React.SyntheticEvent) => {
        event.preventDefault();
        event.stopPropagation();
      };
      const preventKeyboardActivation = (event: React.KeyboardEvent<HTMLElement>) => {
        if (event.key === "Enter" || event.key === " ") preventActivation(event);
      };
      // Slot composes child handlers before its own. Guard the child's capture
      // handlers too, so a disabled link cannot activate before our guard runs.
      let content = children;
      if (disabled && React.isValidElement<React.HTMLAttributes<HTMLElement> & { disabled?: boolean }>(children)) {
        const originalCapture = children.props.onKeyDownCapture;
        const supportsDisabled = typeof children.type !== "string" || ["button", "input", "select", "textarea", "fieldset", "option", "optgroup"].includes(children.type);
        content = React.cloneElement(children, {
          ...(supportsDisabled ? { disabled: true } : {}),
          "aria-disabled": true,
          tabIndex: -1,
          onClickCapture: preventActivation,
          onKeyDownCapture: (event: React.KeyboardEvent<HTMLElement>) => {
            if (event.key === "Enter" || event.key === " ") preventActivation(event);
            else originalCapture?.(event);
          },
        });
      }
      return (
        <Slot
          ref={ref}
          data-slot="button"
          className={cn(buttonVariants({ variant, size, className }))}
          {...props}
          aria-disabled={disabled ? true : props["aria-disabled"]}
          tabIndex={disabled ? -1 : props.tabIndex}
          onClickCapture={disabled ? preventActivation : props.onClickCapture}
          onKeyDownCapture={disabled ? preventKeyboardActivation : props.onKeyDownCapture}
        >
          {content}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
