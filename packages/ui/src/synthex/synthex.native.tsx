import * as React from "react";
import {
  Animated,
  Easing,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import { useTheme } from "../_shared/theme/context";
import { Button } from "../button/button.native";
import { Card, CardContent, CardHeader, CardTitle } from "../card/card.native";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../form/form.native";
import { useControllableState } from "../hooks/useControllableState";
import { useReducedMotion } from "../hooks/useReducedMotion.native";
import { Input } from "../input/input.native";
import { Textarea } from "../textarea/textarea.native";
import type {
  AssistantChatPanelSharedProps,
  CadenceBarChartSharedProps,
  ContactSplitFormSharedProps,
  DungeonHUDShellSharedProps,
  ExperienceTimelineSharedProps,
  FloatingAssistantLauncherSharedProps,
  KPIStatGridSharedProps,
  MarqueeSharedProps,
  ProjectCaseRowSharedProps,
  ThemeAccentName,
  ThemeAccentSwitcherSharedProps,
  TimelineRowSharedProps,
} from "./synthex.shared";
import { getCadenceMax, themeAccentPresets } from "./synthex.shared";

interface RevealProps {
  readonly children: React.ReactNode;
  readonly delay?: number;
  readonly duration?: number;
  readonly reducedMotion: boolean;
  readonly style?: StyleProp<ViewStyle>;
}

function Reveal({
  children,
  delay = 0,
  duration = 240,
  reducedMotion,
  style,
}: RevealProps) {
  const opacity = React.useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;
  const translateY = React.useRef(new Animated.Value(reducedMotion ? 0 : 12)).current;

  React.useEffect(() => {
    if (reducedMotion) {
      opacity.setValue(1);
      translateY.setValue(0);
      return;
    }

    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => {
      animation.stop();
    };
  }, [delay, duration, opacity, reducedMotion, translateY]);

  return (
    <Animated.View
      style={[
        {
          opacity,
          transform: [{ translateY }],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

function toDelay(index: number, baseDelay = 0) {
  return baseDelay + index * 70;
}

const THEME_ACCENT_ORDER: ThemeAccentName[] = ["steel", "stone", "bronze", "mulberry"];
const FALLBACK_THEME_ACCENT: ThemeAccentName = "steel";

export interface ThemeAccentSwitcherProps
  extends Omit<ViewProps, keyof ThemeAccentSwitcherSharedProps>,
    ThemeAccentSwitcherSharedProps {
  readonly style?: StyleProp<ViewStyle>;
}

export const ThemeAccentSwitcher = React.forwardRef<
  React.ElementRef<typeof View>,
  ThemeAccentSwitcherProps
>(
  (
    {
      accent,
      compact = false,
      defaultAccent: defaultAccentProp,
      defaultMode = "dark",
      defaultOpen = false,
      mode,
      onAccentChange,
      onModeChange,
      onOpenChange,
      open,
      style,
      title = "Theme",
      ...props
    },
    ref,
  ) => {
    const defaultAccent = defaultAccentProp ?? FALLBACK_THEME_ACCENT;

    const theme = useTheme();
    const reducedMotion = useReducedMotion();
    const [currentAccent, setCurrentAccent] = useControllableState<ThemeAccentName>({
      defaultValue: defaultAccent,
      onChange: onAccentChange,
      value: accent,
    });
    const [currentMode, setCurrentMode] = useControllableState<"light" | "dark">({
      defaultValue: defaultMode,
      onChange: onModeChange,
      value: mode,
    });
    const [isOpen, setIsOpen] = useControllableState({
      defaultValue: defaultOpen,
      onChange: onOpenChange,
      value: open,
    });
    const selected = themeAccentPresets[currentAccent] ?? themeAccentPresets[FALLBACK_THEME_ACCENT];

    const triggerHeight = compact ? 36 : 38;

    return (
      <View ref={ref} style={[{ position: "relative", alignItems: "flex-end" }, style]} {...props}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Theme switcher"
          accessibilityState={{ expanded: isOpen }}
          onPress={() => setIsOpen(!isOpen)}
          style={({ pressed }) => ({
            minHeight: compact ? 36 : 38,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
            paddingHorizontal: compact ? 10 : 12,
            paddingVertical: 6,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
        >
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              backgroundColor: selected.swatch,
            }}
          />
          {!compact ? (
            <Text
              style={{
                color: theme.colors.foregroundMuted,
                fontSize: theme.typography.size.xs,
                fontWeight: theme.typography.weight.semibold,
                textTransform: "uppercase",
                letterSpacing: 0.8,
              }}
            >
              {selected.label}
            </Text>
          ) : null}
          <View
            style={{
              height: 18,
              minWidth: 18,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surfaceMuted,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 4,
            }}
          >
            <Text
              style={{
                color: theme.colors.foregroundMuted,
                fontSize: 9,
                fontWeight: theme.typography.weight.semibold,
              }}
            >
              FX
            </Text>
          </View>
        </Pressable>
        {isOpen ? (
          <View
            pointerEvents="box-none"
            style={{
              position: "absolute",
              right: 0,
              bottom: triggerHeight + 10,
              zIndex: 30,
            }}
          >
            <Reveal reducedMotion={reducedMotion} duration={260}>
              <View
                style={{
                  width: 312,
                  maxWidth: 312,
                  maxHeight: 360,
                  borderRadius: theme.radius.xl + 4,
                  borderWidth: 1,
                  borderColor: theme.colors.borderStrong,
                  backgroundColor: theme.colors.backgroundSubtle,
                  padding: 14,
                  gap: 14,
                  shadowColor: "#020617",
                  shadowOpacity: 0.3,
                  shadowRadius: 18,
                  shadowOffset: { width: 0, height: 8 },
                  elevation: 7,
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <Text
                    style={{
                      color: theme.colors.foregroundMuted,
                      fontSize: theme.typography.size.xs,
                      fontWeight: theme.typography.weight.semibold,
                      textTransform: "uppercase",
                      letterSpacing: 0.8,
                    }}
                  >
                    {title}
                  </Text>
                  <Text
                    style={{
                      color: theme.colors.foregroundMuted,
                      fontSize: theme.typography.size.xs,
                      textTransform: "uppercase",
                      letterSpacing: 0.6,
                    }}
                  >
                    {selected.label}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                  <Text
                    style={{
                      color: theme.colors.foregroundMuted,
                      fontSize: theme.typography.size.xs,
                      textTransform: "uppercase",
                      letterSpacing: 0.7,
                    }}
                  >
                    Appearance
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.surface,
                      padding: 4,
                    }}
                  >
                    <Pressable
                      onPress={() => setCurrentMode("light")}
                      style={({ pressed }) => ({
                        minHeight: 28,
                        minWidth: 56,
                        borderRadius: 999,
                        paddingHorizontal: 8,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor:
                          currentMode === "light" ? theme.colors.primaryMuted : "transparent",
                        opacity: pressed ? 0.9 : 1,
                      })}
                    >
                      <Text
                        style={{
                          color:
                            currentMode === "light" ? theme.colors.foreground : theme.colors.foregroundMuted,
                          fontSize: theme.typography.size.xs,
                          fontWeight: theme.typography.weight.medium,
                        }}
                      >
                        Light
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setCurrentMode("dark")}
                      style={({ pressed }) => ({
                        minHeight: 28,
                        minWidth: 56,
                        borderRadius: 999,
                        paddingHorizontal: 8,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: currentMode === "dark" ? theme.colors.primaryMuted : "transparent",
                        opacity: pressed ? 0.9 : 1,
                      })}
                    >
                      <Text
                        style={{
                          color:
                            currentMode === "dark" ? theme.colors.foreground : theme.colors.foregroundMuted,
                          fontSize: theme.typography.size.xs,
                          fontWeight: theme.typography.weight.medium,
                        }}
                      >
                        Dark
                      </Text>
                    </Pressable>
                  </View>
                </View>
                <View style={{ gap: 8 }}>
                  <Text
                    style={{
                      color: theme.colors.foregroundMuted,
                      fontSize: theme.typography.size.xs,
                      textTransform: "uppercase",
                      letterSpacing: 0.7,
                    }}
                  >
                    Accent
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    {THEME_ACCENT_ORDER.map((accentId, index) => {
                      const preset = themeAccentPresets[accentId];
                      const isActive = currentAccent === accentId;

                      return (
                        <Reveal key={accentId} reducedMotion={reducedMotion} delay={toDelay(index, 30)} duration={220}>
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={preset.label}
                            onPress={() => setCurrentAccent(accentId)}
                            style={({ pressed }) => ({
                              width: 36,
                              height: 36,
                              borderRadius: theme.radius.md + 2,
                              borderWidth: 1,
                              borderColor: isActive ? theme.colors.primary : theme.colors.border,
                              backgroundColor: theme.colors.surface,
                              alignItems: "center",
                              justifyContent: "center",
                              opacity: pressed ? 0.88 : 1,
                              transform: [{ scale: pressed ? 0.96 : 1 }],
                            })}
                          >
                            <View
                              style={{
                                width: 16,
                                height: 16,
                                borderRadius: 999,
                                backgroundColor: preset.swatch,
                              }}
                            />
                          </Pressable>
                        </Reveal>
                      );
                    })}
                  </View>
                </View>
              </View>
            </Reveal>
          </View>
        ) : null}
      </View>
    );
  },
);

ThemeAccentSwitcher.displayName = "ThemeAccentSwitcher";

export interface AssistantChatPanelProps
  extends Omit<ViewProps, keyof AssistantChatPanelSharedProps>,
    AssistantChatPanelSharedProps {
  readonly style?: StyleProp<ViewStyle>;
}

export const AssistantChatPanel = React.forwardRef<
  React.ElementRef<typeof View>,
  AssistantChatPanelProps
>(
  (
    {
      actions,
      composerLabel = "Prompt",
      defaultValue = "",
      description = "Keep the conversation moving with a ready-made assistant shell.",
      emptyState = "No messages yet. Start with a prompt.",
      messages,
      onSubmit,
      onValueChange,
      placeholder = "Ask the assistant to draft, analyze, or plan...",
      submitLabel = "Send",
      style,
      title = "Assistant",
      value,
      ...props
    },
    ref,
  ) => {
    const theme = useTheme();
    const reducedMotion = useReducedMotion();
    const [composerValue, setComposerValue] = useControllableState({
      defaultValue,
      onChange: onValueChange,
      value,
    });

    return (
      <Card
        ref={ref}
        variant="elevated"
        style={[
          {
            minHeight: 540,
            borderColor: theme.colors.borderStrong,
            backgroundColor: theme.colors.surfaceRaised,
          },
          style,
        ]}
        {...props}
      >
        <CardHeader
          style={{
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 16 }}>
            <View style={{ flex: 1, gap: 4 }}>
              <CardTitle>{title}</CardTitle>
              {description ? (
                <Text style={{ color: theme.colors.foregroundMuted, lineHeight: 22 }}>
                  {description}
                </Text>
              ) : null}
            </View>
            {actions}
          </View>
        </CardHeader>
        <CardContent style={{ flex: 1, gap: 16, paddingTop: 20 }}>
          <View
            style={{
              flex: 1,
              borderRadius: theme.radius.xl,
              borderWidth: 1,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surfaceMuted,
              padding: 10,
            }}
          >
            {messages.length === 0 ? (
              <Reveal reducedMotion={reducedMotion}>
                <View
                  style={{
                    minHeight: 180,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderStyle: "dashed",
                    borderColor: theme.colors.border,
                    borderRadius: theme.radius.xl,
                    backgroundColor: theme.colors.surface,
                    paddingHorizontal: 24,
                  }}
                >
                  <Text style={{ color: theme.colors.foregroundMuted, textAlign: "center" }}>
                    {emptyState}
                  </Text>
                </View>
              </Reveal>
            ) : (
              <ScrollView
                contentContainerStyle={{ gap: 12, paddingRight: 4 }}
                showsVerticalScrollIndicator={false}
              >
                {messages.map((message, index) => {
                  const isUser = message.role === "user";
                  const isSystem = message.role === "system";

                  return (
                    <Reveal
                      key={message.id}
                      reducedMotion={reducedMotion}
                      delay={toDelay(index)}
                    >
                      <View style={{ alignItems: isUser ? "flex-end" : "flex-start" }}>
                        <View
                          style={{
                            maxWidth: "90%",
                            borderRadius: theme.radius.xl + 6,
                            borderWidth: isUser ? 0 : 1,
                            borderColor: isSystem ? theme.colors.accent : theme.colors.border,
                            backgroundColor: isUser
                              ? theme.colors.primary
                              : isSystem
                                ? theme.colors.accentMuted
                                : theme.colors.surface,
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                            shadowColor: "#0f172a",
                            shadowOpacity: isUser ? 0.22 : 0.1,
                            shadowRadius: 12,
                            shadowOffset: { width: 0, height: 4 },
                            elevation: isUser ? 4 : 2,
                          }}
                        >
                          {(message.author || message.meta) ? (
                            <View
                              style={{
                                marginBottom: 8,
                                flexDirection: "row",
                                justifyContent: "space-between",
                                gap: 12,
                              }}
                            >
                              <Text
                                style={{
                                  color: isUser
                                    ? theme.colors.foregroundOnBrand
                                    : theme.colors.foregroundMuted,
                                  fontSize: theme.typography.size.xs,
                                  fontWeight: theme.typography.weight.medium,
                                  textTransform: "uppercase",
                                  letterSpacing: 0.6,
                                }}
                              >
                                {message.author ?? message.role}
                              </Text>
                              {message.meta ? (
                                <Text
                                  style={{
                                    color: isUser
                                      ? theme.colors.foregroundOnBrand
                                      : theme.colors.foregroundMuted,
                                    fontSize: theme.typography.size.xs,
                                  }}
                                >
                                  {message.meta}
                                </Text>
                              ) : null}
                            </View>
                          ) : null}
                          <Text
                            style={{
                              color: isUser
                                ? theme.colors.foregroundOnBrand
                                : theme.colors.foreground,
                              lineHeight: 22,
                            }}
                          >
                            {message.content}
                          </Text>
                        </View>
                      </View>
                    </Reveal>
                  );
                })}
              </ScrollView>
            )}
          </View>
          <Reveal reducedMotion={reducedMotion} delay={90}>
            <View
              style={{
                borderRadius: theme.radius.xl,
                borderWidth: 1,
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
                padding: 12,
              }}
            >
              <Form>
                <FormField name="assistantPrompt">
                  <FormItem>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
                      <FormLabel>{composerLabel}</FormLabel>
                      <Text
                        style={{
                          color: theme.colors.foregroundMuted,
                          fontSize: theme.typography.size.xs,
                          textTransform: "uppercase",
                          letterSpacing: 0.7,
                        }}
                      >
                        Composer
                      </Text>
                    </View>
                    <FormControl>
                      <Textarea
                        value={composerValue}
                        placeholder={placeholder}
                        onChangeText={setComposerValue}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
                <View style={{ alignItems: "flex-end" }}>
                  <Button
                    onPress={() => {
                      const nextValue = composerValue.trim();

                      if (!nextValue) {
                        return;
                      }

                      onSubmit?.(nextValue);
                      setComposerValue("");
                    }}
                  >
                    {submitLabel}
                  </Button>
                </View>
              </Form>
            </View>
          </Reveal>
        </CardContent>
      </Card>
    );
  },
);

AssistantChatPanel.displayName = "AssistantChatPanel";

export interface FloatingAssistantLauncherProps
  extends Omit<ViewProps, keyof FloatingAssistantLauncherSharedProps>,
    FloatingAssistantLauncherSharedProps {
  readonly style?: StyleProp<ViewStyle>;
}

export const FloatingAssistantLauncher = React.forwardRef<
  React.ElementRef<typeof View>,
  FloatingAssistantLauncherProps
>(
  (
    {
      badge,
      children,
      defaultOpen = false,
      description = "Launch your assistant workspace.",
      label = "AI",
      onOpenChange,
      open,
      style,
      title = "Assistant dock",
      ...props
    },
    ref,
  ) => {
    const theme = useTheme();
    const reducedMotion = useReducedMotion();
    const [isOpen, setIsOpen] = useControllableState({
      defaultValue: defaultOpen,
      onChange: onOpenChange,
      value: open,
    });
    const pulse = React.useRef(new Animated.Value(0)).current;
    const badgeBob = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
      if (reducedMotion) {
        pulse.setValue(0);
        return;
      }

      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 0,
            duration: 1200,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      );

      loop.start();

      return () => {
        loop.stop();
      };
    }, [pulse, reducedMotion]);

    React.useEffect(() => {
      if (reducedMotion) {
        badgeBob.setValue(0);
        return;
      }

      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(badgeBob, {
            toValue: 1,
            duration: 900,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(badgeBob, {
            toValue: 0,
            duration: 900,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      );

      loop.start();

      return () => {
        loop.stop();
      };
    }, [badgeBob, reducedMotion]);

    return (
      <View ref={ref} style={[{ alignItems: "flex-end", gap: 12 }, style]} {...props}>
        {isOpen && children ? (
          <Reveal reducedMotion={reducedMotion} duration={280}>
            <Card
              style={{
                width: 320,
                maxWidth: "100%",
                borderColor: theme.colors.borderStrong,
                backgroundColor: theme.colors.surfaceRaised,
                shadowColor: "#0f172a",
                shadowOpacity: 0.14,
                shadowRadius: 20,
                shadowOffset: { width: 0, height: 8 },
                elevation: 6,
              }}
            >
              <CardHeader>
                <CardTitle style={{ fontSize: theme.typography.size.md }}>{title}</CardTitle>
                <Text style={{ color: theme.colors.foregroundMuted, lineHeight: 22 }}>
                  {description}
                </Text>
              </CardHeader>
              <CardContent>{children}</CardContent>
            </Card>
          </Reveal>
        ) : null}
        <View style={{ position: "relative" }}>
          <Animated.View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: -2,
              right: -2,
              bottom: -2,
              left: -2,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: theme.colors.primary,
              opacity: reducedMotion
                ? 0
                : pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0.08] }),
              transform: [
                {
                  scale: reducedMotion
                    ? 1
                    : pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }),
                },
              ],
            }}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: isOpen }}
            onPress={() => {
              setIsOpen(!isOpen);
            }}
            style={({ pressed }) => ({
              minHeight: 56,
              minWidth: 56,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: theme.colors.borderStrong,
              backgroundColor: theme.colors.primary,
              paddingHorizontal: 20,
              opacity: pressed ? 0.9 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
          >
            <Text
              style={{
                color: theme.colors.foregroundOnBrand,
                fontWeight: theme.typography.weight.semibold,
              }}
            >
              {label}
            </Text>
            {badge ? (
              <Animated.View
                style={{
                  borderRadius: 999,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  transform: [
                    {
                      translateY: reducedMotion
                        ? 0
                        : badgeBob.interpolate({ inputRange: [0, 1], outputRange: [0, -2] }),
                    },
                  ],
                }}
              >
                <Text
                  style={{
                    color: theme.colors.foregroundOnBrand,
                    fontSize: theme.typography.size.xs,
                  }}
                >
                  {badge}
                </Text>
              </Animated.View>
            ) : null}
          </Pressable>
        </View>
      </View>
    );
  },
);

