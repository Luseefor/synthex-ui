import * as React from "react";
import { ScrollView, Text, type TextProps, View, type ScrollViewProps, type StyleProp, type TextStyle, type ViewProps, type ViewStyle } from "react-native";
export interface TableProps extends Omit<ScrollViewProps, "style"> {
    readonly style?: StyleProp<ViewStyle>;
}
export declare const Table: React.ForwardRefExoticComponent<TableProps & React.RefAttributes<ScrollView>>;
export interface TableSectionProps extends Omit<ViewProps, "style"> {
    readonly style?: StyleProp<ViewStyle>;
}
export declare const TableHeader: React.ForwardRefExoticComponent<TableSectionProps & React.RefAttributes<View>>;
export declare const TableBody: React.ForwardRefExoticComponent<TableSectionProps & React.RefAttributes<View>>;
export declare const TableFooter: React.ForwardRefExoticComponent<TableSectionProps & React.RefAttributes<View>>;
export declare const TableRow: React.ForwardRefExoticComponent<TableSectionProps & React.RefAttributes<View>>;
export interface TableTextCellProps extends Omit<ViewProps, "style"> {
    readonly children?: React.ReactNode;
    readonly style?: StyleProp<ViewStyle>;
}
export declare const TableHead: React.ForwardRefExoticComponent<TableTextCellProps & React.RefAttributes<View>>;
export declare const TableCell: React.ForwardRefExoticComponent<TableTextCellProps & React.RefAttributes<View>>;
export interface TableCaptionProps extends Omit<TextProps, "style"> {
    readonly style?: StyleProp<TextStyle>;
}
export declare const TableCaption: React.ForwardRefExoticComponent<TableCaptionProps & React.RefAttributes<Text>>;
//# sourceMappingURL=table.native.d.ts.map