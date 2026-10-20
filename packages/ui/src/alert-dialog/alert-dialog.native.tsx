import * as React from "react";
import { View, type Pressable } from "react-native";
import { useDialogContext } from "../dialog/dialog.shared";
import {
  Dialog as AlertDialog,
  DialogContent as BaseContent,
  DialogDescription as AlertDialogDescription,
  DialogFooter as AlertDialogFooter,
  DialogHeader as AlertDialogHeader,
  DialogTitle as AlertDialogTitle,
  DialogTrigger as AlertDialogTrigger,
  type DialogContentProps,
} from "../dialog/dialog.native";
import { Button, type ButtonProps } from "../button/button.native";

export { AlertDialog, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger };

export const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  ButtonProps
>(({ onPress, variant = "outline", style, ...props }, ref) => {
  const context = useDialogContext();
  return (
    <Button
      ref={ref}
      variant={variant}
      style={[{ marginTop: 8 }, style] as any}
      onPress={(event) => {
        context.setOpen(false);
        onPress?.(event);
      }}
      {...props}
    />
  );
});
AlertDialogCancel.displayName = "AlertDialogCancel";

export const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  ButtonProps
>(({ onPress, variant = "destructive", ...props }, ref) => {
  const context = useDialogContext();
  return (
    <Button
      ref={ref}
      variant={variant}
      onPress={(event) => {
        context.setOpen(false);
        onPress?.(event);
      }}
      {...props}
    />
  );
});
AlertDialogAction.displayName = "AlertDialogAction";

export const AlertDialogContent = React.forwardRef<React.ElementRef<typeof View>, DialogContentProps>(
  ({ dismissible = false, ...props }, ref) => (
    <BaseContent ref={ref} dismissible={dismissible} {...props} />
  ),
);
AlertDialogContent.displayName = "AlertDialogContent";