FloatingAssistantLauncher.displayName = "FloatingAssistantLauncher";

function CadenceBar({
  delay,
  heightPercent,
  reducedMotion,
  themePrimary,
}: {
  readonly delay: number;
  readonly heightPercent: `${number}%`;
  readonly reducedMotion: boolean;
  readonly themePrimary: string;
}) {
  const scaleY = React.useRef(new Animated.Value(reducedMotion ? 1 : 0.16)).current;

  React.useEffect(() => {
    if (reducedMotion) {
      scaleY.setValue(1);
      return;
    }

    const animation = Animated.timing(scaleY, {
      toValue: 1,
      duration: 360,
      delay,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      useNativeDriver: true,
    });

    animation.start();

    return () => {
      animation.stop();
    };
  }, [delay, reducedMotion, scaleY]);

  return (
    <Animated.View
      style={{
        width: "100%",
        minHeight: 14,
        height: heightPercent,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: themePrimary,
        backgroundColor: themePrimary,
        transform: [{ scaleY }],
      }}
    />
  );
}

export interface CadenceBarChartProps
  extends Omit<ViewProps, keyof CadenceBarChartSharedProps>,
    CadenceBarChartSharedProps {
  readonly style?: StyleProp<ViewStyle>;
}

export const CadenceBarChart = React.forwardRef<
  React.ElementRef<typeof View>,
  CadenceBarChartProps
