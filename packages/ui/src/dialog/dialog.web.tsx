import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "../_shared/variants";
import { useA11yId, useFocusTrap } from "../_shared/a11y.web";
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

DialogClose.displayName = "DialogClose";

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly dismissible?: boolean;
  readonly hideClose?: boolean;
  readonly role?: "dialog" | "alertdialog";
}

export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  (
    { children, className, dismissible = true, hideClose = false, onClick, role = "dialog", ...props },
    ref,
  ) => {
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
      if (!context.open) {
        return;
      }

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          if (!dismissible) {
            return;
          }
          context.setOpen(false);
        }
      };

      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";

      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.body.style.overflow = "";
      };
    }, [context, dismissible]);

    if (!context.open) {
      return null;
    }

    return createPortal(
      <>
        {/* Overlay */}
        <div
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-[6px]"
          style={{ animation: "sx-overlay-in 200ms var(--sx-easing-standard)" }}
          onClick={() => {
            if (dismissible) {
              context.setOpen(false);
            }
          }}
        />
        {/* Content */}
        <div
          className="fixed left-1/2 top-1/2 z-[101] w-full max-w-lg -translate-x-1/2 -translate-y-1/2"
          role={role}
          aria-modal="true"
          aria-labelledby={context.titleId ?? undefined}
          aria-describedby={context.descriptionId ?? undefined}
          id={context.contentId}
        >
          <div
            ref={setRefs}
            tabIndex={-1}
            className={cn(
              "relative w-full rounded-[var(--sx-radius-xl)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-6 shadow-[var(--sx-shadow-dialog)]",
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
                className="absolute end-4 top-4 inline-flex h-7 w-7 items-center justify-center rounded-[var(--sx-radius-sm)] text-[color:var(--sx-color-foreground-muted)] opacity-70 transition-all duration-[var(--sx-motion-fast)] hover:opacity-100 hover:bg-[color:var(--sx-color-surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sx-color-ring)]"
                onClick={() => context.setOpen(false)}
              >
                <CloseIcon size={15} />
              </button>
            ) : null}
            {children}
          </div>
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
  <div ref={ref} className={cn("flex flex-col gap-1.5 text-start", className)} {...props} />
));

DialogHeader.displayName = "DialogHeader";

export const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, id, ...props }, ref) => {
  const context = useDialogContext();
  const generatedId = useA11yId("sx-dialog-title");
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
        "text-lg font-semibold leading-none tracking-[-0.02em] text-[color:var(--sx-color-foreground)]",
        className,
      )}
      {...props}
    />
  );
});

DialogTitle.displayName = "DialogTitle";

export const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, id, ...props }, ref) => {
  const context = useDialogContext();
  const generatedId = useA11yId("sx-dialog-desc");
  const descId = id ?? generatedId;
  React.useEffect(() => {
    context.setDescriptionId(descId);
    return () => context.setDescriptionId(null);
  }, [context, descId]);
  return (
    <p
      ref={ref}
      id={descId}
      className={cn("text-sm leading-relaxed text-[color:var(--sx-color-foreground-muted)]", className)}
      {...props}
    />
  );
});

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
