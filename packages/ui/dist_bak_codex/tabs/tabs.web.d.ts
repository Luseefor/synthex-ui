import * as React from "react";
import { type TabsContentSharedProps, type TabsSharedProps, type TabsTriggerSharedProps } from "./tabs.shared";
export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange" | "value">, TabsSharedProps {
}
export declare function Tabs({ children, className, defaultValue, onValueChange, value, ...props }: TabsProps): import("react/jsx-runtime").JSX.Element;
export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
}
export declare const TabsList: React.ForwardRefExoticComponent<TabsListProps & React.RefAttributes<HTMLDivElement>>;
export interface TabsTriggerProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value">, TabsTriggerSharedProps {
}
export declare const TabsTrigger: React.ForwardRefExoticComponent<TabsTriggerProps & React.RefAttributes<HTMLButtonElement>>;
export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement>, TabsContentSharedProps {
}
export declare const TabsContent: React.ForwardRefExoticComponent<TabsContentProps & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=tabs.web.d.ts.map