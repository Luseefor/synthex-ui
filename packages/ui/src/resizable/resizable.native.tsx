import * as React from "react";
import { Pressable, View, type ViewProps, type ViewStyle } from "react-native";
import { useTheme } from "../_shared/theme/context";
import {
  normalizePanelSizes,
  type ResizableDirection,
  type ResizableHandleSharedProps,
  type ResizablePanelGroupSharedProps,
  type ResizablePanelSharedProps,
} from "./resizable.shared";

interface InternalPanelProps extends ResizablePanelSharedProps {
  readonly __direction?: ResizableDirection;
  readonly __size?: number;
}

export interface ResizablePanelGroupProps extends Omit<ViewProps, "children">, ResizablePanelGroupSharedProps {}
export interface ResizablePanelProps extends Omit<ViewProps, "children">, ResizablePanelSharedProps {}
export interface ResizableHandleProps
  extends React.ComponentPropsWithoutRef<typeof Pressable>,
    ResizableHandleSharedProps {}

export const ResizablePanel = React.forwardRef<React.ElementRef<typeof View>, ResizablePanelProps>(
  ({ children, defaultSize, minSize = 15, style, ...props }, ref) => {
    const { __direction, __size, ...viewProps } = props as ResizablePanelProps & InternalPanelProps;
    const theme = useTheme();
    const size = __size ?? defaultSize ?? 100;

    return (
      <View
        {...viewProps}
        ref={ref}
        style={[
          {
            flexGrow: size,
            flexShrink: 1,
            minHeight: __direction === "vertical" ? `${minSize}%` : undefined,
            minWidth: __direction === "horizontal" ? `${minSize}%` : undefined,
            overflow: "hidden",
            backgroundColor: theme.colors.surfaceRaised,
          },
          style,
        ]}
      >
        {children}
      </View>
    );
  },
);

ResizablePanel.displayName = "ResizablePanel";

export const ResizableHandle = React.forwardRef<React.ElementRef<typeof Pressable>, ResizableHandleProps>(
  ({ style, withHandle = true, ...props }, ref) => {
    const theme = useTheme();
    const handleStyle: ViewStyle = {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
      minHeight: 12,
      minWidth: 12,
    };

    return (
      <Pressable
        ref={ref}
        accessibilityRole="adjustable"
        {...props}
        style={typeof style === "function" ? style : [handleStyle, style]}
      >
        {withHandle ? (
          <View
            style={{
              backgroundColor: theme.colors.borderStrong,
              borderRadius: 999,
              height: 4,
              width: 40,
            }}
          />
        ) : null}
      </Pressable>
    );
  },
);

ResizableHandle.displayName = "ResizableHandle";

export const ResizablePanelGroup = React.forwardRef<React.ElementRef<typeof View>, ResizablePanelGroupProps>(
  ({ children, direction, style, ...props }, ref) => {
    const theme = useTheme();
    const childArray = React.Children.toArray(children).filter(React.isValidElement) as Array<
      React.ReactElement<any>
    >;
    const panels = childArray.filter(
      (child): child is React.ReactElement<ResizablePanelProps> => child.type === ResizablePanel,
    );
    const sizes = normalizePanelSizes(
      panels.map((panel) => ({
        defaultSize: panel.props.defaultSize,
        minSize: panel.props.minSize ?? 15,
      })),
    );

    let panelIndex = 0;

    return (
      <View
        {...props}
        ref={ref}
        style={[
          {
            flexDirection: direction === "horizontal" ? "row" : "column",
            overflow: "hidden",
            borderRadius: theme.radius.lg,
            borderWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
            minHeight: 192,
          },
          style,
        ]}
      >
        {childArray.map((child) => {
          if (child.type === ResizablePanel) {
            const next = React.cloneElement(child as React.ReactElement<any>, {
              __direction: direction,
              __size: sizes[panelIndex],
            } satisfies Partial<InternalPanelProps>);
            panelIndex += 1;
            return next;
          }

          return child;
        })}
      </View>
    );
  },
);

ResizablePanelGroup.displayName = "ResizablePanelGroup";
