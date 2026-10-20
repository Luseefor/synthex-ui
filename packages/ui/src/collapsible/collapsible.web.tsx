import * as React from "react";
import { cn } from "../_shared/variants";
import {
  CollapsibleProvider,
  useCollapsibleContext,
  useCollapsibleController,
  type CollapsibleSharedProps,
} from "./collapsible.shared";

export interface CollapsibleProps extends React.HTMLAttributes<HTMLDivElement>, CollapsibleSharedProps {
  readonly children?: React.ReactNode;
}

export function Collapsible({ children, defaultOpen, disabled, onOpenChange, open, ...props }: CollapsibleProps) {
  const controller = useCollapsibleController({ defaultOpen, disabled, onOpenChange, open });
  return (
    <CollapsibleProvider value={controller}>
      <div data-state={controller.open ? "open" : "closed"} {...props}>{children}</div>
    </CollapsibleProvider>
  );
}

export const CollapsibleTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { readonly asChild?: boolean }
>(
  ({ children, onClick, type = "button", asChild, ...props }, ref) => {
    const context = useCollapsibleContext();

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented && !context.disabled) {
        context.setOpen(!context.open);
      }
    };

    type AsChildProps = {
      onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
      [key: string]: unknown;
    };

    if (asChild && React.isValidElement<AsChildProps>(children)) {
      return React.cloneElement(children, {
        ref,
        "aria-expanded": context.open,
        disabled: context.disabled,
        ...props,
        onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
          handleClick(e);
          children.props.onClick?.(e);
        },
      });
    }

    return (
      <button
        ref={ref}
        type={type}
        aria-expanded={context.open}
        disabled={context.disabled}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    );
  },
);
CollapsibleTrigger.displayName = "CollapsibleTrigger";

export const CollapsibleContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { readonly forceMount?: boolean; readonly asChild?: boolean }
>(
  ({ children, className, forceMount = false, hidden, asChild, ...props }, ref) => {
    const context = useCollapsibleContext();
    if (!context.open && !forceMount) {
      return null;
    }
    if (asChild && React.isValidElement<Record<string, unknown>>(children)) {
      return React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        ref,
        hidden: hidden ?? !context.open,
        ...props,
        "data-state": context.open ? "open" : "closed",
      });
    }
    return (
      <div
        ref={ref}
        hidden={hidden ?? !context.open}
        data-state={context.open ? "open" : "closed"}
        className={cn("data-[state=closed]:hidden", className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);
CollapsibleContent.displayName = "CollapsibleContent";
