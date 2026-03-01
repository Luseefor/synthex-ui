import * as React from "react";
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

export interface BoxProps
  extends React.HTMLAttributes<HTMLElement>,
    BoxStyleProps {
  readonly as?: React.ElementType;
}

export const Box = React.forwardRef<HTMLElement, BoxProps>(
  (
    {
      as: Component = "div",
      style,
      align,
      background,
      basis,
      border,
      direction,
      foreground,
      gap,
      grow,
      height,
      justify,
      margin,
      maxHeight,
      maxWidth,
      minHeight,
      minWidth,
      padding,
      paddingX,
      paddingY,
      radius,
      shadow,
      shrink,
      width,
      wrap,
      ...domProps
    },
    ref,
  ) => {
    const theme = useTheme();
    const boxStyle = createBoxStyle(theme, {
      align,
      background,
      basis,
      border,
      direction,
      foreground,
      gap,
      grow,
      height,
      justify,
      margin,
      maxHeight,
      maxWidth,
      minHeight,
      minWidth,
      padding,
      paddingX,
      paddingY,
      radius,
      shadow,
      shrink,
      width,
      wrap,
    });

    return React.createElement(Component, {
      ...domProps,
      ref,
      style: { ...boxStyle, ...style },
    });
  },
);

Box.displayName = "Box";

export interface TextProps
  extends React.HTMLAttributes<HTMLElement>,
    TextStyleProps {
  readonly as?: React.ElementType;
}

export const Text = React.forwardRef<HTMLElement, TextProps>(
  (
    {
      as: Component = "span",
      style,
      align,
      mono,
      size,
      tone,
      weight,
      ...domProps
    },
    ref,
  ) => {
    const theme = useTheme();
    const textStyle = createTextStyle(theme, {
      align,
      mono,
      size,
      tone,
      weight,
    });

    return React.createElement(Component, {
      ...domProps,
      ref,
      style: { ...textStyle, ...style },
    });
  },
);

Text.displayName = "Text";

export interface StackProps extends Omit<BoxProps, "as" | "direction"> {}

export const Stack = React.forwardRef<HTMLDivElement, StackProps>((props, ref) => (
  <Box ref={ref} direction="column" {...props} />
));

Stack.displayName = "Stack";

export interface InlineProps extends Omit<BoxProps, "as" | "direction"> {}

export const Inline = React.forwardRef<HTMLDivElement, InlineProps>((props, ref) => (
  <Box ref={ref} direction="row" {...props} />
));

Inline.displayName = "Inline";

export interface GridProps extends Omit<BoxProps, "as" | "direction" | "wrap"> {
  readonly columns?: number;
  readonly minItemWidth?: DimensionValue;
}

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  (
    {
      columns = 3,
      minItemWidth,
      style,
      align,
      background,
      basis,
      border,
      foreground,
      gap,
      grow,
      height,
      justify,
      margin,
      maxHeight,
      maxWidth,
      minHeight,
      minWidth,
      padding,
      paddingX,
      paddingY,
      radius,
      shadow,
      shrink,
      width,
      ...domProps
    },
    ref,
  ) => {
    const theme = useTheme();
    const boxStyle = createBoxStyle(theme, {
      align,
      background,
      basis,
      border,
      foreground,
      gap,
      grow,
      height,
      justify,
      margin,
      maxHeight,
      maxWidth,
      minHeight,
      minWidth,
      padding,
      paddingX,
      paddingY,
      radius,
      shadow,
      shrink,
      width,
    });

    return (
      <div
        {...domProps}
        ref={ref}
        style={{
          ...boxStyle,
          display: "grid",
          gridTemplateColumns: minItemWidth
            ? `repeat(auto-fit, minmax(${String(minItemWidth)}, 1fr))`
            : `repeat(${columns}, minmax(0, 1fr))`,
          ...style,
        }}
      />
    );
  },
);

Grid.displayName = "Grid";

export interface SurfaceProps
  extends React.HTMLAttributes<HTMLDivElement>,
    SurfaceStyleProps {}

