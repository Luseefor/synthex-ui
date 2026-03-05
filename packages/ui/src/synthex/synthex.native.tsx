import * as React from "react";
import {
  Linking,
  Pressable,
  Text,
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import { Button } from "../button/button.native";
import { Card, CardContent, CardHeader, CardTitle } from "../card/card.native";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../form/form.native";
import { Input } from "../input/input.native";
import { Textarea } from "../textarea/textarea.native";
import { useTheme } from "../_shared/theme/context";
import { useControllableState } from "../hooks/useControllableState";
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
  TimelineRowSharedProps,
} from "./synthex.shared";
import { getCadenceMax } from "./synthex.shared";

export interface AssistantChatPanelProps
  extends Omit<ViewProps, keyof AssistantChatPanelSharedProps>,
    AssistantChatPanelSharedProps {
  readonly style?: StyleProp<ViewStyle>;
}

export const AssistantChatPanel = React.forwardRef<React.ElementRef<typeof View>, AssistantChatPanelProps>(
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
      placeholder = "Ask the assistant to draft, analyze, or plan…",
      submitLabel = "Send",
      style,
      title = "Assistant",
      value,
      ...props
    },
    ref,
  ) => {
    const theme = useTheme();
    const [composerValue, setComposerValue] = useControllableState({
      defaultValue,
      onChange: onValueChange,
      value,
    });

    return (
      <Card ref={ref} variant="elevated" style={[{ minHeight: 520 }, style]} {...props}>
        <CardHeader style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.border }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 16 }}>
            <View style={{ flex: 1, gap: 4 }}>
              <CardTitle>{title}</CardTitle>
              {description ? (
                <Text style={{ color: theme.colors.foregroundMuted, lineHeight: 22 }}>{description}</Text>
              ) : null}
            </View>
            {actions}
          </View>
        </CardHeader>
        <CardContent style={{ flex: 1, gap: 16, paddingTop: 20 }}>
          <View style={{ flex: 1, gap: 12 }}>
            {messages.length === 0 ? (
              <View
                style={{
                  minHeight: 160,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderStyle: "dashed",
                  borderColor: theme.colors.border,
                  borderRadius: theme.radius.xl,
                  backgroundColor: theme.colors.surfaceMuted,
                  paddingHorizontal: 24,
                }}
              >
                <Text style={{ color: theme.colors.foregroundMuted, textAlign: "center" }}>
                  {emptyState}
                </Text>
              </View>
            ) : (
              messages.map((message) => {
                const isUser = message.role === "user";
                const isSystem = message.role === "system";

                return (
                  <View
                    key={message.id}
                    style={{ alignItems: isUser ? "flex-end" : "flex-start" }}
                  >
                    <View
                      style={{
                        maxWidth: "88%",
                        borderRadius: 18,
                        borderWidth: isUser ? 0 : 1,
                        borderColor: isSystem ? theme.colors.accent : theme.colors.border,
                        backgroundColor: isUser
                          ? theme.colors.primary
                          : isSystem
                            ? theme.colors.accentMuted
                            : theme.colors.surface,
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                      }}
                    >
                      {(message.author || message.meta) ? (
                        <View style={{ marginBottom: 8, flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
                          <Text
                            style={{
                              color: isUser ? theme.colors.foregroundOnBrand : theme.colors.foregroundMuted,
                              fontSize: theme.typography.size.xs,
                              fontWeight: theme.typography.weight.medium,
                            }}
                          >
                            {message.author ?? message.role}
                          </Text>
                          {message.meta ? (
                            <Text
                              style={{
                                color: isUser ? theme.colors.foregroundOnBrand : theme.colors.foregroundMuted,
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
                          color: isUser ? theme.colors.foregroundOnBrand : theme.colors.foreground,
                          lineHeight: 22,
                        }}
                      >
                        {message.content}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
          <Form>
            <FormField name="assistantPrompt">
              <FormItem>
                <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
                  <FormLabel>{composerLabel}</FormLabel>
                  <Text style={{ color: theme.colors.foregroundMuted, fontSize: theme.typography.size.xs }}>
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
    const [isOpen, setIsOpen] = useControllableState({
      defaultValue: defaultOpen,
      onChange: onOpenChange,
      value: open,
    });

    return (
      <View ref={ref} style={[{ alignItems: "flex-end", gap: 12 }, style]} {...props}>
        {isOpen && children ? (
          <Card
            style={{
              width: 320,
              maxWidth: "100%",
              borderColor: theme.colors.borderStrong,
              backgroundColor: theme.colors.surfaceRaised,
            }}
          >
            <CardHeader>
              <CardTitle style={{ fontSize: theme.typography.size.md }}>{title}</CardTitle>
              <Text style={{ color: theme.colors.foregroundMuted, lineHeight: 22 }}>{description}</Text>
            </CardHeader>
            <CardContent>{children}</CardContent>
          </Card>
        ) : null}
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
            opacity: pressed ? 0.92 : 1,
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
            <View
              style={{
                borderRadius: 999,
                backgroundColor: "rgba(255,255,255,0.18)",
                paddingHorizontal: 8,
                paddingVertical: 2,
              }}
            >
              <Text style={{ color: theme.colors.foregroundOnBrand, fontSize: theme.typography.size.xs }}>
                {badge}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </View>
    );
  },
);

FloatingAssistantLauncher.displayName = "FloatingAssistantLauncher";

export interface CadenceBarChartProps
  extends Omit<ViewProps, keyof CadenceBarChartSharedProps>,
    CadenceBarChartSharedProps {
  readonly style?: StyleProp<ViewStyle>;
}

export const CadenceBarChart = React.forwardRef<React.ElementRef<typeof View>, CadenceBarChartProps>(
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
    const maxValue = getCadenceMax(data);

    return (
      <Card ref={ref} style={style} {...props}>
        <CardHeader>
          <CardTitle style={{ fontSize: theme.typography.size.md }}>{title}</CardTitle>
          <Text style={{ color: theme.colors.foregroundMuted }}>{description}</Text>
        </CardHeader>
        <CardContent>
          <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8 }}>
            {data.map((entry) => (
              <View key={entry.id ?? entry.label} style={{ flex: 1, alignItems: "center", gap: 8 }}>
                <View style={{ height: 112, width: "100%", justifyContent: "flex-end" }}>
                  <View
                    style={{
                      width: "100%",
                      minHeight: 14,
                      height: `${Math.max(12, (entry.value / maxValue) * 100)}%`,
                      borderRadius: 999,
                      backgroundColor: theme.colors.primary,
                    }}
                  />
                </View>
                <Text style={{ fontSize: theme.typography.size.xs, color: theme.colors.foreground }}>
                  {valueFormatter(entry.value)}
                </Text>
                <Text style={{ fontSize: theme.typography.size.xs, color: theme.colors.foregroundMuted }}>
                  {entry.label}
                </Text>
              </View>
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
  ({ items, style, ...props }, ref) => {
    const theme = useTheme();

    return (
      <View
        ref={ref}
        style={[
          {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 12,
            borderRadius: theme.radius.xl,
            borderWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surfaceMuted,
            padding: 12,
          },
          style,
        ]}
        {...props}
      >
        {items.map((item) => (
          <View
            key={item.id}
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
            }}
          >
            <Text style={{ color: theme.colors.foreground, fontWeight: theme.typography.weight.medium }}>
              {item.label}
            </Text>
            {item.meta ? (
              <Text style={{ color: theme.colors.foregroundMuted, fontSize: theme.typography.size.xs }}>
                {item.meta}
              </Text>
            ) : null}
          </View>
        ))}
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
    const width = `${100 / columns}%` as const;

    return (
      <View
        ref={ref}
        style={[{ flexDirection: "row", flexWrap: "wrap", gap: 12 }, style]}
        {...props}
      >
        {stats.map((stat) => (
          <View key={stat.id} style={{ width, paddingRight: 12 }}>
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
              }}
            >
              <CardContent style={{ gap: 10, paddingTop: 24 }}>
                <Text style={{ color: theme.colors.foregroundMuted, fontSize: theme.typography.size.xs }}>
                  {stat.label}
                </Text>
                <Text style={{ color: theme.colors.foreground, fontSize: theme.typography.size["2xl"], fontWeight: theme.typography.weight.semibold }}>
                  {stat.value}
                </Text>
                {(stat.change || stat.detail) ? (
                  <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
                    {stat.change ? <Text style={{ color: theme.colors.foreground }}>{stat.change}</Text> : null}
                    {stat.detail ? <Text style={{ color: theme.colors.foregroundMuted }}>{stat.detail}</Text> : null}
                  </View>
                ) : null}
              </CardContent>
            </Card>
          </View>
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

    return (
      <View ref={ref} style={[{ flexDirection: "row", gap: 16 }, style]} {...props}>
        <View style={{ width: 100, gap: 8 }}>
          <Text style={{ color: theme.colors.foregroundMuted, fontSize: theme.typography.size.xs }}>
            {date}
          </Text>
          <View style={{ alignItems: "center" }}>
            <View
              style={{
                height: 10,
                width: 10,
                borderRadius: 999,
                backgroundColor: theme.colors.primary,
              }}
            />
          </View>
        </View>
        <View style={{ flex: 1, gap: 10, borderLeftWidth: 1, borderLeftColor: theme.colors.border, paddingLeft: 16 }}>
          <Text style={{ color: theme.colors.foreground, fontSize: theme.typography.size.lg, fontWeight: theme.typography.weight.semibold }}>
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
>(({ description, entries, style, title = "Experience", ...props }, ref) => (
  <Card ref={ref} style={style} {...props}>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      {description ? <Text>{description}</Text> : null}
    </CardHeader>
    <CardContent style={{ gap: 24 }}>
      {entries.map((entry) => (
        <TimelineRow key={entry.id} {...entry} />
      ))}
    </CardContent>
  </Card>
));

ExperienceTimeline.displayName = "ExperienceTimeline";

export interface ProjectCaseRowProps
  extends Omit<ViewProps, keyof ProjectCaseRowSharedProps>,
    ProjectCaseRowSharedProps {
  readonly style?: StyleProp<ViewStyle>;
}

export const ProjectCaseRow = React.forwardRef<React.ElementRef<typeof View>, ProjectCaseRowProps>(
  ({ category, ctaLabel = "Read case", href, index, metrics, style, summary, title, ...props }, ref) => {
    const theme = useTheme();

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
        <Text style={{ color: theme.colors.foregroundMuted, fontSize: theme.typography.size["2xl"], fontWeight: theme.typography.weight.semibold }}>
          {String(index).padStart(2, "0")}
        </Text>
        {category ? <Text style={{ color: theme.colors.foregroundMuted, fontSize: theme.typography.size.xs }}>{category}</Text> : null}
        <Text style={{ color: theme.colors.foreground, fontSize: theme.typography.size.xl, fontWeight: theme.typography.weight.semibold }}>
          {title}
        </Text>
        {summary ? <Text style={{ color: theme.colors.foregroundMuted, lineHeight: 22 }}>{summary}</Text> : null}
        {metrics?.length ? (
          <View style={{ gap: 8 }}>
            {metrics.map((metric, metricIndex) => (
              <View
                key={`${String(metric.label)}-${metricIndex}`}
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
            ))}
          </View>
        ) : null}
        {href ? (
          <Button
            variant="outline"
            onPress={() => {
              void Linking.openURL(href);
            }}
          >
            {ctaLabel}
          </Button>
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

export const ContactSplitForm = React.forwardRef<React.ElementRef<typeof View>, ContactSplitFormProps>(
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
              {channels.map((channel) => {
                const content = (
                  <View
                    style={{
                      borderRadius: theme.radius.lg,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.surface,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                    }}
                  >
                    <Text style={{ color: theme.colors.foregroundMuted, fontSize: theme.typography.size.xs }}>
                      {channel.label}
                    </Text>
                    <Text style={{ marginTop: 4, color: theme.colors.foreground, fontWeight: theme.typography.weight.medium }}>
                      {channel.value}
                    </Text>
                    {channel.meta ? <Text style={{ marginTop: 4, color: theme.colors.foregroundMuted }}>{channel.meta}</Text> : null}
                  </View>
                );

                if (!channel.href) {
                  return <View key={channel.id}>{content}</View>;
                }

                return (
                  <Pressable
                    key={channel.id}
                    onPress={() => {
                      void Linking.openURL(channel.href!);
                    }}
                  >
                    {content}
                  </Pressable>
                );
              })}
            </View>
          </View>
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

    return (
      <View
        ref={ref}
        style={[
          {
            borderRadius: theme.radius.xl + 6,
            borderWidth: 1,
            borderColor: theme.colors.borderStrong,
            backgroundColor: theme.colors.background,
            padding: 16,
            gap: 16,
          },
          style,
        ]}
        {...props}
      >
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
              <Text style={{ color: theme.colors.foregroundMuted, fontSize: theme.typography.size.xs }}>
                Mission HUD
              </Text>
              <Text style={{ color: theme.colors.foreground, fontSize: theme.typography.size["2xl"], fontWeight: theme.typography.weight.semibold }}>
                {title}
              </Text>
              {mission ? <Text style={{ color: theme.colors.foregroundMuted, lineHeight: 22 }}>{mission}</Text> : null}
            </View>
            {actions}
          </View>
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {metrics.map((metric) => (
            <View
              key={metric.id}
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
              <Text style={{ color: theme.colors.foregroundMuted, fontSize: theme.typography.size.xs }}>
                {metric.label}
              </Text>
              <Text style={{ marginTop: 6, color: theme.colors.foreground, fontSize: theme.typography.size.lg, fontWeight: theme.typography.weight.semibold }}>
                {metric.value}
              </Text>
            </View>
          ))}
        </View>
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
        {footer ? (
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
        ) : null}
      </View>
    );
  },
);

DungeonHUDShell.displayName = "DungeonHUDShell";
