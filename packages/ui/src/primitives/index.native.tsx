import * as React from "react";
import {
  Pressable,
  ScrollView,
  Text as NativeText,
  View,
  type PressableProps,
  type ScrollViewProps,
  type StyleProp,
  type TextProps as NativeTextProps,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import { useTheme } from "../_shared/theme/context";
import {
  createBoxStyle,
  createSurfaceStyle,
  createTextStyle,
  resolveSpace,
  type BoxStyleProps,
  type DimensionValue,
  type SpaceValue,
  type SurfaceStyleProps,
  type TextStyleProps,
} from "./shared";

export interface BoxProps extends Omit<ViewProps, "style">, BoxStyleProps {
  readonly style?: StyleProp<ViewStyle>;
}

export const Box = React.forwardRef<React.ElementRef<typeof View>, BoxProps>(
  ({ style, ...props }, ref) => {
    const theme = useTheme();
    const boxStyle = toNativeViewStyle(createBoxStyle(theme, props));

    return <View {...props} ref={ref} style={[boxStyle, style]} />;
  },
);

Box.displayName = "Box";

export interface TextProps extends Omit<NativeTextProps, "style">, TextStyleProps {
  readonly style?: StyleProp<TextStyle>;
}

export const Text = React.forwardRef<React.ElementRef<typeof NativeText>, TextProps>(
  ({ style, ...props }, ref) => {
    const theme = useTheme();
    const textStyle = createTextStyle(theme, props);

    return <NativeText {...props} ref={ref} style={[textStyle, style]} />;
  },
);

Text.displayName = "Text";

export interface StackProps extends Omit<BoxProps, "direction"> { }

export const Stack = React.forwardRef<React.ElementRef<typeof View>, StackProps>((props, ref) => (
  <Box ref={ref} direction="column" {...props} />
));

Stack.displayName = "Stack";

export interface InlineProps extends Omit<BoxProps, "direction"> { }

export const Inline = React.forwardRef<React.ElementRef<typeof View>, InlineProps>((props, ref) => (
  <Box ref={ref} direction="row" {...props} />
));

Inline.displayName = "Inline";

export interface GridProps extends Omit<BoxProps, "direction" | "wrap"> {
  readonly columns?: number;
  readonly minItemWidth?: DimensionValue;
}

export const Grid = React.forwardRef<React.ElementRef<typeof View>, GridProps>(
  ({ children, columns = 2, gap, minItemWidth, style, ...props }, ref) => {
    const theme = useTheme();
    const resolvedGap = resolveSpace(theme, gap) ?? 0;
    const itemWidth =
      minItemWidth !== undefined
        ? minItemWidth
        : (`${100 / columns}%` as const);

    return (
      <View
        {...props}
        ref={ref}
        style={[
          {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: resolvedGap,
          },
          style,
        ]}
      >
        {React.Children.map(children, (child, index) => (
          <View
            key={typeof child === "object" && child && "key" in child ? child.key?.toString() ?? index : index}
            style={{ width: toNativeDimension(itemWidth) }}
          >
            {child}
          </View>
        ))}
      </View>
    );
  },
);

Grid.displayName = "Grid";

export interface SurfaceProps extends Omit<ViewProps, "style">, SurfaceStyleProps {
  readonly style?: StyleProp<ViewStyle>;
}

export const Surface = React.forwardRef<React.ElementRef<typeof View>, SurfaceProps>(
  ({ style, ...props }, ref) => {
    const theme = useTheme();
    const surfaceStyle = toNativeViewStyle(createSurfaceStyle(theme, props));

    return <View {...props} ref={ref} style={[surfaceStyle, style]} />;
  },
);

Surface.displayName = "Surface";

export interface PressablePrimitiveProps extends Omit<PressableProps, "style">, BoxStyleProps {
  readonly style?: StyleProp<ViewStyle>;
}

export const PressablePrimitive = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  PressablePrimitiveProps
>(({ style, ...props }, ref) => {
  const theme = useTheme();
  const pressableStyle = toNativeViewStyle(createBoxStyle(theme, props));

  return (
    <Pressable
      {...props}
      ref={ref}
      style={({ pressed }) => [
        pressableStyle,
        {
          opacity: pressed ? 0.92 : 1,
        },
        style as ViewStyle,
      ]}
    />
  );
});

PressablePrimitive.displayName = "PressablePrimitive";

export interface ScrollAreaProps extends Omit<ScrollViewProps, "style">, Omit<BoxStyleProps, "direction" | "wrap"> {
  readonly contentContainerStyle?: StyleProp<ViewStyle>;
  readonly style?: StyleProp<ViewStyle>;
}

export const ScrollArea = React.forwardRef<React.ElementRef<typeof ScrollView>, ScrollAreaProps>(
  ({ contentContainerStyle, style, ...props }, ref) => {
    const theme = useTheme();
    const boxStyle = toNativeViewStyle(createBoxStyle(theme, props));

    return (
      <ScrollView
        {...props}
        ref={ref}
        contentContainerStyle={[boxStyle, contentContainerStyle]}
        style={style}
      />
    );
  },
);

ScrollArea.displayName = "ScrollArea";

function toNativeDimension(value?: DimensionValue): ViewStyle["width"] {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value === "number" || value === "auto") {
    return value;
  }

  if (value.endsWith("%")) {
    return value as `${number}%`;
  }

  return undefined;
}

function toNativeViewStyle(
  style: ReturnType<typeof createBoxStyle> | ReturnType<typeof createSurfaceStyle>,
): ViewStyle {
  return {
    backgroundColor: style.backgroundColor,
    borderColor: style.borderColor,
    borderRadius: style.borderRadius,
    borderStyle: style.borderStyle,
    borderWidth: style.borderWidth,
    display: style.display === "flex" ? "flex" : undefined,
    flexBasis: toNativeDimension(style.flexBasis),
    flexDirection: style.flexDirection,
    flexGrow: style.flexGrow,
    flexShrink: style.flexShrink,
    flexWrap: style.flexWrap,
    gap: style.gap,
    height: toNativeDimension(style.height),
    justifyContent: style.justifyContent,
    margin: style.margin,
    maxHeight: toNativeDimension(style.maxHeight),
    maxWidth: toNativeDimension(style.maxWidth),
    minHeight: toNativeDimension(style.minHeight),
    minWidth: toNativeDimension(style.minWidth),
    padding: style.padding,
    paddingBottom: style.paddingBottom,
    paddingLeft: style.paddingLeft,
    paddingRight: style.paddingRight,
    paddingTop: style.paddingTop,
    width: toNativeDimension(style.width),
    alignItems: style.alignItems,
  };
}
