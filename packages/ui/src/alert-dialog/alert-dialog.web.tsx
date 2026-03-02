import * as React from "react";
import {
  Dialog as AlertDialog,
} from "../dialog/dialog.web";
import {
  DialogContent as BaseContent,
  DialogDescription as AlertDialogDescription,
  DialogFooter as AlertDialogFooter,
  DialogHeader as AlertDialogHeader,
  DialogTitle as AlertDialogTitle,
  DialogTrigger as AlertDialogTrigger,
} from "../dialog/dialog.web";
import { useDialogContext } from "../dialog/dialog.shared";
import { Button, type ButtonProps } from "../button/button.web";
import { cn } from "../_shared/variants";

export { AlertDialog, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger };

export const AlertDialogContent = React.forwardRef<React.ElementRef<typeof BaseContent>, React.ComponentPropsWithoutRef<typeof BaseContent>>(
  ({ className, ...props }, ref) => (
    <BaseContent ref={ref} className={cn("max-w-md", className)} {...props} />
  ),
);
AlertDialogContent.displayName = "AlertDialogContent";

export const AlertDialogCancel = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, onClick, variant = "outline", ...props }, ref) => {
    const context = useDialogContext();
    return (
      <Button
        ref={ref}
        variant={variant}
        className={cn("mt-2 sm:mt-0", className)}
        onClick={(e) => {
          context.setOpen(false);
          onClick?.(e);
        }}
        {...props}
      />
    );
  }
);
AlertDialogCancel.displayName = "AlertDialogCancel";

export const AlertDialogAction = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, onClick, variant = "destructive", ...props }, ref) => {
    const context = useDialogContext();
    return (
      <Button
        ref={ref}
        variant={variant}
        className={className}
        onClick={(e) => {
          context.setOpen(false);
          onClick?.(e);
        }}
        {...props}
      />
    );
  }
);
AlertDialogAction.displayName = "AlertDialogAction";
