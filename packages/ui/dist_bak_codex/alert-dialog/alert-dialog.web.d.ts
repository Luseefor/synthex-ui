import * as React from "react";
import { Dialog as AlertDialog } from "../dialog/dialog.web";
import { DialogDescription as AlertDialogDescription, DialogFooter as AlertDialogFooter, DialogHeader as AlertDialogHeader, DialogTitle as AlertDialogTitle, DialogTrigger as AlertDialogTrigger } from "../dialog/dialog.web";
import { type ButtonProps } from "../button/button.web";
export { AlertDialog, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger };
export declare const AlertDialogContent: React.ForwardRefExoticComponent<Omit<import("../dialog").DialogContentProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
export declare const AlertDialogCancel: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;
export declare const AlertDialogAction: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;
//# sourceMappingURL=alert-dialog.web.d.ts.map