>(
  (
    {
      data,
      description = "Past 14 days",
      style,
      title = "Cadence",
      valueFormatter = (value) => `${value}`,
      ...props
    },
    ref,
  ) => {
    const theme = useTheme();
    const reducedMotion = useReducedMotion();
    const maxValue = getCadenceMax(data);

    return (
      <Card
        ref={ref}
        style={[
          {
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
          },
          style,
        ]}
        {...props}
      >
        <CardHeader>
          <CardTitle style={{ fontSize: theme.typography.size.md }}>{title}</CardTitle>
          <Text style={{ color: theme.colors.foregroundMuted }}>{description}</Text>
        </CardHeader>
        <CardContent>
          <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8 }}>
            {data.map((entry, index) => (
              <Reveal
                key={entry.id ?? entry.label}
                reducedMotion={reducedMotion}
                delay={toDelay(index, 90)}
                style={{ flex: 1, alignItems: "center", gap: 8 }}
              >
                <View style={{ height: 112, width: "100%", justifyContent: "flex-end" }}>
                  <CadenceBar
                    delay={toDelay(index, 120)}
                    reducedMotion={reducedMotion}
                    heightPercent={`${Math.max(12, (entry.value / maxValue) * 100)}%` as `${number}%`}
                    themePrimary={theme.colors.primary}
                  />
                </View>
                <Text style={{ fontSize: theme.typography.size.xs, color: theme.colors.foreground }}>
                  {valueFormatter(entry.value)}
                </Text>
                <Text
                  style={{
                    fontSize: theme.typography.size.xs,
                    color: theme.colors.foregroundMuted,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  {entry.label}
                </Text>
              </Reveal>
            ))}
          </View>
        </CardContent>
      </Card>
    );
  },
);

