import * as React from "react";
import {
  ScrollView,
  Text,
  type TextProps,
  View,
  type ScrollViewProps,
  type StyleProp,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import { useTheme } from "../_shared/theme/context";

function renderCellContent(
  children: React.ReactNode,
  textStyle: TextStyle,
) {
  if (typeof children === "string" || typeof children === "number") {
    return <Text style={textStyle}>{children}</Text>;
  }

  return children;
}

export interface TableProps extends Omit<ScrollViewProps, "style"> {
  readonly style?: StyleProp<ViewStyle>;
}

export const Table = React.forwardRef<React.ElementRef<typeof ScrollView>, TableProps>(
  ({ children, horizontal = true, style, ...props }, ref) => (
    <ScrollView ref={ref} horizontal={horizontal} style={style} {...props}>
      <View>{children}</View>
    </ScrollView>
  ),
);

Table.displayName = "Table";

export interface TableSectionProps extends Omit<ViewProps, "style"> {
  readonly style?: StyleProp<ViewStyle>;
}

export const TableHeader = React.forwardRef<React.ElementRef<typeof View>, TableSectionProps>(
  ({ style, ...props }, ref) => <View ref={ref} style={style} {...props} />,
);

TableHeader.displayName = "TableHeader";

export const TableBody = React.forwardRef<React.ElementRef<typeof View>, TableSectionProps>(
  ({ style, ...props }, ref) => <View ref={ref} style={style} {...props} />,
);

TableBody.displayName = "TableBody";

export const TableFooter = React.forwardRef<React.ElementRef<typeof View>, TableSectionProps>(
  ({ style, ...props }, ref) => {
    const theme = useTheme();

    return (
      <View
        ref={ref}
        style={[
          {
            backgroundColor: theme.colors.surfaceMuted,
          },
          style,
        ]}
        {...props}
      />
    );
  },
);

TableFooter.displayName = "TableFooter";

export const TableRow = React.forwardRef<React.ElementRef<typeof View>, TableSectionProps>(
  ({ style, ...props }, ref) => {
    const theme = useTheme();

    return (
      <View
        ref={ref}
        style={[
          {
            flexDirection: "row",
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
          },
          style,
        ]}
        {...props}
      />
    );
  },
);

TableRow.displayName = "TableRow";

export interface TableTextCellProps extends Omit<ViewProps, "style"> {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
}

export const TableHead = React.forwardRef<React.ElementRef<typeof View>, TableTextCellProps>(
  ({ children, style, ...props }, ref) => {
    const theme = useTheme();

    return (
      <View
        ref={ref}
        style={[{ minWidth: 140, paddingHorizontal: 16, paddingVertical: 12 }, style]}
        {...props}
      >
        {renderCellContent(children, {
          color: theme.colors.foregroundMuted,
          fontFamily: theme.typography.family.sans,
          fontSize: theme.typography.size.xs,
          fontWeight: theme.typography.weight.semibold,
          textTransform: "uppercase",
          letterSpacing: 0.8,
        })}
      </View>
    );
  },
);

TableHead.displayName = "TableHead";

export const TableCell = React.forwardRef<React.ElementRef<typeof View>, TableTextCellProps>(
  ({ children, style, ...props }, ref) => {
    const theme = useTheme();

    return (
      <View
        ref={ref}
        style={[{ minWidth: 140, paddingHorizontal: 16, paddingVertical: 12 }, style]}
        {...props}
      >
        {renderCellContent(children, {
          color: theme.colors.foreground,
          fontFamily: theme.typography.family.sans,
          fontSize: theme.typography.size.sm,
        })}
      </View>
    );
  },
);

TableCell.displayName = "TableCell";

export interface TableCaptionProps extends Omit<TextProps, "style"> {
  readonly style?: StyleProp<TextStyle>;
}

export const TableCaption = React.forwardRef<React.ElementRef<typeof Text>, TableCaptionProps>(
  ({ style, ...props }, ref) => {
    const theme = useTheme();

    return (
      <Text
        ref={ref}
        style={[
          {
            marginTop: 12,
            color: theme.colors.foregroundMuted,
            fontFamily: theme.typography.family.sans,
            fontSize: theme.typography.size.sm,
          },
          style,
        ]}
        {...props}
      />
    );
  },
);

TableCaption.displayName = "TableCaption";
