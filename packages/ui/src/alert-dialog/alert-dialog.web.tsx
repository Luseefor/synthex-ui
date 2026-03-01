import * as React from "react";
import {
  Dialog as AlertDialog,
} from "../dialog/dialog.web";
import {
  DialogClose as AlertDialogCancel,
  DialogContent as BaseContent,
  DialogDescription as AlertDialogDescription,
  DialogFooter as AlertDialogFooter,
  DialogHeader as AlertDialogHeader,
  DialogTitle as AlertDialogTitle,
  DialogTrigger as AlertDialogTrigger,
} from "../dialog/dialog.web";
import { cn } from "../_shared/variants";

export { AlertDialog, AlertDialogCancel, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger };

export const AlertDialogContent = React.forwardRef<React.ElementRef<typeof BaseContent>, React.ComponentPropsWithoutRef<typeof BaseContent>>(
  ({ className, ...props }, ref) => (
    <BaseContent ref={ref} className={cn("max-w-md", className)} {...props} />
  ),
);
AlertDialogContent.displayName = "AlertDialogContent";

export const AlertDialogAction = AlertDialogCancel;