CadenceBarChart.displayName = "CadenceBarChart";

export interface MarqueeProps extends Omit<ViewProps, keyof MarqueeSharedProps>, MarqueeSharedProps {
  readonly style?: StyleProp<ViewStyle>;
}

export const Marquee = React.forwardRef<React.ElementRef<typeof View>, MarqueeProps>(
  ({ items, speed = "normal", style, ...props }, ref) => {
    const theme = useTheme();
    const reducedMotion = useReducedMotion();
    const drift = React.useRef(new Animated.Value(0)).current;
    const loopItems = [...items, ...items];
    const duration = speed === "slow" ? 2400 : speed === "fast" ? 1200 : 1800;

    React.useEffect(() => {
      if (reducedMotion) {
        drift.setValue(0);
        return;
      }

      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(drift, {
            toValue: -24,
            duration,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(drift, {
            toValue: 0,
            duration,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      );

      loop.start();

      return () => {
        loop.stop();
      };
    }, [drift, duration, reducedMotion]);

    return (
      <View
        ref={ref}
        style={[
          {
            borderRadius: theme.radius.xl + 2,
            borderWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surfaceMuted,
            overflow: "hidden",
            paddingVertical: 10,
          },
          style,
        ]}
        {...props}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Animated.View
            style={{
              flexDirection: "row",
              gap: 10,
              paddingHorizontal: 10,
              transform: [{ translateX: drift }],
            }}
          >
            {loopItems.map((item, index) => (
              <Reveal key={`${item.id}-${index}`} reducedMotion={reducedMotion} delay={toDelay(index, 40)}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.surface,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    shadowColor: "#0f172a",
                    shadowOpacity: 0.06,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 3 },
                    elevation: 2,
                  }}
                >
                  <Text
                    style={{
                      color: theme.colors.foreground,
                      fontWeight: theme.typography.weight.medium,
                    }}
                  >
                    {item.label}
                  </Text>
                  {item.meta ? (
                    <Text
                      style={{
                        color: theme.colors.foregroundMuted,
                        fontSize: theme.typography.size.xs,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      {item.meta}
                    </Text>
                  ) : null}
                </View>
              </Reveal>
            ))}
          </Animated.View>
        </ScrollView>
      </View>
    );
  },
);

Marquee.displayName = "Marquee";

export interface KPIStatGridProps
  extends Omit<ViewProps, keyof KPIStatGridSharedProps>,
    KPIStatGridSharedProps {
  readonly style?: StyleProp<ViewStyle>;
}

export const KPIStatGrid = React.forwardRef<React.ElementRef<typeof View>, KPIStatGridProps>(
  ({ columns = 2, stats, style, ...props }, ref) => {
    const theme = useTheme();
    const reducedMotion = useReducedMotion();
    const width = `${100 / columns}%` as const;

    return (
      <View
        ref={ref}
        style={[{ flexDirection: "row", flexWrap: "wrap", gap: 12 }, style]}
        {...props}
      >
        {stats.map((stat, index) => (
          <Reveal
            key={stat.id}
            reducedMotion={reducedMotion}
            delay={toDelay(index, 70)}
            style={{ width, paddingRight: 12 }}
          >
            <Card
              style={{
                backgroundColor:
                  stat.tone === "accent"
                    ? theme.colors.accentMuted
                    : stat.tone === "positive"
                      ? theme.colors.primaryMuted
                      : stat.tone === "warning"
                        ? theme.colors.secondaryMuted
                        : theme.colors.surface,
                borderColor: theme.colors.border,
                shadowColor: "#0f172a",
                shadowOpacity: 0.08,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 5 },
                elevation: 3,
              }}
            >
              <CardContent style={{ gap: 10, paddingTop: 24 }}>
                <Text
                  style={{
                    color: theme.colors.foregroundMuted,
                    fontSize: theme.typography.size.xs,
                    textTransform: "uppercase",
                    letterSpacing: 0.6,
                  }}
                >
                  {stat.label}
                </Text>
                <Text
                  style={{
                    color: theme.colors.foreground,
                    fontSize: theme.typography.size["2xl"],
                    fontWeight: theme.typography.weight.semibold,
                  }}
                >
                  {stat.value}
                </Text>
                {(stat.change || stat.detail) ? (
                  <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
                    {stat.change ? (
                      <Text style={{ color: theme.colors.foreground, fontWeight: theme.typography.weight.medium }}>
                        {stat.change}
                      </Text>
                    ) : null}
                    {stat.detail ? <Text style={{ color: theme.colors.foregroundMuted }}>{stat.detail}</Text> : null}
                  </View>
                ) : null}
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </View>
    );
  },
);

KPIStatGrid.displayName = "KPIStatGrid";

export interface TimelineRowProps
  extends Omit<ViewProps, keyof TimelineRowSharedProps>,
    TimelineRowSharedProps {
  readonly style?: StyleProp<ViewStyle>;
}

export const TimelineRow = React.forwardRef<React.ElementRef<typeof View>, TimelineRowProps>(
  ({ date, organization, style, summary, tags, title, ...props }, ref) => {
    const theme = useTheme();
    const reducedMotion = useReducedMotion();
    const markerPulse = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
      if (reducedMotion) {
        markerPulse.setValue(0);
        return;
      }

      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(markerPulse, {
            toValue: 1,
            duration: 1400,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(markerPulse, {
            toValue: 0,
            duration: 800,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      );

      loop.start();

      return () => {
        loop.stop();
      };
    }, [markerPulse, reducedMotion]);

    return (
      <View ref={ref} style={[{ flexDirection: "row", gap: 16 }, style]} {...props}>
        <View style={{ width: 100, gap: 8 }}>
          <Text
            style={{
              color: theme.colors.foregroundMuted,
              fontSize: theme.typography.size.xs,
              textTransform: "uppercase",
              letterSpacing: 0.6,
            }}
          >
            {date}
          </Text>
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <Animated.View
              pointerEvents="none"
              style={{
                position: "absolute",
                height: 18,
                width: 18,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: theme.colors.primary,
                opacity: reducedMotion
                  ? 0
                  : markerPulse.interpolate({ inputRange: [0, 1], outputRange: [0.36, 0.06] }),
                transform: [
                  {
                    scale: reducedMotion
                      ? 1
                      : markerPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] }),
                  },
                ],
              }}
            />
            <Animated.View
              style={{
                height: 10,
                width: 10,
                borderRadius: 999,
                backgroundColor: theme.colors.primary,
                shadowColor: theme.colors.primary,
                shadowOpacity: 0.35,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 0 },
                transform: [
                  {
                    scale: reducedMotion
                      ? 1
                      : markerPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }),
                  },
                ],
              }}
            />
          </View>
        </View>
        <View
          style={{
            flex: 1,
            gap: 10,
            borderLeftWidth: 1,
            borderLeftColor: theme.colors.border,
            paddingLeft: 16,
          }}
        >
          <Text
            style={{
              color: theme.colors.foreground,
              fontSize: theme.typography.size.lg,
              fontWeight: theme.typography.weight.semibold,
            }}
          >
            {title}
          </Text>
          {organization ? <Text style={{ color: theme.colors.foregroundMuted }}>{organization}</Text> : null}
          {summary ? <Text style={{ color: theme.colors.foregroundMuted, lineHeight: 22 }}>{summary}</Text> : null}
          {tags?.length ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {tags.map((tag, index) => (
                <View
                  key={`${String(tag)}-${index}`}
                  style={{
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.surface,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                  }}
                >
                  <Text style={{ color: theme.colors.foregroundMuted, fontSize: theme.typography.size.xs }}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </View>
    );
  },
);

TimelineRow.displayName = "TimelineRow";

export interface ExperienceTimelineProps
  extends Omit<ViewProps, keyof ExperienceTimelineSharedProps>,
    ExperienceTimelineSharedProps {
  readonly style?: StyleProp<ViewStyle>;
}

export const ExperienceTimeline = React.forwardRef<
  React.ElementRef<typeof View>,
  ExperienceTimelineProps
>(({ description, entries, style, title = "Experience", ...props }, ref) => {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();

  return (
    <Card
      ref={ref}
      style={[
        {
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
        },
        style,
      ]}
      {...props}
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <Text style={{ color: theme.colors.foregroundMuted }}>{description}</Text> : null}
      </CardHeader>
      <CardContent style={{ gap: 24 }}>
        {entries.map((entry, index) => (
          <Reveal key={entry.id} reducedMotion={reducedMotion} delay={toDelay(index, 80)}>
            <TimelineRow {...entry} />
          </Reveal>
        ))}
      </CardContent>
    </Card>
  );
});

ExperienceTimeline.displayName = "ExperienceTimeline";

export interface ProjectCaseRowProps
  extends Omit<ViewProps, keyof ProjectCaseRowSharedProps>,
    ProjectCaseRowSharedProps {
  readonly style?: StyleProp<ViewStyle>;
}

export const ProjectCaseRow = React.forwardRef<React.ElementRef<typeof View>, ProjectCaseRowProps>(
  ({ category, ctaLabel = "Read case", href, index, metrics, style, summary, title, ...props }, ref) => {
    const theme = useTheme();
    const reducedMotion = useReducedMotion();

    return (
      <View
        ref={ref}
        style={[
          {
            gap: 16,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
            paddingVertical: 24,
          },
          style,
        ]}
        {...props}
      >
        <Reveal reducedMotion={reducedMotion} delay={40}>
          <View
            style={{
              height: 56,
              width: 56,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 999,
              borderWidth: 1,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surfaceMuted,
            }}
          >
            <Text
              style={{
                color: theme.colors.foregroundMuted,
                fontSize: theme.typography.size["2xl"],
                fontWeight: theme.typography.weight.semibold,
              }}
            >
              {String(index).padStart(2, "0")}
            </Text>
          </View>
        </Reveal>
        {category ? (
          <Reveal reducedMotion={reducedMotion} delay={80}>
            <Text
              style={{
                color: theme.colors.foregroundMuted,
                fontSize: theme.typography.size.xs,
                textTransform: "uppercase",
                letterSpacing: 0.7,
              }}
            >
              {category}
            </Text>
          </Reveal>
        ) : null}
        <Reveal reducedMotion={reducedMotion} delay={100}>
          <Text
            style={{
              color: theme.colors.foreground,
              fontSize: theme.typography.size.xl,
              fontWeight: theme.typography.weight.semibold,
            }}
          >
            {title}
          </Text>
        </Reveal>
        {summary ? (
          <Reveal reducedMotion={reducedMotion} delay={120}>
            <Text style={{ color: theme.colors.foregroundMuted, lineHeight: 22 }}>{summary}</Text>
          </Reveal>
        ) : null}
        {metrics?.length ? (
          <View style={{ gap: 8 }}>
            {metrics.map((metric, metricIndex) => (
              <Reveal
                key={`${String(metric.label)}-${metricIndex}`}
                reducedMotion={reducedMotion}
                delay={toDelay(metricIndex, 140)}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    gap: 12,
                    borderRadius: theme.radius.lg,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.surfaceMuted,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                  }}
                >
                  <Text style={{ color: theme.colors.foregroundMuted, fontSize: theme.typography.size.xs }}>
                    {metric.label}
                  </Text>
                  <Text style={{ color: theme.colors.foreground, fontWeight: theme.typography.weight.semibold }}>
                    {metric.value}
                  </Text>
                </View>
              </Reveal>
            ))}
          </View>
        ) : null}
        {href ? (
          <Reveal reducedMotion={reducedMotion} delay={180}>
            <Button
              variant="outline"
              onPress={() => {
                void Linking.openURL(href);
              }}
            >
              {ctaLabel}
            </Button>
          </Reveal>
        ) : null}
      </View>
    );
  },
);

