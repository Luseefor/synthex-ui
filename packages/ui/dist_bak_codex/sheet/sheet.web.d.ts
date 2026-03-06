import * as React from "react";
import { type DialogSharedProps } from "../dialog/dialog.shared";
export interface SheetProps extends DialogSharedProps {
    readonly children: React.ReactNode;
}
export declare function Sheet({ children, defaultOpen, onOpenChange, open }: SheetProps): import("react/jsx-runtime").JSX.Element;
export declare const SheetTrigger: React.ForwardRefExoticComponent<React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
} & React.RefAttributes<HTMLButtonElement>>;
export declare const SheetClose: React.ForwardRefExoticComponent<React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
} & React.RefAttributes<HTMLButtonElement>>;
export interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
    readonly side?: "left" | "right";
}
export declare const SheetContent: React.ForwardRefExoticComponent<SheetContentProps & React.RefAttributes<HTMLDivElement>>;
export declare const SheetHeader: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const SheetTitle: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLHeadingElement> & React.RefAttributes<HTMLHeadingElement>>;
export declare const SheetDescription: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLParagraphElement> & React.RefAttributes<HTMLParagraphElement>>;
export declare const SheetFooter: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=sheet.web.d.ts.map