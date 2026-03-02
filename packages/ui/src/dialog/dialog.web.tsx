import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "../_shared/variants";
import { CloseIcon } from "../icons/index.web";
import {
  DialogProvider,
  useDialogContext,
  useDialogController,
  type DialogSharedProps,
} from "./dialog.shared";

export interface DialogProps extends DialogSharedProps {
  readonly children: React.ReactNode;
}

export function Dialog({ children, defaultOpen, onOpenChange, open }: DialogProps) {
  const controller = useDialogController({ defaultOpen, onOpenChange, open });

  return <DialogProvider value={controller}>{children}</DialogProvider>;
}

export const DialogTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ children, onClick, type = "button", asChild, ...props }, ref) => {
  const context = useDialogContext();

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      context.setOpen(true);
      onClick?.(event);
    },
    [context, onClick]
  );

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ref,
      ...props,
      onClick: (e: any) => {
        handleClick(e);
        (children.props as any).onClick?.(e);
      },
    });
  }

  return (
    <button
      ref={ref}
      type={type}
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

DialogTrigger.displayName = "DialogTrigger";

export const DialogClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ children, onClick, type = "button", asChild, ...props }, ref) => {
  const context = useDialogContext();

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      context.setOpen(false);
      onClick?.(event);
    },
    [context, onClick]
  );

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ref,
      ...props,
      onClick: (e: any) => {
        handleClick(e);
        (children.props as any).onClick?.(e);
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

DialogClose.displayName = "DialogClose";

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly hideClose?: boolean;
}

export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ children, className, hideClose = false, onClick, ...props }, ref) => {
    const context = useDialogContext();

    React.useEffect(() => {
      if (!context.open) {
        return;
      }

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          context.setOpen(false);
        }
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
      <>
        {/* Overlay */}
        <div
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-[6px]"
          style={{ animation: "sx-overlay-in 200ms var(--sx-easing-standard)" }}
          onClick={() => context.setOpen(false)}
        />
        {/* Content */}
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          className={cn(
            "fixed left-1/2 top-1/2 z-[101] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-[var(--sx-radius-xl)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-6 shadow-[var(--sx-shadow-dialog)]",
            className,
          )}
          style={{ animation: "sx-content-in 250ms var(--sx-easing-emphasized)" }}
          onClick={(event) => {
            event.stopPropagation();
            onClick?.(event);
          }}
          {...props}
        >
          {!hideClose ? (
            <button
              type="button"
              aria-label="Close dialog"
              className="absolute right-4 top-4 inline-flex h-7 w-7 items-center justify-center rounded-[var(--sx-radius-sm)] text-[color:var(--sx-color-foreground-muted)] opacity-70 transition-all duration-[var(--sx-motion-fast)] hover:opacity-100 hover:bg-[color:var(--sx-color-surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sx-color-ring)]"
              onClick={() => context.setOpen(false)}
            >
              <CloseIcon size={15} />
            </button>
          ) : null}
          {children}
        </div>
      </>,
      document.body,
    );
  },
);

DialogContent.displayName = "DialogContent";

export const DialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col gap-1.5 text-left", className)} {...props} />
));

DialogHeader.displayName = "DialogHeader";

export const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-[-0.02em] text-[color:var(--sx-color-foreground)]",
      className,
    )}
    {...props}
  />
));

DialogTitle.displayName = "DialogTitle";

export const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm leading-relaxed text-[color:var(--sx-color-foreground-muted)]", className)}
    {...props}
  />
));

DialogDescription.displayName = "DialogDescription";

export const DialogFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3", className)}
    {...props}
  />
));

DialogFooter.displayName = "DialogFooter";
