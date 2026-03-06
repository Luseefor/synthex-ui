import * as React from "react";
import { Text, View, type PressableProps, type StyleProp, type TextStyle, type ViewProps, type ViewStyle } from "react-native";
import type { BreadcrumbLinkSharedProps } from "./breadcrumb.shared";
export interface BreadcrumbProps extends Omit<ViewProps, "style"> {
    readonly children?: React.ReactNode;
    readonly style?: StyleProp<ViewStyle>;
}
export declare const Breadcrumb: React.ForwardRefExoticComponent<BreadcrumbProps & React.RefAttributes<View>>;
export declare const BreadcrumbList: React.ForwardRefExoticComponent<BreadcrumbProps & React.RefAttributes<View>>;
export declare const BreadcrumbItem: React.ForwardRefExoticComponent<BreadcrumbProps & React.RefAttributes<View>>;
export interface BreadcrumbLinkProps extends Omit<PressableProps, "style">, BreadcrumbLinkSharedProps {
    readonly children?: React.ReactNode;
    readonly style?: StyleProp<ViewStyle>;
    readonly textStyle?: StyleProp<TextStyle>;
}
export declare const BreadcrumbLink: React.ForwardRefExoticComponent<BreadcrumbLinkProps & React.RefAttributes<View>>;
export interface BreadcrumbTextProps extends Omit<React.ComponentProps<typeof Text>, "style"> {
    readonly style?: StyleProp<TextStyle>;
}
export declare const BreadcrumbPage: React.ForwardRefExoticComponent<BreadcrumbTextProps & React.RefAttributes<Text>>;
export declare const BreadcrumbSeparator: React.ForwardRefExoticComponent<BreadcrumbTextProps & React.RefAttributes<Text>>;
export declare const BreadcrumbEllipsis: React.ForwardRefExoticComponent<BreadcrumbTextProps & React.RefAttributes<Text>>;
//# sourceMappingURL=breadcrumb.native.d.ts.map