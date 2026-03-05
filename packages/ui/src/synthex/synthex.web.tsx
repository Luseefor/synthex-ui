import * as React from "react";
import { cn } from "../_shared/variants";
import { Button } from "../button/button.web";
import { Card, CardContent, CardHeader, CardTitle } from "../card/card.web";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../form/form.web";
import { useControllableState } from "../hooks/useControllableState";
import { Input } from "../input/input.web";
import { Textarea } from "../textarea/textarea.web";
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

function getStaggerStyle(index: number, baseDelay = 0): React.CSSProperties {
  return {
    animationDelay: `${baseDelay + index * 70}ms`,
  };
}

export interface AssistantChatPanelProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, keyof AssistantChatPanelSharedProps>,
    AssistantChatPanelSharedProps {}

export const AssistantChatPanel = React.forwardRef<HTMLDivElement, AssistantChatPanelProps>(
  (
    {
      actions,
      className,
      composerLabel = "Prompt",
      defaultValue = "",
      description = "Keep the conversation moving with a ready-made assistant shell.",
      emptyState = "No messages yet. Start with a prompt.",
      messages,
      onSubmit,
      onValueChange,
      placeholder = "Ask the assistant to draft, analyze, or plan...",
      submitLabel = "Send",
      title = "Assistant",
      value,
      ...props
    },
    ref,
  ) => {
    const [composerValue, setComposerValue] = useControllableState({
      defaultValue,
      onChange: onValueChange,
      value,
    });

    const handleSubmit = React.useCallback(
      (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const nextValue = composerValue.trim();

        if (!nextValue) {
          return;
        }

        onSubmit?.(nextValue);
        setComposerValue("");
      },
      [composerValue, onSubmit, setComposerValue],
    );

    return (
      <Card
        ref={ref}
        variant="elevated"
        className={cn(
          "relative flex h-full min-h-[34rem] flex-col overflow-hidden border-[color:color-mix(in_srgb,var(--sx-color-border)_86%,transparent)] bg-[radial-gradient(circle_at_top_right,color-mix(in_srgb,var(--sx-color-primary-muted)_62%,transparent),var(--sx-color-surface)_48%)] shadow-[var(--sx-shadow-lg)]",
          className,
        )}
        {...props}
      >
        <div className="pointer-events-none absolute inset-0 opacity-40 [background:linear-gradient(165deg,transparent_12%,color-mix(in_srgb,var(--sx-color-primary-muted)_28%,transparent)_48%,transparent_82%)]" />
        <CardHeader className="relative border-b border-[color:var(--sx-color-border)] bg-[color:color-mix(in_srgb,var(--sx-color-surface-raised)_70%,transparent)] pb-4 backdrop-blur-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="tracking-[-0.03em]">{title}</CardTitle>
              {description ? (
                <p className="text-sm leading-6 text-[color:var(--sx-color-foreground-muted)]">
                  {description}
                </p>
              ) : null}
            </div>
            {actions}
          </div>
        </CardHeader>
        <CardContent className="relative flex min-h-0 flex-1 flex-col gap-4 pt-6">
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto rounded-[calc(var(--sx-radius-xl)+2px)] border border-[color:color-mix(in_srgb,var(--sx-color-border)_80%,transparent)] bg-[color:color-mix(in_srgb,var(--sx-color-surface-muted)_74%,transparent)] p-3 pr-2">
            {messages.length === 0 ? (
              <div className="flex min-h-40 items-center justify-center rounded-[calc(var(--sx-radius-lg)+4px)] border border-dashed border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] px-6 text-center text-sm text-[color:var(--sx-color-foreground-muted)] [animation:synthex-fade-up_420ms_var(--sx-easing-emphasized)_both] motion-reduce:animate-none">
                {emptyState}
              </div>
            ) : (
              messages.map((message, index) => {
                const isUser = message.role === "user";
                const isSystem = message.role === "system";

                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex [animation:synthex-fade-up_420ms_var(--sx-easing-emphasized)_both] motion-reduce:animate-none",
                      isUser ? "justify-end" : "justify-start",
                    )}
                    style={getStaggerStyle(index)}
                  >
                    <div
                      className={cn(
                        "max-w-[88%] rounded-[calc(var(--sx-radius-lg)+6px)] border px-4 py-3 shadow-[var(--sx-shadow-sm)] transition-[transform,box-shadow,border-color] duration-[var(--sx-motion-normal)] hover:-translate-y-px hover:shadow-[var(--sx-shadow-md)]",
                        isUser &&
                          "border-transparent bg-[linear-gradient(145deg,var(--sx-color-primary),color-mix(in_srgb,var(--sx-color-primary)_72%,#ffffff_28%))] text-[color:var(--sx-color-foreground-on-brand)]",
                        !isUser &&
                          !isSystem &&
                          "border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)]",
                        isSystem &&
                          "border-[color:color-mix(in_srgb,var(--sx-color-accent)_80%,var(--sx-color-border))] bg-[color:color-mix(in_srgb,var(--sx-color-accent-muted)_84%,var(--sx-color-surface))]",
                      )}
                    >
                      {(message.author || message.meta) ? (
                        <div
                          className={cn(
                            "mb-2 flex items-center justify-between gap-3 text-xs font-medium uppercase tracking-[0.1em]",
                            isUser
                              ? "text-[color:var(--sx-color-foreground-on-brand)]/80"
                              : "text-[color:var(--sx-color-foreground-muted)]",
                          )}
                        >
                          <span>{message.author ?? message.role}</span>
                          {message.meta ? <span>{message.meta}</span> : null}
                        </div>
                      ) : null}
                      <div className="text-sm leading-6">{message.content}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <Form
            className="space-y-4 rounded-[calc(var(--sx-radius-xl)+2px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-4 shadow-[var(--sx-shadow-sm)]"
            onSubmit={handleSubmit}
          >
            <FormField name="assistantPrompt">
              <FormItem className="gap-3">
                <div className="flex items-center justify-between gap-3">
                  <FormLabel>{composerLabel}</FormLabel>
                  <span className="text-xs uppercase tracking-[0.11em] text-[color:var(--sx-color-foreground-muted)]">
                    Shift+Enter for a line break
                  </span>
                </div>
                <FormControl>
                  <Textarea
                    rows={4}
                    value={composerValue}
                    placeholder={placeholder}
                    className="transition-shadow duration-[var(--sx-motion-fast)] focus-visible:shadow-[0_0_0_2px_color-mix(in_srgb,var(--sx-color-ring)_26%,transparent)]"
                    onChange={(event) => {
                      setComposerValue(event.target.value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
            <div className="flex justify-end">
              <Button className="transition-transform hover:-translate-y-px" type="submit">
                {submitLabel}
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    );
  },
);

AssistantChatPanel.displayName = "AssistantChatPanel";

export interface FloatingAssistantLauncherProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, keyof FloatingAssistantLauncherSharedProps>,
    FloatingAssistantLauncherSharedProps {}

export const FloatingAssistantLauncher = React.forwardRef<
  HTMLDivElement,
  FloatingAssistantLauncherProps
>(
  (
    {
      badge,
      children,
      className,
      defaultOpen = false,
      description = "Launch your assistant workspace.",
      label = "AI",
      onOpenChange,
      open,
      title = "Assistant dock",
      ...props
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useControllableState({
      defaultValue: defaultOpen,
      onChange: onOpenChange,
      value: open,
    });

    return (
      <div
        ref={ref}
        className={cn("fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3", className)}
        {...props}
      >
        {isOpen && children ? (
          <Card className="relative w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden border-[color:var(--sx-color-border-strong)] bg-[color:color-mix(in_srgb,var(--sx-color-surface-raised)_88%,transparent)] shadow-[var(--sx-shadow-lg)] [animation:synthex-pop-in_320ms_var(--sx-easing-emphasized)_both] motion-reduce:animate-none">
            <div className="pointer-events-none absolute inset-0 opacity-45 [background:radial-gradient(circle_at_top_right,color-mix(in_srgb,var(--sx-color-primary-muted)_38%,transparent),transparent_55%)]" />
            <CardHeader className="pb-4">
              <CardTitle className="text-base">{title}</CardTitle>
              <p className="text-sm leading-6 text-[color:var(--sx-color-foreground-muted)]">
                {description}
              </p>
            </CardHeader>
            <CardContent className="relative">{children}</CardContent>
          </Card>
        ) : null}
        <button
          type="button"
          aria-expanded={isOpen}
          aria-label={typeof label === "string" ? label : "Open assistant"}
          className="group relative inline-flex h-14 min-w-14 items-center justify-center gap-2 overflow-hidden rounded-full border border-[color:color-mix(in_srgb,var(--sx-color-primary)_55%,var(--sx-color-border-strong))] bg-[linear-gradient(140deg,var(--sx-color-primary),color-mix(in_srgb,var(--sx-color-primary)_72%,#ffffff_28%))] px-5 text-sm font-semibold text-[color:var(--sx-color-foreground-on-brand)] shadow-[var(--sx-shadow-lg)] transition-[transform,box-shadow,filter] duration-[var(--sx-motion-normal)] hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[0_16px_34px_-14px_color-mix(in_srgb,var(--sx-color-primary)_72%,black)]"
          onClick={() => {
            setIsOpen(!isOpen);
          }}
        >
          <span className="pointer-events-none absolute -inset-5 -z-10 rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.44),transparent_68%)] [animation:synthex-launcher-glow_3.4s_ease-in-out_infinite] motion-reduce:animate-none" />
          <span
            className={cn(
              "pointer-events-none absolute -inset-3 rounded-full border border-white/25 opacity-65 [animation:synthex-launcher-orbit_5s_linear_infinite] motion-reduce:animate-none",
              isOpen && "opacity-85",
            )}
          />
          <span className="pointer-events-none absolute inset-0 [animation:synthex-sheen_3.4s_linear_infinite] opacity-80 mix-blend-screen motion-reduce:animate-none [background:linear-gradient(110deg,transparent_28%,rgba(255,255,255,0.36)_47%,transparent_66%)]" />
          <span className="pointer-events-none absolute -inset-1 rounded-full border border-white/40 opacity-55 [animation:synthex-pulse-ring_2.8s_ease-in-out_infinite] motion-reduce:animate-none" />
          <span className="relative">{label}</span>
          {badge ? (
            <span className="relative rounded-full bg-white/18 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] [animation:synthex-badge-bob_2.4s_ease-in-out_infinite] motion-reduce:animate-none">
              {badge}
            </span>
          ) : null}
        </button>
      </div>
    );
  },
);

FloatingAssistantLauncher.displayName = "FloatingAssistantLauncher";

export interface CadenceBarChartProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, keyof CadenceBarChartSharedProps>,
    CadenceBarChartSharedProps {}

export const CadenceBarChart = React.forwardRef<HTMLDivElement, CadenceBarChartProps>(
  (
    {
      className,
      data,
      description = "Past 14 days",
      title = "Cadence",
      valueFormatter = (value) => `${value}`,
      ...props
    },
    ref,
  ) => {
    const maxValue = getCadenceMax(data);

    return (
      <Card
        ref={ref}
        className={cn(
          "overflow-hidden border-[color:color-mix(in_srgb,var(--sx-color-border)_82%,transparent)]",
          className,
        )}
        {...props}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-base">{title}</CardTitle>
            <span className="rounded-full border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface-muted)] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-[color:var(--sx-color-foreground-muted)]">
              14D
            </span>
          </div>
          <p className="text-sm text-[color:var(--sx-color-foreground-muted)]">{description}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <div className="pointer-events-none absolute inset-0 [background:linear-gradient(180deg,color-mix(in_srgb,var(--sx-color-border)_38%,transparent)_1px,transparent_1px)] [background-size:100%_25%]" />
            <div className="relative grid grid-cols-[repeat(auto-fit,minmax(0,1fr))] items-end gap-2">
              {data.map((entry, index) => (
                <div
                  key={entry.id ?? entry.label}
                  className="group flex flex-col items-center gap-2 rounded-[var(--sx-radius-lg)] px-1.5 py-1 transition-colors hover:bg-[color:color-mix(in_srgb,var(--sx-color-accent-muted)_72%,transparent)]"
                >
                  <div className="flex h-28 w-full items-end">
                    <div
                      className="w-full origin-bottom rounded-[var(--sx-radius-pill)] border border-[color:color-mix(in_srgb,var(--sx-color-primary)_35%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--sx-color-primary)_96%,white_4%)_0%,color-mix(in_srgb,var(--sx-color-primary)_52%,var(--sx-color-surface))_100%)] shadow-[0_8px_18px_-12px_color-mix(in_srgb,var(--sx-color-primary)_75%,black)] [animation:synthex-bar-rise_520ms_var(--sx-easing-emphasized)_both] motion-reduce:animate-none group-hover:brightness-110"
                      style={{
                        ...getStaggerStyle(index, 120),
                        minHeight: "12%",
                        height: `${Math.max(12, (entry.value / maxValue) * 100)}%`,
                      }}
                      title={`${entry.label}: ${String(valueFormatter(entry.value))}`}
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-semibold text-[color:var(--sx-color-foreground)]">
                      {valueFormatter(entry.value)}
                    </div>
                    <div className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--sx-color-foreground-muted)]">
                      {entry.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  },
);

CadenceBarChart.displayName = "CadenceBarChart";

export interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement>, MarqueeSharedProps {}

export const Marquee = React.forwardRef<HTMLDivElement, MarqueeProps>(
  ({ className, items, speed = "normal", ...props }, ref) => {
    const duration = speed === "slow" ? "28s" : speed === "fast" ? "14s" : "20s";
    const secondaryDuration = speed === "slow" ? "34s" : speed === "fast" ? "18s" : "24s";
    const topTrackItems = [...items, ...items];
    const bottomTrackItems = [...items.slice().reverse(), ...items.slice().reverse()];

    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-[calc(var(--sx-radius-xl)+2px)] border border-[color:var(--sx-color-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--sx-color-surface-muted)_95%,transparent),color-mix(in_srgb,var(--sx-color-surface)_92%,transparent))] py-3",
          className,
        )}
        style={
          {
            WebkitMaskImage:
              "linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)",
            maskImage:
              "linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)",
          } as React.CSSProperties
        }
        {...props}
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 [background:linear-gradient(90deg,var(--sx-color-surface)_8%,transparent)]" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 [background:linear-gradient(270deg,var(--sx-color-surface)_8%,transparent)]" />
        <div
          className="flex w-max min-w-full items-center gap-3 px-3 [animation:synthex-marquee_var(--sx-marquee-duration)_linear_infinite] hover:[animation-play-state:paused] motion-reduce:animate-none"
          style={{ ["--sx-marquee-duration" as string]: duration } as React.CSSProperties}
        >
          {topTrackItems.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="flex min-w-max items-center gap-2 rounded-full border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] px-4 py-2 shadow-[var(--sx-shadow-xs)] transition-[transform,box-shadow,border-color] duration-[var(--sx-motion-normal)] hover:-translate-y-0.5 hover:border-[color:var(--sx-color-border-strong)] hover:shadow-[var(--sx-shadow-md)] [animation:synthex-marquee-float_3.2s_ease-in-out_infinite] motion-reduce:animate-none"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <span className="text-sm font-medium text-[color:var(--sx-color-foreground)]">
                {item.label}
              </span>
              {item.meta ? (
                <span className="text-xs uppercase tracking-[0.14em] text-[color:var(--sx-color-foreground-muted)]">
                  {item.meta}
                </span>
              ) : null}
            </div>
          ))}
        </div>
        <div
          className="mt-3 flex w-max min-w-full items-center gap-3 px-3 opacity-80 [animation:synthex-marquee-reverse_var(--sx-marquee-secondary-duration)_linear_infinite] hover:[animation-play-state:paused] motion-reduce:animate-none"
          style={
            {
              ["--sx-marquee-secondary-duration" as string]: secondaryDuration,
            } as React.CSSProperties
          }
        >
          {bottomTrackItems.map((item, index) => (
            <div
              key={`rev-${item.id}-${index}`}
              className="flex min-w-max items-center gap-2 rounded-full border border-[color:color-mix(in_srgb,var(--sx-color-border)_86%,transparent)] bg-[color:color-mix(in_srgb,var(--sx-color-surface)_85%,transparent)] px-4 py-1.5 shadow-[var(--sx-shadow-xs)] transition-[transform,box-shadow,border-color] duration-[var(--sx-motion-normal)] hover:-translate-y-0.5 hover:border-[color:var(--sx-color-border-strong)] hover:shadow-[var(--sx-shadow-md)] [animation:synthex-marquee-float_3.6s_ease-in-out_infinite] motion-reduce:animate-none"
              style={{ animationDelay: `${index * 110}ms` }}
            >
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--sx-color-foreground)]">
                {item.label}
              </span>
              {item.meta ? (
                <span className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--sx-color-foreground-muted)]">
                  {item.meta}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    );
  },
);

Marquee.displayName = "Marquee";

export interface KPIStatGridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    KPIStatGridSharedProps {}

export const KPIStatGrid = React.forwardRef<HTMLDivElement, KPIStatGridProps>(
  ({ className, columns = 4, stats, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "grid gap-4",
        columns === 2 && "md:grid-cols-2",
        columns === 3 && "md:grid-cols-3",
        columns === 4 && "md:grid-cols-2 xl:grid-cols-4",
        className,
      )}
      {...props}
    >
      {stats.map((stat, index) => (
        <Card
          key={stat.id}
          className={cn(
            "group relative overflow-hidden border-[color:color-mix(in_srgb,var(--sx-color-border)_86%,transparent)] transition-[transform,box-shadow,border-color] duration-[var(--sx-motion-normal)] hover:-translate-y-1 hover:border-[color:var(--sx-color-border-strong)] hover:shadow-[var(--sx-shadow-lg)] [animation:synthex-fade-up_420ms_var(--sx-easing-emphasized)_both] motion-reduce:animate-none",
            stat.tone === "accent" &&
              "bg-[linear-gradient(160deg,color-mix(in_srgb,var(--sx-color-accent-muted)_92%,transparent),var(--sx-color-surface))]",
            stat.tone === "positive" &&
              "border-emerald-200 bg-[linear-gradient(160deg,#ecfdf5,var(--sx-color-surface)) dark:border-emerald-900 dark:bg-emerald-950/30",
            stat.tone === "warning" &&
              "border-amber-200 bg-[linear-gradient(160deg,#fffbeb,var(--sx-color-surface)) dark:border-amber-900 dark:bg-amber-950/30",
          )}
          style={getStaggerStyle(index)}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--sx-color-primary)_55%,transparent),transparent)]" />
          <CardContent className="space-y-3 pt-6">
            <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--sx-color-foreground-muted)]">
              {stat.label}
            </div>
            <div className="text-3xl font-semibold tracking-[-0.04em] text-[color:var(--sx-color-foreground)]">
              {stat.value}
            </div>
            {(stat.change || stat.detail) ? (
              <div className="flex items-center justify-between gap-3">
                {stat.change ? (
                  <span className="text-sm font-semibold text-[color:var(--sx-color-foreground)]">
                    {stat.change}
                  </span>
                ) : null}
                {stat.detail ? (
                  <span className="text-sm text-[color:var(--sx-color-foreground-muted)]">
                    {stat.detail}
                  </span>
                ) : null}
              </div>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  ),
);

KPIStatGrid.displayName = "KPIStatGrid";

export interface TimelineRowProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, keyof TimelineRowSharedProps>,
    TimelineRowSharedProps {}

export const TimelineRow = React.forwardRef<HTMLDivElement, TimelineRowProps>(
  ({ className, date, organization, summary, tags, title, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "group relative grid gap-4 border-l border-[color:var(--sx-color-border)] pl-6 transition-[border-color] duration-[var(--sx-motion-fast)] hover:border-[color:var(--sx-color-border-strong)] md:grid-cols-[10rem_minmax(0,1fr)] md:pl-0 [animation:synthex-fade-up_380ms_var(--sx-easing-emphasized)_both] motion-reduce:animate-none",
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute -left-px top-0 h-full w-px bg-[linear-gradient(180deg,color-mix(in_srgb,var(--sx-color-primary)_68%,transparent),color-mix(in_srgb,var(--sx-color-border)_70%,transparent)_32%,transparent_100%)] opacity-70" />
      <div className="relative pl-4 md:pl-0">
        <span className="absolute -left-[1.78rem] top-1.5 h-3 w-3 rounded-full border-2 border-[color:var(--sx-color-surface)] bg-[color:var(--sx-color-primary)] shadow-[0_0_0_6px_color-mix(in_srgb,var(--sx-color-primary-muted)_38%,transparent)] transition-transform duration-[var(--sx-motion-fast)] group-hover:scale-110 md:-left-[0.4rem]" />
        <span className="pointer-events-none absolute -left-[1.98rem] top-1.25 h-3.5 w-3.5 rounded-full border border-[color:color-mix(in_srgb,var(--sx-color-primary)_45%,transparent)] opacity-75 [animation:synthex-timeline-ping_2.6s_ease-out_infinite] motion-reduce:animate-none md:-left-[0.58rem]" />
        <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--sx-color-foreground-muted)]">
          {date}
        </div>
      </div>
      <div className="space-y-3 rounded-[var(--sx-radius-lg)] border border-transparent p-3 transition-[background-color,border-color,transform] duration-[var(--sx-motion-fast)] group-hover:-translate-y-0.5 group-hover:border-[color:color-mix(in_srgb,var(--sx-color-border)_84%,transparent)] group-hover:bg-[color:color-mix(in_srgb,var(--sx-color-surface-muted)_78%,transparent)]">
        <div className="space-y-1">
          <div className="text-lg font-semibold tracking-[-0.03em] text-[color:var(--sx-color-foreground)]">
            {title}
          </div>
          {organization ? (
            <div className="text-sm text-[color:var(--sx-color-foreground-muted)]">
              {organization}
            </div>
          ) : null}
        </div>
        {summary ? (
          <div className="text-sm leading-6 text-[color:var(--sx-color-foreground-muted)]">
            {summary}
          </div>
        ) : null}
        {tags?.length ? (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={`${String(tag)}-${index}`}
                className="rounded-full border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] px-3 py-1 text-xs font-medium text-[color:var(--sx-color-foreground-muted)] transition-colors duration-[var(--sx-motion-fast)] hover:border-[color:var(--sx-color-border-strong)] hover:text-[color:var(--sx-color-foreground)]"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  ),
);

TimelineRow.displayName = "TimelineRow";

export interface ExperienceTimelineProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, keyof ExperienceTimelineSharedProps>,
    ExperienceTimelineSharedProps {}

export const ExperienceTimeline = React.forwardRef<HTMLDivElement, ExperienceTimelineProps>(
  ({ className, description, entries, title = "Experience", ...props }, ref) => (
    <Card
      ref={ref}
      className={cn(
        "overflow-hidden border-[color:color-mix(in_srgb,var(--sx-color-border)_86%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--sx-color-surface-raised)_84%,transparent),var(--sx-color-surface)_28%)]",
        className,
      )}
      {...props}
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? (
          <p className="text-sm leading-6 text-[color:var(--sx-color-foreground-muted)]">
            {description}
          </p>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-6">
        {entries.map((entry, index) => (
          <TimelineRow
            key={entry.id}
            {...entry}
            className="[animation:synthex-fade-up_420ms_var(--sx-easing-emphasized)_both] motion-reduce:animate-none"
            style={getStaggerStyle(index, 110)}
          />
        ))}
      </CardContent>
    </Card>
  ),
);

ExperienceTimeline.displayName = "ExperienceTimeline";

export interface ProjectCaseRowProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, keyof ProjectCaseRowSharedProps>,
    ProjectCaseRowSharedProps {}

export const ProjectCaseRow = React.forwardRef<HTMLDivElement, ProjectCaseRowProps>(
  (
    {
      category,
      className,
      ctaLabel = "Read case",
      href,
      index,
      metrics,
      summary,
      title,
      ...props
    },
    ref,
  ) => (
    <div
      ref={ref}
      className={cn(
        "group grid gap-6 border-t border-[color:var(--sx-color-border)] py-8 transition-colors duration-[var(--sx-motion-fast)] hover:border-[color:var(--sx-color-border-strong)] md:grid-cols-[7rem_minmax(0,1fr)_16rem] [animation:synthex-fade-up_420ms_var(--sx-easing-emphasized)_both] motion-reduce:animate-none",
        className,
      )}
      {...props}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface-muted)] text-2xl font-semibold tracking-[-0.04em] text-[color:var(--sx-color-foreground-muted)] transition-[transform,border-color,color] duration-[var(--sx-motion-normal)] group-hover:-translate-y-0.5 group-hover:border-[color:var(--sx-color-border-strong)] group-hover:text-[color:var(--sx-color-foreground)]">
        {String(index).padStart(2, "0")}
      </div>
      <div className="space-y-3">
        {category ? (
          <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--sx-color-foreground-muted)]">
            {category}
          </div>
        ) : null}
        <div className="text-2xl font-semibold tracking-[-0.03em] text-[color:var(--sx-color-foreground)]">
          {title}
        </div>
        {summary ? (
          <div className="max-w-2xl text-sm leading-6 text-[color:var(--sx-color-foreground-muted)]">
            {summary}
          </div>
        ) : null}
      </div>
      <div className="flex flex-col items-start gap-4 md:items-end">
        {metrics?.length ? (
          <div className="grid w-full gap-2">
            {metrics.map((metric, metricIndex) => (
              <div
                key={`${String(metric.label)}-${metricIndex}`}
                className="flex items-center justify-between gap-4 rounded-[var(--sx-radius-lg)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface-muted)] px-4 py-3 transition-[transform,border-color] duration-[var(--sx-motion-fast)] hover:-translate-y-px hover:border-[color:var(--sx-color-border-strong)]"
              >
                <span className="text-xs uppercase tracking-[0.14em] text-[color:var(--sx-color-foreground-muted)]">
                  {metric.label}
                </span>
                <span className="text-sm font-semibold text-[color:var(--sx-color-foreground)]">
                  {metric.value}
                </span>
              </div>
            ))}
          </div>
        ) : null}
        {href ? (
          <a
            href={href}
            className="inline-flex h-10 items-center justify-center rounded-[var(--sx-radius-md)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] px-4 text-sm font-medium text-[color:var(--sx-color-foreground)] shadow-[var(--sx-shadow-sm)] transition-[transform,background-color,border-color] duration-[var(--sx-motion-fast)] hover:-translate-y-px hover:border-[color:var(--sx-color-border-strong)] hover:bg-[color:var(--sx-color-accent)]"
          >
            {ctaLabel}
          </a>
        ) : null}
      </div>
    </div>
  ),
);

