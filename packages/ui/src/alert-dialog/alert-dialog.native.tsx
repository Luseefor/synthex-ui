import * as React from "react";
import type { Pressable } from "react-native";
import { useDialogContext } from "../dialog/dialog.shared";
import { Button, type ButtonProps } from "../button/button.native";

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

export {
  Dialog as AlertDialog,
  DialogContent as AlertDialogContent,
  DialogDescription as AlertDialogDescription,
  DialogFooter as AlertDialogFooter,
  DialogHeader as AlertDialogHeader,
  DialogTitle as AlertDialogTitle,
  DialogTrigger as AlertDialogTrigger,
} from "../dialog/dialog.native";
