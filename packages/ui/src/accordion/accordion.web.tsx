import * as React from "react";
import { cn } from "../_shared/variants";
import { ChevronDownIcon } from "../icons/index.web";
import {
  AccordionItemProvider,
  AccordionProvider,
  useAccordionContext,
  useAccordionController,
  useAccordionItemContext,
  type AccordionItemSharedProps,
  type AccordionSharedProps,
} from "./accordion.shared";

export interface AccordionProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange">,
    AccordionSharedProps {}

export function Accordion({
  children,
  className,
  collapsible,
  defaultValue,
  onValueChange,
  type,
  value,
  ...props
}: AccordionProps) {
  const controller = useAccordionController({
    collapsible,
    defaultValue,
    onValueChange,
    type,
    value,
  });

  return (
    <AccordionProvider value={controller}>
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </AccordionProvider>
  );
}

export interface AccordionItemProps
  extends React.HTMLAttributes<HTMLDivElement>,
    AccordionItemSharedProps {}

export const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ children, className, value, ...props }, ref) => (
    <AccordionItemProvider value={{ value }}>
      <div
        ref={ref}
        className={cn(
          "border-b border-[color:var(--sx-color-border)] last:border-b-0",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </AccordionItemProvider>
  ),
);

AccordionItem.displayName = "AccordionItem";

export const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, className, onClick, ...props }, ref) => {
  const accordion = useAccordionContext();
  const item = useAccordionItemContext();
  const open = accordion.isItemOpen(item.value);

  return (
    <button
      ref={ref}
      type="button"
      aria-expanded={open}
      className={cn(
        "flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium tracking-[-0.01em] text-[color:var(--sx-color-foreground)] transition-colors duration-[var(--sx-motion-fast)] hover:text-[color:var(--sx-color-primary)]",
        className,
      )}
      onClick={(event) => {
        accordion.toggleItem(item.value);
        onClick?.(event);
      }}
      {...props}
    >
      <span>{children}</span>
      <span className={cn("transition-transform duration-[var(--sx-motion-fast)]", open && "rotate-180")}>
        <ChevronDownIcon size={16} strokeWidth={2} />
      </span>
    </button>
  );
});

AccordionTrigger.displayName = "AccordionTrigger";

export const AccordionContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  const accordion = useAccordionContext();
  const item = useAccordionItemContext();
  const open = accordion.isItemOpen(item.value);

  return (
    <div
      ref={ref}
      hidden={!open}
      className={cn("pb-4 text-sm text-[color:var(--sx-color-foreground-muted)]", className)}
      {...props}
    >
      {children}
    </div>
  );
});

AccordionContent.displayName = "AccordionContent";
