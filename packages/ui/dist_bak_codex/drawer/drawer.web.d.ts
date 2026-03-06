import * as React from "react";
import type { DrawerSharedProps } from "./drawer.shared";
export interface DrawerProps extends DrawerSharedProps {
    readonly children?: React.ReactNode;
}
export declare function Drawer({ children, defaultOpen, onOpenChange, open }: DrawerProps): import("react/jsx-runtime").JSX.Element;
export declare const DrawerTrigger: React.ForwardRefExoticComponent<React.ButtonHTMLAttributes<HTMLButtonElement> & React.RefAttributes<HTMLButtonElement>>;
export declare const DrawerClose: React.ForwardRefExoticComponent<React.ButtonHTMLAttributes<HTMLButtonElement> & React.RefAttributes<HTMLButtonElement>>;
export interface DrawerContentProps extends React.HTMLAttributes<HTMLDivElement> {
    readonly side?: "bottom" | "left" | "right";
}
export declare const DrawerContent: React.ForwardRefExoticComponent<DrawerContentProps & React.RefAttributes<HTMLDivElement>>;
export declare const DrawerHeader: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const DrawerTitle: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLHeadingElement> & React.RefAttributes<HTMLHeadingElement>>;
export declare const DrawerDescription: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLParagraphElement> & React.RefAttributes<HTMLParagraphElement>>;
export declare const DrawerFooter: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=drawer.web.d.ts.map