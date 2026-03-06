import * as React from "react";
import { Pressable, View, type ViewProps } from "react-native";
import { type ResizableHandleSharedProps, type ResizablePanelGroupSharedProps, type ResizablePanelSharedProps } from "./resizable.shared";
export interface ResizablePanelGroupProps extends Omit<ViewProps, "children">, ResizablePanelGroupSharedProps {
}
export interface ResizablePanelProps extends Omit<ViewProps, "children">, ResizablePanelSharedProps {
}
export interface ResizableHandleProps extends React.ComponentPropsWithoutRef<typeof Pressable>, ResizableHandleSharedProps {
}
export declare const ResizablePanel: React.ForwardRefExoticComponent<ResizablePanelProps & React.RefAttributes<View>>;
export declare const ResizableHandle: React.ForwardRefExoticComponent<ResizableHandleProps & React.RefAttributes<View>>;
export declare const ResizablePanelGroup: React.ForwardRefExoticComponent<ResizablePanelGroupProps & React.RefAttributes<View>>;
//# sourceMappingURL=resizable.native.d.ts.map