ProjectCaseRow.displayName = "ProjectCaseRow";

export interface ContactSplitFormProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, keyof ContactSplitFormSharedProps>,
    ContactSplitFormSharedProps {}

export const ContactSplitForm = React.forwardRef<HTMLDivElement, ContactSplitFormProps>(
  (
    {
      channels,
      className,
      defaultEmail = "",
      defaultMessage = "",
      defaultName = "",
      description = "Put channel context on the left and a contact form on the right.",
      onSubmit,
      submitLabel = "Send inquiry",
      title = "Contact",
      ...props
    },
    ref,
  ) => {
    const [name, setName] = React.useState(defaultName);
    const [email, setEmail] = React.useState(defaultEmail);
    const [message, setMessage] = React.useState(defaultMessage);

    return (
      <Card
        ref={ref}
        className={cn(
          "overflow-hidden [animation:synthex-fade-up_420ms_var(--sx-easing-emphasized)_both] motion-reduce:animate-none",
          className,
        )}
        {...props}
      >
        <div className="grid md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
          <div className="border-b border-[color:var(--sx-color-border)] bg-[linear-gradient(170deg,color-mix(in_srgb,var(--sx-color-accent-muted)_85%,transparent),var(--sx-color-surface-muted))] p-6 md:border-b-0 md:border-r">
            <div className="space-y-2">
              <CardTitle>{title}</CardTitle>
              <p className="text-sm leading-6 text-[color:var(--sx-color-foreground-muted)]">
                {description}
              </p>
            </div>
            <div className="mt-6 space-y-3">
              {channels.map((channel, index) => {
                const body = (
                  <div
                    className="rounded-[var(--sx-radius-lg)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] px-4 py-3 shadow-[var(--sx-shadow-xs)] transition-[transform,border-color,box-shadow] duration-[var(--sx-motion-fast)] hover:-translate-y-px hover:border-[color:var(--sx-color-border-strong)] hover:shadow-[var(--sx-shadow-sm)] [animation:synthex-fade-up_360ms_var(--sx-easing-emphasized)_both] motion-reduce:animate-none"
                    style={getStaggerStyle(index, 60)}
                  >
                    <div className="text-xs uppercase tracking-[0.14em] text-[color:var(--sx-color-foreground-muted)]">
                      {channel.label}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-[color:var(--sx-color-foreground)]">
                      {channel.value}
                    </div>
                    {channel.meta ? (
                      <div className="mt-1 text-sm text-[color:var(--sx-color-foreground-muted)]">
                        {channel.meta}
                      </div>
                    ) : null}
                  </div>
                );

                return channel.href ? (
                  <a key={channel.id} href={channel.href} className="block">
                    {body}
                  </a>
                ) : (
                  <div key={channel.id}>{body}</div>
                );
              })}
            </div>
          </div>
          <div className="p-6">
            <Form
              className="rounded-[var(--sx-radius-xl)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-4 shadow-[var(--sx-shadow-xs)]"
              onSubmit={(event) => {
                event.preventDefault();
                onSubmit?.({ email, message, name });
              }}
            >
              <FormField name="contact-name">
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      className="transition-shadow duration-[var(--sx-motion-fast)] focus-visible:shadow-[0_0_0_2px_color-mix(in_srgb,var(--sx-color-ring)_24%,transparent)]"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
              <FormField name="contact-email">
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      className="transition-shadow duration-[var(--sx-motion-fast)] focus-visible:shadow-[0_0_0_2px_color-mix(in_srgb,var(--sx-color-ring)_24%,transparent)]"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
              <FormField name="contact-message">
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={6}
                      className="transition-shadow duration-[var(--sx-motion-fast)] focus-visible:shadow-[0_0_0_2px_color-mix(in_srgb,var(--sx-color-ring)_24%,transparent)]"
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
              <div className="flex justify-end">
                <Button className="transition-transform hover:-translate-y-px" type="submit">
                  {submitLabel}
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </Card>
    );
  },
);

