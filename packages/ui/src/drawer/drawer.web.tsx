import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "../_shared/variants";
import { useA11yId, useFocusTrap } from "../_shared/a11y.web";
import { CloseIcon } from "../icons/index.web";
import { DialogProvider, useDialogContext, useDialogController } from "../dialog/dialog.shared";
import type { DrawerSharedProps } from "./drawer.shared";

export interface DrawerProps extends DrawerSharedProps {
  readonly children?: React.ReactNode;
}

export function Drawer({ children, defaultOpen, onOpenChange, open }: DrawerProps) {
  const controller = useDialogController({ defaultOpen, onOpenChange, open });
  return <DialogProvider value={controller}>{children}</DialogProvider>;
}

export const DrawerTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }>(
  ({ children, onClick, type = "button", asChild, ...props }, ref) => {
    const context = useDialogContext();

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        context.setOpen(true);
        onClick?.(event);
      },
      [context, onClick],
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
  },
);
DrawerTrigger.displayName = "DrawerTrigger";

export const DrawerClose = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }>(
  ({ children, onClick, type = "button", asChild, ...props }, ref) => {
    const context = useDialogContext();

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        context.setOpen(false);
        onClick?.(event);
      },
      [context, onClick],
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
  },
);
DrawerClose.displayName = "DrawerClose";

export interface DrawerContentProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly side?: "bottom" | "left" | "right";
}

export const DrawerContent = React.forwardRef<HTMLDivElement, DrawerContentProps>(
  ({ children, className, onClick, side = "bottom", ...props }, ref) => {
    const context = useDialogContext();
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

    if (!context.open) return null;

    return createPortal(
      <div
        className="fixed inset-0 z-[100] bg-[rgba(15,23,42,0.38)] backdrop-blur-sm"
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
            "absolute border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-6 shadow-[0_24px_64px_rgba(15,23,42,0.22)]",
            side === "bottom"
              ? "bottom-0 left-0 right-0 max-h-[85vh] rounded-t-[calc(var(--sx-radius-xl)+4px)] border-t"
              : side === "left"
                ? "bottom-0 left-0 top-0 w-full max-w-md border-r"
                : "bottom-0 right-0 top-0 w-full max-w-md border-l",
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
            aria-label="Close drawer"
            className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] text-[color:var(--sx-color-foreground-muted)]"
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
DrawerContent.displayName = "DrawerContent";

export const DrawerHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("flex flex-col gap-2 text-left", className)} {...props} />,
);
DrawerHeader.displayName = "DrawerHeader";

export const DrawerTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, id, ...props }, ref) => {
    const context = useDialogContext();
    const generatedId = useA11yId("sx-drawer-title");
    const titleId = id ?? generatedId;
    React.useEffect(() => {
      context.setTitleId(titleId);
      return () => context.setTitleId(null);
    }, [context, titleId]);
    return <h2 ref={ref} id={titleId} className={cn("text-xl font-semibold tracking-[-0.03em] text-[color:var(--sx-color-foreground)]", className)} {...props} />;
  },
);
DrawerTitle.displayName = "DrawerTitle";

export const DrawerDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, id, ...props }, ref) => {
    const context = useDialogContext();
    const generatedId = useA11yId("sx-drawer-desc");
    const descId = id ?? generatedId;
    React.useEffect(() => {
      context.setDescriptionId(descId);
      return () => context.setDescriptionId(null);
    }, [context, descId]);
    return <p ref={ref} id={descId} className={cn("text-sm leading-6 text-[color:var(--sx-color-foreground-muted)]", className)} {...props} />;
  },
);
DrawerDescription.displayName = "DrawerDescription";

export const DrawerFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("mt-6 flex flex-wrap items-center justify-end gap-3", className)} {...props} />,
);
DrawerFooter.displayName = "DrawerFooter";
