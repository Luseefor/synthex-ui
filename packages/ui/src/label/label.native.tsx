import * as React from "react";
import {
  Text as NativeText,
  type StyleProp,
  type TextProps as NativeTextProps,
  type TextStyle,
} from "react-native";
import { useTheme } from "../_shared/theme/context";

export interface LabelProps extends NativeTextProps {
  readonly style?: StyleProp<TextStyle>;
}

export const Label = React.forwardRef<React.ElementRef<typeof NativeText>, LabelProps>(
  ({ style, ...props }, ref) => {
    const theme = useTheme();

    return (
      <NativeText
        ref={ref}
        style={[
          {
            color: theme.colors.foreground,
            fontFamily: theme.typography.family.sans,
            fontSize: theme.typography.size.sm,
            fontWeight: theme.typography.weight.medium,
            lineHeight: theme.typography.size.sm * theme.typography.lineHeight.normal,
          },
          style,
        ]}
        {...props}
      />
    );
  },
);

Label.displayName = "Label";
