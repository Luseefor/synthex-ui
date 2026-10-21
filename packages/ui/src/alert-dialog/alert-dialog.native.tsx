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

export interface AlertDialogContentProps extends DialogContentProps {
  readonly hideClose?: boolean;
}

export const AlertDialogCancel: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<ButtonProps> & React.RefAttributes<React.ElementRef<typeof Pressable>>
> = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  ButtonProps
>(({ onPress, testID, variant = "outline", style, ...props }, ref) => {
  const context = useDialogContext();
  return (
    <Button
      ref={ref}
      testID={testID ?? "alert-dialog-cancel"}
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

export const AlertDialogAction: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<ButtonProps> & React.RefAttributes<React.ElementRef<typeof Pressable>>
> = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  ButtonProps
>(({ onPress, testID, variant = "destructive", ...props }, ref) => {
  const context = useDialogContext();
  return (
    <Button
      ref={ref}
      testID={testID ?? "alert-dialog-action"}
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

export const AlertDialogContent: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<AlertDialogContentProps> & React.RefAttributes<React.ElementRef<typeof View>>
> = React.forwardRef<React.ElementRef<typeof View>, AlertDialogContentProps>(
  ({ dismissible = false, hideClose = true, testID, ...props }, ref) => (
    <BaseContent
      ref={ref}
      dismissible={dismissible}
      hideClose={hideClose}
      testID={testID ?? "alert-dialog-content"}
      {...props}
    />
  ),
);
AlertDialogContent.displayName = "AlertDialogContent";
