import * as React from "react";
import { useControllableState } from "../hooks/useControllableState";
import { Button } from "../button/button.web";
import { Card, CardContent, CardHeader, CardTitle } from "../card/card.web";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../form/form.web";
import { Input } from "../input/input.web";
import { Textarea } from "../textarea/textarea.web";
import { cn } from "../_shared/variants";
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
      placeholder = "Ask the assistant to draft, analyze, or plan…",
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
        className={cn("flex h-full min-h-[32rem] flex-col overflow-hidden", className)}
        {...props}
      >
        <CardHeader className="border-b border-[color:var(--sx-color-border)] pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle>{title}</CardTitle>
              {description ? (
                <p className="text-sm leading-6 text-[color:var(--sx-color-foreground-muted)]">
                  {description}
                </p>
              ) : null}
            </div>
            {actions}
          </div>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col gap-4 pt-6">
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
            {messages.length === 0 ? (
              <div className="flex min-h-40 items-center justify-center rounded-[calc(var(--sx-radius-lg)+4px)] border border-dashed border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface-muted)] px-6 text-center text-sm text-[color:var(--sx-color-foreground-muted)]">
                {emptyState}
              </div>
            ) : (
              messages.map((message) => {
                const isUser = message.role === "user";
                const isSystem = message.role === "system";

                return (
                  <div
                    key={message.id}
                    className={cn("flex", isUser ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[88%] rounded-[calc(var(--sx-radius-lg)+4px)] border px-4 py-3 shadow-[var(--sx-shadow-xs)]",
                        isUser &&
                          "border-transparent bg-[color:var(--sx-color-primary)] text-[color:var(--sx-color-foreground-on-brand)]",
                        !isUser &&
                          !isSystem &&
                          "border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)]",
                        isSystem &&
                          "border-[color:var(--sx-color-accent)] bg-[color:var(--sx-color-accent-muted)]",
                      )}
                    >
                      {(message.author || message.meta) ? (
                        <div
                          className={cn(
                            "mb-2 flex items-center justify-between gap-3 text-xs font-medium",
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
          <Form className="space-y-4" onSubmit={handleSubmit}>
            <FormField name="assistantPrompt">
              <FormItem className="gap-3">
                <div className="flex items-center justify-between gap-3">
                  <FormLabel>{composerLabel}</FormLabel>
                  <span className="text-xs text-[color:var(--sx-color-foreground-muted)]">
                    Shift+Enter for a line break
                  </span>
                </div>
                <FormControl>
                  <Textarea
                    rows={4}
                    value={composerValue}
                    placeholder={placeholder}
                    onChange={(event) => {
                      setComposerValue(event.target.value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
            <div className="flex justify-end">
              <Button type="submit">{submitLabel}</Button>
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
          <Card className="w-[22rem] max-w-[calc(100vw-2rem)] border-[color:var(--sx-color-border-strong)] bg-[color:var(--sx-color-surface-raised)] shadow-[var(--sx-shadow-lg)]">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">{title}</CardTitle>
              <p className="text-sm leading-6 text-[color:var(--sx-color-foreground-muted)]">
                {description}
              </p>
            </CardHeader>
            <CardContent>{children}</CardContent>
          </Card>
        ) : null}
        <button
          type="button"
          aria-expanded={isOpen}
          aria-label={typeof label === "string" ? label : "Open assistant"}
          className="group relative inline-flex h-14 min-w-14 items-center justify-center gap-2 rounded-full border border-[color:var(--sx-color-border-strong)] bg-[color:var(--sx-color-primary)] px-5 text-sm font-semibold text-[color:var(--sx-color-foreground-on-brand)] shadow-[var(--sx-shadow-lg)] transition-transform duration-[var(--sx-motion-fast)] hover:-translate-y-0.5"
          onClick={() => {
            setIsOpen(!isOpen);
          }}
        >
          <span>{label}</span>
          {badge ? (
            <span className="rounded-full bg-white/18 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em]">
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
      <Card ref={ref} className={cn("overflow-hidden", className)} {...props}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{title}</CardTitle>
          <p className="text-sm text-[color:var(--sx-color-foreground-muted)]">{description}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(0,1fr))] items-end gap-2">
            {data.map((entry) => (
              <div key={entry.id ?? entry.label} className="flex flex-col items-center gap-2">
                <div className="flex h-28 w-full items-end">
                  <div
                    className="w-full rounded-[var(--sx-radius-pill)] bg-[linear-gradient(180deg,var(--sx-color-primary)_0%,color-mix(in_srgb,var(--sx-color-primary)_48%,var(--sx-color-surface))_100%)]"
                    style={{
                      minHeight: "12%",
                      height: `${Math.max(12, (entry.value / maxValue) * 100)}%`,
                    }}
                    title={`${entry.label}: ${String(valueFormatter(entry.value))}`}
                  />
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium text-[color:var(--sx-color-foreground)]">
                    {valueFormatter(entry.value)}
                  </div>
                  <div className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--sx-color-foreground-muted)]">
                    {entry.label}
                  </div>
                </div>
              </div>
            ))}
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
    const duration =
      speed === "slow" ? "28s" : speed === "fast" ? "14s" : "20s";
    const loopItems = [...items, ...items];

    return (
      <div
        ref={ref}
        className={cn(
          "overflow-hidden rounded-[calc(var(--sx-radius-lg)+4px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface-muted)] py-3",
          className,
        )}
        {...props}
      >
        <div
          className="flex w-max min-w-full items-center gap-3 px-3 [animation:synthex-marquee_var(--sx-marquee-duration)_linear_infinite]"
          style={{ ["--sx-marquee-duration" as string]: duration } as React.CSSProperties}
        >
          {loopItems.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="flex min-w-max items-center gap-2 rounded-full border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] px-4 py-2 shadow-[var(--sx-shadow-xs)]"
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
      {stats.map((stat) => (
        <Card
          key={stat.id}
          className={cn(
            "overflow-hidden",
            stat.tone === "accent" && "border-[color:var(--sx-color-accent)] bg-[color:var(--sx-color-accent-muted)]",
            stat.tone === "positive" &&
              "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30",
            stat.tone === "warning" &&
              "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30",
          )}
        >
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
                  <span className="text-sm font-medium text-[color:var(--sx-color-foreground)]">
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
        "grid gap-4 border-l border-[color:var(--sx-color-border)] pl-6 md:grid-cols-[10rem_minmax(0,1fr)] md:pl-0",
        className,
      )}
      {...props}
    >
      <div className="relative pl-4 md:pl-0">
        <span className="absolute -left-[1.78rem] top-1.5 h-3 w-3 rounded-full border-2 border-[color:var(--sx-color-surface)] bg-[color:var(--sx-color-primary)] md:-left-[0.4rem]" />
        <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--sx-color-foreground-muted)]">
          {date}
        </div>
      </div>
      <div className="space-y-3">
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
                className="rounded-full border border-[color:var(--sx-color-border)] px-3 py-1 text-xs font-medium text-[color:var(--sx-color-foreground-muted)]"
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
    <Card ref={ref} className={className} {...props}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? (
          <p className="text-sm leading-6 text-[color:var(--sx-color-foreground-muted)]">
            {description}
          </p>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-8">
        {entries.map((entry) => (
          <TimelineRow key={entry.id} {...entry} />
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
    { category, className, ctaLabel = "Read case", href, index, metrics, summary, title, ...props },
    ref,
  ) => (
    <div
      ref={ref}
      className={cn(
        "grid gap-6 border-t border-[color:var(--sx-color-border)] py-8 md:grid-cols-[7rem_minmax(0,1fr)_16rem]",
        className,
      )}
      {...props}
    >
      <div className="text-3xl font-semibold tracking-[-0.04em] text-[color:var(--sx-color-foreground-muted)]">
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
                className="flex items-center justify-between gap-4 rounded-[var(--sx-radius-lg)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface-muted)] px-4 py-3"
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
            className="inline-flex h-9 items-center justify-center rounded-[var(--sx-radius-md)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] px-4 text-sm font-medium text-[color:var(--sx-color-foreground)] shadow-[var(--sx-shadow-sm)] transition-colors hover:bg-[color:var(--sx-color-accent)]"
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
      <Card ref={ref} className={cn("overflow-hidden", className)} {...props}>
        <div className="grid md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
          <div className="border-b border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface-muted)] p-6 md:border-b-0 md:border-r">
            <div className="space-y-2">
              <CardTitle>{title}</CardTitle>
              <p className="text-sm leading-6 text-[color:var(--sx-color-foreground-muted)]">
                {description}
              </p>
            </div>
            <div className="mt-6 space-y-3">
              {channels.map((channel) => {
                const body = (
                  <div className="rounded-[var(--sx-radius-lg)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] px-4 py-3 shadow-[var(--sx-shadow-xs)]">
                    <div className="text-xs uppercase tracking-[0.14em] text-[color:var(--sx-color-foreground-muted)]">
                      {channel.label}
                    </div>
                    <div className="mt-1 text-sm font-medium text-[color:var(--sx-color-foreground)]">
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
              onSubmit={(event) => {
                event.preventDefault();
                onSubmit?.({ email, message, name });
              }}
            >
              <FormField name="contact-name">
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input value={name} onChange={(event) => setName(event.target.value)} />
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
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
              <div className="flex justify-end">
                <Button type="submit">{submitLabel}</Button>
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
        "rounded-[calc(var(--sx-radius-xl)+6px)] border border-[color:var(--sx-color-border-strong)] bg-[radial-gradient(circle_at_top,var(--sx-color-surface-raised),var(--sx-color-background))] p-4 shadow-[var(--sx-shadow-lg)]",
        className,
      )}
      {...props}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-4">
          <div className="rounded-[var(--sx-radius-lg)] border border-[color:var(--sx-color-border)] bg-black/20 p-4">
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
            {metrics.map((metric) => (
              <div
                key={metric.id}
                className="rounded-[var(--sx-radius-lg)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] px-4 py-3"
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
          <div className="min-h-[16rem] rounded-[var(--sx-radius-lg)] border border-[color:var(--sx-color-border)] bg-[linear-gradient(180deg,rgba(37,99,235,0.08),transparent_40%),var(--sx-color-surface)] p-4">
            {children}
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
