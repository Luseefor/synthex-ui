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
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, onClick, type = "button", ...props }, ref) => {
  const context = useDialogContext();

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
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, onClick, type = "button", ...props }, ref) => {
  const context = useDialogContext();

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

      return () => {
        document.removeEventListener("keydown", handleEscape);
      };
    }, [context]);

    if (!context.open) {
      return null;
    }

    return createPortal(
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(15,23,42,0.42)] px-4 py-8 backdrop-blur-sm"
        onClick={() => context.setOpen(false)}
      >
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          className={cn(
            "relative w-full max-w-lg rounded-[calc(var(--sx-radius-xl)+2px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-6 shadow-[0_24px_64px_rgba(15,23,42,0.24)]",
            className,
          )}
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
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] text-[color:var(--sx-color-foreground-muted)] transition-colors duration-[var(--sx-motion-fast)] hover:text-[color:var(--sx-color-foreground)]"
              onClick={() => context.setOpen(false)}
            >
              <CloseIcon size={16} />
            </button>
          ) : null}
          {children}
        </div>
      </div>,
      document.body,
    );
  },
);

DialogContent.displayName = "DialogContent";

export const DialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col gap-2 text-left", className)} {...props} />
));

DialogHeader.displayName = "DialogHeader";

export const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      "text-xl font-semibold tracking-[-0.03em] text-[color:var(--sx-color-foreground)]",
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
    className={cn("text-sm leading-6 text-[color:var(--sx-color-foreground-muted)]", className)}
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
    className={cn("mt-6 flex flex-wrap items-center justify-end gap-3", className)}
    {...props}
  />
));

DialogFooter.displayName = "DialogFooter";
