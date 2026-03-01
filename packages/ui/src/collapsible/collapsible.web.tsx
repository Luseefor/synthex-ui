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

export const CollapsibleTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ children, onClick, type = "button", ...props }, ref) => {
    const context = useCollapsibleContext();
    return (
      <button
        ref={ref}
        type={type}
        aria-expanded={context.open}
        disabled={context.disabled}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented && !context.disabled) {
            context.setOpen(!context.open);
          }
        }}
        {...props}
      >
        {children}
      </button>
    );
  },
);
CollapsibleTrigger.displayName = "CollapsibleTrigger";

export const CollapsibleContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, hidden, ...props }, ref) => {
    const context = useCollapsibleContext();
    if (!context.open) {
      return null;
    }
    return (
      <div
        ref={ref}
        hidden={hidden ?? !context.open}
        data-state={context.open ? "open" : "closed"}
        className={cn("data-[state=closed]:hidden", className)}
        {...props}
      />
    );
  },
);
CollapsibleContent.displayName = "CollapsibleContent";