ContactSplitForm.displayName = "ContactSplitForm";

export interface DungeonHUDShellProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, keyof DungeonHUDShellSharedProps>,
    DungeonHUDShellSharedProps {}

export const DungeonHUDShell = React.forwardRef<HTMLDivElement, DungeonHUDShellProps>(
  ({ actions, children, className, footer, metrics, mission, sidebar, title, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative overflow-hidden rounded-[calc(var(--sx-radius-xl)+8px)] border border-[color:var(--sx-color-border-strong)] bg-[radial-gradient(circle_at_top,var(--sx-color-surface-raised),var(--sx-color-background))] p-4 shadow-[var(--sx-shadow-lg)] [animation:synthex-fade-up_440ms_var(--sx-easing-emphasized)_both] motion-reduce:animate-none",
        className,
      )}
      {...props}
    >
      <div className="pointer-events-none absolute inset-0 opacity-20 [background:repeating-linear-gradient(0deg,transparent,transparent_8px,rgba(255,255,255,0.03)_9px,transparent_10px)]" />
      <div className="pointer-events-none absolute -left-1/3 top-0 h-px w-1/2 bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--sx-color-primary)_72%,white),transparent)] [animation:synthex-scan-sweep_4.2s_linear_infinite] motion-reduce:animate-none" />
      <div className="relative grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-4">
          <div className="rounded-[var(--sx-radius-lg)] border border-[color:var(--sx-color-border)] bg-[color:color-mix(in_srgb,var(--sx-color-background)_62%,black_38%)] p-4 backdrop-blur-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--sx-color-foreground-muted)]">
                  Mission HUD
                </div>
                <div className="text-2xl font-semibold tracking-[-0.04em] text-[color:var(--sx-color-foreground)]">
                  {title}
                </div>
                {mission ? (
                  <div className="text-sm leading-6 text-[color:var(--sx-color-foreground-muted)]">
                    {mission}
                  </div>
                ) : null}
              </div>
              {actions}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {metrics.map((metric, index) => (
              <div
                key={metric.id}
                className="rounded-[var(--sx-radius-lg)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] px-4 py-3 transition-[transform,border-color,background-color] duration-[var(--sx-motion-fast)] hover:-translate-y-px hover:border-[color:var(--sx-color-border-strong)] hover:bg-[color:color-mix(in_srgb,var(--sx-color-surface)_86%,var(--sx-color-accent-muted))] [animation:synthex-fade-up_360ms_var(--sx-easing-emphasized)_both] motion-reduce:animate-none"
                style={getStaggerStyle(index, 90)}
              >
                <div className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--sx-color-foreground-muted)]">
                  {metric.label}
                </div>
                <div className="mt-2 text-xl font-semibold text-[color:var(--sx-color-foreground)]">
                  {metric.value}
                </div>
              </div>
            ))}
          </div>
          <div className="relative min-h-[16rem] overflow-hidden rounded-[var(--sx-radius-lg)] border border-[color:var(--sx-color-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--sx-color-primary-muted)_18%,transparent),transparent_42%),var(--sx-color-surface)] p-4">
            <div className="pointer-events-none absolute inset-0 opacity-35 [background:radial-gradient(circle_at_20%_0%,color-mix(in_srgb,var(--sx-color-primary)_18%,transparent),transparent_48%)]" />
            <div className="relative">{children}</div>
          </div>
          {footer ? (
            <div className="rounded-[var(--sx-radius-lg)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface-muted)] px-4 py-3 text-sm text-[color:var(--sx-color-foreground-muted)]">
              {footer}
            </div>
          ) : null}
        </div>
        <div className="rounded-[var(--sx-radius-lg)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface-muted)] p-4">
          {sidebar}
        </div>
      </div>
    </div>
  ),
);

DungeonHUDShell.displayName = "DungeonHUDShell";
