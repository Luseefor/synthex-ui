import * as React from "react";
import { type AccordionItemSharedProps, type AccordionSharedProps } from "./accordion.shared";
export interface AccordionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange">, AccordionSharedProps {
}
export declare function Accordion({ children, className, collapsible, defaultValue, onValueChange, type, value, ...props }: AccordionProps): import("react/jsx-runtime").JSX.Element;
export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement>, AccordionItemSharedProps {
}
export declare const AccordionItem: React.ForwardRefExoticComponent<AccordionItemProps & React.RefAttributes<HTMLDivElement>>;
export declare const AccordionTrigger: React.ForwardRefExoticComponent<React.ButtonHTMLAttributes<HTMLButtonElement> & React.RefAttributes<HTMLButtonElement>>;
export declare const AccordionContent: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=accordion.web.d.ts.map