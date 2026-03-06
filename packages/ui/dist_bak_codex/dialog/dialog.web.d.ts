import * as React from "react";
import { type DialogSharedProps } from "./dialog.shared";
export interface DialogProps extends DialogSharedProps {
    readonly children: React.ReactNode;
}
export declare function Dialog({ children, defaultOpen, onOpenChange, open }: DialogProps): import("react/jsx-runtime").JSX.Element;
export declare const DialogTrigger: React.ForwardRefExoticComponent<React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
} & React.RefAttributes<HTMLButtonElement>>;
export declare const DialogClose: React.ForwardRefExoticComponent<React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
} & React.RefAttributes<HTMLButtonElement>>;
export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
    readonly hideClose?: boolean;
}
export declare const DialogContent: React.ForwardRefExoticComponent<DialogContentProps & React.RefAttributes<HTMLDivElement>>;
export declare const DialogHeader: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const DialogTitle: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLHeadingElement> & React.RefAttributes<HTMLHeadingElement>>;
export declare const DialogDescription: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLParagraphElement> & React.RefAttributes<HTMLParagraphElement>>;
export declare const DialogFooter: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=dialog.web.d.ts.map