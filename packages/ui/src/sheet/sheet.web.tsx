import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "../_shared/variants";
import { useA11yId, useFocusTrap } from "../_shared/a11y.web";
import { CloseIcon } from "../icons/index.web";
import {
  DialogProvider as SheetProvider,
  useDialogContext as useSheetContext,
  useDialogController as useSheetController,
  type DialogSharedProps,
} from "../dialog/dialog.shared";

export interface SheetProps extends DialogSharedProps {
  readonly children: React.ReactNode;
}

export function Sheet({ children, defaultOpen, onOpenChange, open }: SheetProps) {
  const controller = useSheetController({ defaultOpen, onOpenChange, open });

  return <SheetProvider value={controller}>{children}</SheetProvider>;
}

export const SheetTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ children, onClick, type = "button", asChild, ...props }, ref) => {
  const context = useSheetContext();

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      context.setOpen(true);
      onClick?.(event);
    },
    [context, onClick]
  );

  type AsChildProps = {
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    [key: string]: unknown;
  };

  const triggerA11y = {
    id: props.id ?? context.triggerId,
    "aria-haspopup": "dialog" as const,
    "aria-expanded": context.open,
    "aria-controls": context.contentId,
  };

  if (asChild && React.isValidElement<AsChildProps>(children)) {
    return React.cloneElement(children, {
      ref,
      ...triggerA11y,
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
      {...triggerA11y}
      onClick={(event) => {
        context.setOpen(true);
        onClick?.(event);
      }}
      {...props}
    >
      {children}
    </button>
  );
});

SheetTrigger.displayName = "SheetTrigger";

export const SheetClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ children, onClick, type = "button", asChild, ...props }, ref) => {
  const context = useSheetContext();

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      context.setOpen(false);
      onClick?.(event);
    },
    [context, onClick]
  );

  type AsChildProps = {
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    [key: string]: unknown;
  };

  if (asChild && React.isValidElement<AsChildProps>(children)) {
    return React.cloneElement(children, {
      ref,
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
      onClick={(event) => {
        context.setOpen(false);
        onClick?.(event);
      }}
      {...props}
    >
      {children}
    </button>
  );
});

SheetClose.displayName = "SheetClose";

export interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly side?: "top" | "right" | "bottom" | "left";
}

export const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  ({ children, className, onClick, side = "right", ...props }, ref) => {
    const context = useSheetContext();
    const innerRef = React.useRef<HTMLDivElement | null>(null);

    const setRefs = React.useCallback(
      (node: HTMLDivElement | null) => {
        innerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      },
      [ref],
    );

    useFocusTrap(context.open, innerRef);

    React.useEffect(() => {
      if (!context.open) return;
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") context.setOpen(false);
      };
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.body.style.overflow = "";
      };
    }, [context]);

    if (!context.open) {
      return null;
    }

    return createPortal(
      <div
        className="fixed inset-0 z-[100] bg-[rgba(0,0,0,0.5)] backdrop-blur-sm"
        onClick={() => context.setOpen(false)}
      >
        <div
          ref={setRefs}
          role="dialog"
          aria-modal="true"
          id={context.contentId}
          aria-labelledby={context.titleId ?? undefined}
          aria-describedby={context.descriptionId ?? undefined}
          tabIndex={-1}
          className={cn(
            "absolute border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-6 shadow-[0_24px_64px_rgba(0,0,0,0.25)]",
            side === "right"
              ? "end-0 top-0 h-full w-full max-w-md border-s"
              : side === "left"
                ? "start-0 top-0 h-full w-full max-w-md border-e"
                : side === "top"
                  ? "inset-x-0 top-0 max-h-[85vh] w-full border-b"
                  : "inset-x-0 bottom-0 max-h-[85vh] w-full border-t",
            className,
          )}
          onClick={(event) => {
            event.stopPropagation();
            onClick?.(event);
          }}
          {...props}
        >
          <button
            type="button"
            aria-label="Close sheet"
            className="absolute end-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] text-[color:var(--sx-color-foreground-muted)] transition-colors duration-[var(--sx-motion-fast)] hover:text-[color:var(--sx-color-foreground)]"
            onClick={() => context.setOpen(false)}
          >
            <CloseIcon size={16} />
          </button>
          {children}
        </div>
      </div>,
      document.body,
    );
  },
);

SheetContent.displayName = "SheetContent";

export const SheetHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col gap-2 text-start", className)} {...props} />
));

SheetHeader.displayName = "SheetHeader";

export const SheetTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, id, ...props }, ref) => {
  const context = useSheetContext();
  const generatedId = useA11yId("sx-sheet-title");
  const titleId = id ?? generatedId;
  React.useEffect(() => {
    context.setTitleId(titleId);
    return () => context.setTitleId(null);
  }, [context, titleId]);
  return (
    <h2
      ref={ref}
      id={titleId}
      className={cn(
        "text-xl font-semibold tracking-[-0.03em] text-[color:var(--sx-color-foreground)]",
        className,
      )}
      {...props}
    />
  );
});

SheetTitle.displayName = "SheetTitle";

export const SheetDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, id, ...props }, ref) => {
  const context = useSheetContext();
  const generatedId = useA11yId("sx-sheet-desc");
  const descId = id ?? generatedId;
  React.useEffect(() => {
    context.setDescriptionId(descId);
    return () => context.setDescriptionId(null);
  }, [context, descId]);
  return (
    <p
      ref={ref}
      id={descId}
      className={cn("text-sm leading-6 text-[color:var(--sx-color-foreground-muted)]", className)}
      {...props}
    />
  );
});

SheetDescription.displayName = "SheetDescription";

export const SheetFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mt-6 flex flex-wrap items-center justify-end gap-3", className)}
    {...props}
  />
));

SheetFooter.displayName = "SheetFooter";
