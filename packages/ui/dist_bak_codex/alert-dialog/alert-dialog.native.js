import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { useDialogContext } from "../dialog/dialog.shared";
import { Button } from "../button/button.native";
export const AlertDialogCancel = React.forwardRef(({ onPress, variant = "outline", style, ...props }, ref) => {
    const context = useDialogContext();
    return (_jsx(Button, { ref: ref, variant: variant, style: [{ marginTop: 8 }, style], onPress: (event) => {
            context.setOpen(false);
            onPress?.(event);
        }, ...props }));
});
AlertDialogCancel.displayName = "AlertDialogCancel";
export const AlertDialogAction = React.forwardRef(({ onPress, variant = "destructive", ...props }, ref) => {
    const context = useDialogContext();
    return (_jsx(Button, { ref: ref, variant: variant, onPress: (event) => {
            context.setOpen(false);
            onPress?.(event);
        }, ...props }));
});
AlertDialogAction.displayName = "AlertDialogAction";
export { Dialog as AlertDialog, DialogContent as AlertDialogContent, DialogDescription as AlertDialogDescription, DialogFooter as AlertDialogFooter, DialogHeader as AlertDialogHeader, DialogTitle as AlertDialogTitle, DialogTrigger as AlertDialogTrigger, } from "../dialog/dialog.native";
