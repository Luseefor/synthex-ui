import * as React from "react";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  type ImperativePanelGroupHandle,
  type ImperativePanelHandle,
} from "react-resizable-panels";
import { cn } from "../_shared/variants";
import type {
  ResizableDirection,
  ResizableHandleSharedProps,
  ResizablePanelGroupSharedProps,
  ResizablePanelSharedProps,
} from "./resizable.shared";

export interface ResizablePanelGroupProps
  extends Omit<React.ComponentProps<typeof PanelGroup>, "children" | "direction">,
    ResizablePanelGroupSharedProps {
  readonly direction: ResizableDirection;
}

export interface ResizablePanelProps
  extends Omit<
      React.ComponentProps<typeof Panel>,
      "children" | "defaultSize" | "minSize" | "onResize"
    >,
    ResizablePanelSharedProps {
  readonly onResize?: (size: number, prevSize: number | undefined) => void;
}

export interface ResizableHandleProps
  extends Omit<React.ComponentProps<typeof PanelResizeHandle>, "children">,
    ResizableHandleSharedProps {
  readonly children?: React.ReactNode;
}

export const ResizablePanel = React.forwardRef<ImperativePanelHandle, ResizablePanelProps>(
  ({ children, className, defaultSize, minSize, onResize, style, ...props }, ref) => {
    const [size, setSize] = React.useState<number | undefined>(defaultSize);

    React.useEffect(() => {
      setSize(defaultSize);
    }, [defaultSize]);

    return (
      <Panel
        {...props}
        ref={ref}
        data-size={size != null ? size.toFixed(2) : undefined}
        data-slot="resizable-panel"
        className={cn("bg-card min-h-0 min-w-0 overflow-hidden", className)}
        defaultSize={defaultSize}
        minSize={minSize}
        style={style as object}
        onResize={(next, prev) => {
          setSize(next);
          onResize?.(next, prev);
        }}
      >
        {children}
      </Panel>
    );
  },
);

ResizablePanel.displayName = "ResizablePanel";

export function ResizableHandle({ children, className, withHandle = true, ...props }: ResizableHandleProps) {
  return (
    <PanelResizeHandle
      {...props}
      data-slot="resizable-handle"
      className={cn(
        "bg-border focus-visible:ring-ring group relative flex shrink-0 items-center justify-center focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-none",
        "data-[panel-group-direction=horizontal]:w-3 data-[panel-group-direction=horizontal]:cursor-col-resize",
        "data-[panel-group-direction=vertical]:h-3 data-[panel-group-direction=vertical]:cursor-row-resize",
        className,
      )}
    >
      {children ??
        (withHandle ? (
          <span
            aria-hidden="true"
            className={cn(
              "bg-card rounded-full border",
              "h-10 w-1.5 group-data-[panel-group-direction=vertical]:h-1.5 group-data-[panel-group-direction=vertical]:w-10",
            )}
          />
        ) : null)}
    </PanelResizeHandle>
  );
}

ResizableHandle.displayName = "ResizableHandle";

export const ResizablePanelGroup = React.forwardRef<
  ImperativePanelGroupHandle,
  ResizablePanelGroupProps
>(({ children, className, direction, style, ...props }, ref) => (
  <PanelGroup
    {...props}
    ref={ref}
    direction={direction}
    data-slot="resizable-panel-group"
    data-testid="resizable-group"
    className={cn(
      "bg-card flex min-h-[12rem] w-full min-w-0 overflow-hidden rounded-lg border data-[panel-group-direction=vertical]:flex-col",
      className,
    )}
    style={style}
  >
    {children}
  </PanelGroup>
));

ResizablePanelGroup.displayName = "ResizablePanelGroup";
