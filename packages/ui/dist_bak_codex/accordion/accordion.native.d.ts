import * as React from "react";
import { View, type PressableProps, type StyleProp, type TextStyle, type ViewProps, type ViewStyle } from "react-native";
import { type AccordionItemSharedProps, type AccordionSharedProps } from "./accordion.shared";
export interface AccordionProps extends Omit<ViewProps, "style">, AccordionSharedProps {
    readonly style?: StyleProp<ViewStyle>;
}
export declare function Accordion({ children, collapsible, defaultValue, onValueChange, style, type, value, ...props }: AccordionProps): import("react/jsx-runtime").JSX.Element;
export interface AccordionItemProps extends Omit<ViewProps, "style">, AccordionItemSharedProps {
    readonly style?: StyleProp<ViewStyle>;
}
export declare const AccordionItem: React.ForwardRefExoticComponent<AccordionItemProps & React.RefAttributes<View>>;
export interface AccordionTriggerProps extends Omit<PressableProps, "style"> {
    readonly children?: React.ReactNode;
    readonly style?: StyleProp<ViewStyle>;
    readonly textStyle?: StyleProp<TextStyle>;
}
export declare const AccordionTrigger: React.ForwardRefExoticComponent<AccordionTriggerProps & React.RefAttributes<View>>;
export interface AccordionContentProps extends Omit<ViewProps, "style"> {
    readonly style?: StyleProp<ViewStyle>;
}
export declare const AccordionContent: React.ForwardRefExoticComponent<AccordionContentProps & React.RefAttributes<View>>;
//# sourceMappingURL=accordion.native.d.ts.map