export const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(
  (
    {
      style,
      align,
      background,
      basis,
      border,
      direction,
      foreground,
      gap,
      grow,
      height,
      justify,
      margin,
      maxHeight,
      maxWidth,
      minHeight,
      minWidth,
      padding,
      paddingX,
      paddingY,
      radius,
      shadow,
      shrink,
      tone,
      width,
      wrap,
      ...domProps
    },
    ref,
  ) => {
    const theme = useTheme();
    const surfaceStyle = createSurfaceStyle(theme, {
      align,
      background,
      basis,
      border,
      direction,
      foreground,
      gap,
      grow,
      height,
      justify,
      margin,
      maxHeight,
      maxWidth,
      minHeight,
      minWidth,
      padding,
      paddingX,
      paddingY,
      radius,
      shadow,
      shrink,
      tone,
      width,
      wrap,
    });

    return <div {...domProps} ref={ref} style={{ ...surfaceStyle, ...style }} />;
  },
);

Surface.displayName = "Surface";

export interface PressablePrimitiveProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    BoxStyleProps {}

export const PressablePrimitive = React.forwardRef<
  HTMLButtonElement,
  PressablePrimitiveProps
>(
  (
    {
      style,
      type = "button",
      align,
      background,
      basis,
      border,
      direction,
      foreground,
      gap,
      grow,
      height,
      justify,
      margin,
      maxHeight,
      maxWidth,
      minHeight,
      minWidth,
      padding,
      paddingX,
      paddingY,
      radius,
      shadow,
      shrink,
      width,
      wrap,
      ...domProps
    },
    ref,
  ) => {
  const theme = useTheme();
  const pressableStyle = createBoxStyle(theme, {
    align,
    background,
    basis,
    border,
    direction,
    foreground,
    gap,
    grow,
    height,
    justify,
    margin,
    maxHeight,
    maxWidth,
    minHeight,
    minWidth,
    padding,
    paddingX,
    paddingY,
    radius,
    shadow,
    shrink,
    width,
    wrap,
  });

  return (
    <button
      {...domProps}
      ref={ref}
      type={type}
      style={{
        ...pressableStyle,
        cursor: domProps.disabled ? "not-allowed" : "pointer",
        fontFamily: theme.typography.family.sans,
        backgroundColor: pressableStyle.backgroundColor ?? "transparent",
        color: pressableStyle.color ?? theme.colors.foreground,
        transition: `transform var(--sx-motion-fast) var(--sx-easing-standard), box-shadow var(--sx-motion-fast) var(--sx-easing-standard)`,
        ...style,
      }}
    />
  );
},
);

PressablePrimitive.displayName = "PressablePrimitive";

export interface ScrollAreaProps
  extends React.HTMLAttributes<HTMLDivElement>,
    Omit<BoxStyleProps, "direction" | "wrap"> {
  readonly scrollbar?: "visible" | "hidden";
}

export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  (
    {
      scrollbar = "visible",
      style,
      align,
      background,
      basis,
      border,
      foreground,
      gap,
      grow,
      height,
      justify,
      margin,
      maxHeight,
      maxWidth,
      minHeight,
      minWidth,
      padding,
      paddingX,
      paddingY,
      radius,
      shadow,
      shrink,
      width,
      ...domProps
    },
    ref,
  ) => {
    const theme = useTheme();
    const boxStyle = createBoxStyle(theme, {
      align,
      background,
      basis,
      border,
      foreground,
      gap,
      grow,
      height,
      justify,
      margin,
      maxHeight,
      maxWidth,
      minHeight,
      minWidth,
      padding,
      paddingX,
      paddingY,
      radius,
      shadow,
      shrink,
      width,
    });

    return (
      <div
        {...domProps}
        ref={ref}
        style={{
          ...boxStyle,
          overflow: "auto",
          scrollbarWidth: scrollbar === "hidden" ? "none" : undefined,
          ...style,
        }}
      />
    );
  },
);

ScrollArea.displayName = "ScrollArea";

export interface SpacedProps {
  readonly gap?: SpaceValue;
}

export function useResolvedGap(gap?: SpaceValue) {
  const theme = useTheme();

  return resolveSpace(theme, gap);
}
