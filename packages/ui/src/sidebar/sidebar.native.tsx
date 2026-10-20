import * as React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useTheme } from "../_shared/theme/context";
import type {
  SidebarContextValue,
  SidebarMenuButtonSharedProps,
  SidebarProviderSharedProps,
  SidebarSharedProps,
} from "./sidebar.shared";

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

function useSidebarContext() {
  const context = React.useContext(SidebarContext);

  if (!context) {
    throw new Error("Sidebar components must be wrapped in SidebarProvider.");
  }

  return context;
}

export interface SidebarProviderProps extends SidebarProviderSharedProps {
  readonly testID?: string;
}
export interface SidebarProps extends SidebarSharedProps {
  readonly testID?: string;
}
export interface SidebarInsetProps extends SidebarSharedProps {
  readonly testID?: string;
}
export interface SidebarMenuButtonProps extends SidebarMenuButtonSharedProps {
  readonly onPress?: () => void;
  readonly testID?: string;
}
export interface SidebarTriggerProps {
  readonly children?: React.ReactNode;
  readonly testID?: string;
}

export function SidebarProvider({ children, defaultOpen = true }: SidebarProviderProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const value = React.useMemo(
    () => ({
      open,
      setOpen,
      toggle: () => setOpen((current) => !current),
    }),
    [open],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  return useSidebarContext();
}

export function Sidebar({ children, testID }: SidebarProps) {
  const { open } = useSidebarContext();
  const theme = useTheme();

  return (
    <View
      testID={testID ?? "sidebar"}
      style={{
        width: open ? 288 : 88,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.lg + 2,
        backgroundColor: theme.colors.surface,
      }}
    >
      {children}
    </View>
  );
}

export function SidebarHeader({ children, testID }: SidebarSharedProps & { readonly testID?: string }) {
  const theme = useTheme();

  return <View testID={testID ?? "sidebar-header"} style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.border, padding: 16 }}>{children}</View>;
}

export function SidebarFooter({ children, testID }: SidebarSharedProps & { readonly testID?: string }) {
  const theme = useTheme();

  return <View testID={testID ?? "sidebar-footer"} style={{ borderTopWidth: 1, borderTopColor: theme.colors.border, padding: 16 }}>{children}</View>;
}

export function SidebarContent({ children, testID }: SidebarSharedProps & { readonly testID?: string }) {
  return <ScrollView testID={testID ?? "sidebar-content"} contentContainerStyle={{ gap: 16, padding: 12 }}>{children}</ScrollView>;
}

export function SidebarGroup({ children, testID }: SidebarSharedProps & { readonly testID?: string }) {
  return <View testID={testID ?? "sidebar-group"} style={{ gap: 8 }}>{children}</View>;
}

export function SidebarGroupLabel({ children, testID }: SidebarSharedProps & { readonly testID?: string }) {
  const theme = useTheme();

  return (
    <Text
      testID={testID ?? "sidebar-group-label"}
      style={{
        color: theme.colors.foregroundMuted,
        fontSize: theme.typography.size.xs,
        fontWeight: "600",
        letterSpacing: 1,
        paddingHorizontal: 12,
        textTransform: "uppercase",
      }}
    >
      {children}
    </Text>
  );
}

export function SidebarGroupContent({ children, testID }: SidebarSharedProps & { readonly testID?: string }) {
  return <View testID={testID ?? "sidebar-group-content"} style={{ gap: 4 }}>{children}</View>;
}

export function SidebarMenu({ children, testID }: SidebarSharedProps & { readonly testID?: string }) {
  return <View testID={testID ?? "sidebar-menu"} style={{ gap: 4 }}>{children}</View>;
}

export function SidebarMenuItem({ children, testID }: SidebarSharedProps & { readonly testID?: string }) {
  return <View testID={testID ?? "sidebar-menu-item"}>{children}</View>;
}

export function SidebarMenuButton({ active, children, onPress, testID }: SidebarMenuButtonProps) {
  const { open } = useSidebarContext();
  const theme = useTheme();

  return (
    <Pressable
      testID={testID ?? "sidebar-menu-button"}
      accessibilityRole="button"
      onPress={onPress}
      style={{
        alignItems: "center",
        backgroundColor: active ? theme.colors.primaryMuted : "transparent",
        borderRadius: theme.radius.md,
        flexDirection: "row",
        gap: 12,
        justifyContent: open ? "flex-start" : "center",
        paddingHorizontal: open ? 12 : 0,
        paddingVertical: 10,
      }}
    >
      {typeof children === "string" ? (
        <Text
          style={{
            color: active ? theme.colors.foreground : theme.colors.foregroundMuted,
            fontSize: theme.typography.size.sm,
            fontWeight: "500",
          }}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

export function SidebarInset({ children, testID }: SidebarInsetProps) {
  const theme = useTheme();

  return (
    <View
      testID={testID ?? "sidebar-inset"}
      style={{
        backgroundColor: theme.colors.surfaceMuted,
        borderRadius: theme.radius.lg + 2,
        flex: 1,
      }}
    >
      {children}
    </View>
  );
}

export function SidebarRail({ testID }: { readonly testID?: string } = {}) {
  const theme = useTheme();

  return <View testID={testID ?? "sidebar-rail"} style={{ alignSelf: "center", backgroundColor: theme.colors.border, borderRadius: 999, height: 40, width: 4 }} />;
}

export function SidebarTrigger({ children = "Toggle sidebar", testID }: SidebarTriggerProps) {
  const { toggle } = useSidebarContext();
  const theme = useTheme();

  return (
    <Pressable
      testID={testID ?? "sidebar-trigger"}
      accessibilityRole="button"
      onPress={toggle}
      style={{
        alignItems: "center",
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        justifyContent: "center",
        paddingHorizontal: 12,
        paddingVertical: 10,
      }}
    >
      <Text style={{ color: theme.colors.foreground, fontSize: theme.typography.size.sm, fontWeight: "500" }}>
        {children}
      </Text>
    </Pressable>
  );
}
