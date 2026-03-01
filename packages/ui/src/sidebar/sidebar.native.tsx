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

export interface SidebarProviderProps extends SidebarProviderSharedProps {}
export interface SidebarProps extends SidebarSharedProps {}
export interface SidebarInsetProps extends SidebarSharedProps {}
export interface SidebarMenuButtonProps extends SidebarMenuButtonSharedProps {
  readonly onPress?: () => void;
}
export interface SidebarTriggerProps {
  readonly children?: React.ReactNode;
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

export function Sidebar({ children }: SidebarProps) {
  const { open } = useSidebarContext();
  const theme = useTheme();

  return (
    <View
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

export function SidebarHeader({ children }: SidebarSharedProps) {
  const theme = useTheme();

  return <View style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.border, padding: 16 }}>{children}</View>;
}

export function SidebarFooter({ children }: SidebarSharedProps) {
  const theme = useTheme();

  return <View style={{ borderTopWidth: 1, borderTopColor: theme.colors.border, padding: 16 }}>{children}</View>;
}

export function SidebarContent({ children }: SidebarSharedProps) {
  return <ScrollView contentContainerStyle={{ gap: 16, padding: 12 }}>{children}</ScrollView>;
}

export function SidebarGroup({ children }: SidebarSharedProps) {
  return <View style={{ gap: 8 }}>{children}</View>;
}

export function SidebarGroupLabel({ children }: SidebarSharedProps) {
  const theme = useTheme();

  return (
    <Text
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

export function SidebarGroupContent({ children }: SidebarSharedProps) {
  return <View style={{ gap: 4 }}>{children}</View>;
}

export function SidebarMenu({ children }: SidebarSharedProps) {
  return <View style={{ gap: 4 }}>{children}</View>;
}

export function SidebarMenuItem({ children }: SidebarSharedProps) {
  return <View>{children}</View>;
}

export function SidebarMenuButton({ active, children, onPress }: SidebarMenuButtonProps) {
  const { open } = useSidebarContext();
  const theme = useTheme();

  return (
    <Pressable
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

export function SidebarInset({ children }: SidebarInsetProps) {
  const theme = useTheme();

  return (
    <View
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

export function SidebarRail() {
  const theme = useTheme();

  return <View style={{ alignSelf: "center", backgroundColor: theme.colors.border, borderRadius: 999, height: 40, width: 4 }} />;
}

export function SidebarTrigger({ children = "Toggle sidebar" }: SidebarTriggerProps) {
  const { toggle } = useSidebarContext();
  const theme = useTheme();

  return (
    <Pressable
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