ProjectCaseRow.displayName = "ProjectCaseRow";

export interface ContactSplitFormProps
  extends Omit<ViewProps, keyof ContactSplitFormSharedProps>,
    ContactSplitFormSharedProps {
  readonly style?: StyleProp<ViewStyle>;
}

export const ContactSplitForm = React.forwardRef<
  React.ElementRef<typeof View>,
  ContactSplitFormProps
>(
  (
    {
      channels,
      defaultEmail = "",
      defaultMessage = "",
      defaultName = "",
      description = "Put channel context on the left and a contact form on the right.",
      onSubmit,
      style,
      submitLabel = "Send inquiry",
      title = "Contact",
      ...props
    },
    ref,
  ) => {
    const theme = useTheme();
    const reducedMotion = useReducedMotion();
    const [name, setName] = React.useState(defaultName);
    const [email, setEmail] = React.useState(defaultEmail);
    const [message, setMessage] = React.useState(defaultMessage);

    return (
      <Card ref={ref} style={style} {...props}>
        <View style={{ gap: 0 }}>
          <View
            style={{
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border,
              backgroundColor: theme.colors.surfaceMuted,
              padding: 24,
              gap: 8,
            }}
          >
            <CardTitle>{title}</CardTitle>
            <Text style={{ color: theme.colors.foregroundMuted, lineHeight: 22 }}>{description}</Text>
            <View style={{ marginTop: 12, gap: 12 }}>
              {channels.map((channel, index) => {
                const content = (
                  <View
                    style={{
                      borderRadius: theme.radius.lg,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.surface,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      shadowColor: "#0f172a",
                      shadowOpacity: 0.06,
                      shadowRadius: 8,
                      shadowOffset: { width: 0, height: 3 },
                      elevation: 2,
                    }}
                  >
                    <Text
                      style={{
                        color: theme.colors.foregroundMuted,
                        fontSize: theme.typography.size.xs,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      {channel.label}
                    </Text>
                    <Text
                      style={{
                        marginTop: 4,
                        color: theme.colors.foreground,
                        fontWeight: theme.typography.weight.medium,
                      }}
                    >
                      {channel.value}
                    </Text>
                    {channel.meta ? (
                      <Text style={{ marginTop: 4, color: theme.colors.foregroundMuted }}>
                        {channel.meta}
                      </Text>
                    ) : null}
                  </View>
                );

                const wrapped = (
                  <Reveal reducedMotion={reducedMotion} delay={toDelay(index, 60)}>
                    {content}
                  </Reveal>
                );

                if (!channel.href) {
                  return <View key={channel.id}>{wrapped}</View>;
                }

                return (
                  <Pressable
                    key={channel.id}
                    onPress={() => {
                      void Linking.openURL(channel.href!);
                    }}
                  >
                    {wrapped}
                  </Pressable>
                );
              })}
            </View>
          </View>
          <Reveal reducedMotion={reducedMotion} delay={120}>
            <View style={{ padding: 24 }}>
              <Form>
                <FormField name="contact-name">
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input value={name} onChangeText={setName} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
                <FormField name="contact-email">
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input value={email} onChangeText={setEmail} keyboardType="email-address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
                <FormField name="contact-message">
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea value={message} onChangeText={setMessage} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
                <View style={{ alignItems: "flex-end" }}>
                  <Button
                    onPress={() => {
                      onSubmit?.({ email, message, name });
                    }}
                  >
                    {submitLabel}
                  </Button>
                </View>
              </Form>
            </View>
          </Reveal>
        </View>
      </Card>
    );
  },
);

ContactSplitForm.displayName = "ContactSplitForm";

export interface DungeonHUDShellProps
  extends Omit<ViewProps, keyof DungeonHUDShellSharedProps>,
    DungeonHUDShellSharedProps {
  readonly style?: StyleProp<ViewStyle>;
}

export const DungeonHUDShell = React.forwardRef<React.ElementRef<typeof View>, DungeonHUDShellProps>(
  ({ actions, children, footer, metrics, mission, sidebar, style, title, ...props }, ref) => {
    const theme = useTheme();
    const reducedMotion = useReducedMotion();

    return (
      <View
        ref={ref}
        style={[
          {
            borderRadius: theme.radius.xl + 6,
            borderWidth: 1,
            borderColor: theme.colors.borderStrong,
            backgroundColor: theme.colors.backgroundSubtle,
            padding: 16,
            gap: 16,
          },
          style,
        ]}
        {...props}
      >
        <Reveal reducedMotion={reducedMotion} delay={40}>
          <View
            style={{
              borderRadius: theme.radius.lg,
              borderWidth: 1,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surfaceRaised,
              padding: 16,
              gap: 6,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 16 }}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text
                  style={{
                    color: theme.colors.foregroundMuted,
                    fontSize: theme.typography.size.xs,
                    textTransform: "uppercase",
                    letterSpacing: 0.6,
                  }}
                >
                  Mission HUD
                </Text>
                <Text
                  style={{
                    color: theme.colors.foreground,
                    fontSize: theme.typography.size["2xl"],
                    fontWeight: theme.typography.weight.semibold,
                  }}
                >
                  {title}
                </Text>
                {mission ? <Text style={{ color: theme.colors.foregroundMuted, lineHeight: 22 }}>{mission}</Text> : null}
              </View>
              {actions}
            </View>
          </View>
        </Reveal>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {metrics.map((metric, index) => (
            <Reveal
              key={metric.id}
              reducedMotion={reducedMotion}
              delay={toDelay(index, 80)}
              style={{
                minWidth: 120,
                flex: 1,
                borderRadius: theme.radius.lg,
                borderWidth: 1,
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
                paddingHorizontal: 16,
                paddingVertical: 12,
              }}
            >
              <Text
                style={{
                  color: theme.colors.foregroundMuted,
                  fontSize: theme.typography.size.xs,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                {metric.label}
              </Text>
              <Text
                style={{
                  marginTop: 6,
                  color: theme.colors.foreground,
                  fontSize: theme.typography.size.lg,
                  fontWeight: theme.typography.weight.semibold,
                }}
              >
                {metric.value}
              </Text>
            </Reveal>
          ))}
        </View>
        <Reveal reducedMotion={reducedMotion} delay={110}>
          <View
            style={{
              minHeight: 240,
              borderRadius: theme.radius.lg,
              borderWidth: 1,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
              padding: 16,
            }}
          >
            {children}
          </View>
        </Reveal>
        <Reveal reducedMotion={reducedMotion} delay={130}>
          <View
            style={{
              borderRadius: theme.radius.lg,
              borderWidth: 1,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surfaceMuted,
              padding: 16,
            }}
          >
            {sidebar}
          </View>
        </Reveal>
        {footer ? (
          <Reveal reducedMotion={reducedMotion} delay={150}>
            <View
              style={{
                borderRadius: theme.radius.lg,
                borderWidth: 1,
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surfaceMuted,
                padding: 16,
              }}
            >
              <Text style={{ color: theme.colors.foregroundMuted }}>{footer}</Text>
            </View>
          </Reveal>
        ) : null}
      </View>
    );
  },
);

DungeonHUDShell.displayName = "DungeonHUDShell";
