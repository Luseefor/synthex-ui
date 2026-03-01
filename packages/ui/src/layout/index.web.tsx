import * as React from "react";
import { H3, Muted } from "../typography/typography.web";
import { Inline, ScrollArea, Stack, Surface, type SurfaceProps } from "../primitives/index.web";

export interface AppShellProps {
  readonly children: React.ReactNode;
  readonly header?: React.ReactNode;
  readonly sidebar?: React.ReactNode;
}

export function AppShell({ children, header, sidebar }: AppShellProps) {
  return (
    <Stack minHeight="100vh" background="background" foreground="foreground">
      {header ? <Surface tone="raised" border={false} padding="md">{header}</Surface> : null}
      <Inline grow style={{ flex: 1, minHeight: 0 }}>
        {sidebar ? (
          <Surface
            tone="muted"
            border={false}
            padding="md"
            width={248}
            style={{ flexShrink: 0 }}
          >
            {sidebar}
          </Surface>
        ) : null}
        <ScrollArea grow padding="md" style={{ minHeight: 0 }}>
          {children}
        </ScrollArea>
      </Inline>
    </Stack>
  );
}

export interface PaneProps extends SurfaceProps {}

export function Pane(props: PaneProps) {
  return <Surface tone="default" padding="lg" {...props} />;
}

export interface SectionProps {
  readonly actions?: React.ReactNode;
  readonly children: React.ReactNode;
  readonly description?: React.ReactNode;
  readonly title?: React.ReactNode;
}

export function Section({ actions, children, description, title }: SectionProps) {
  return (
    <Stack gap="lg">
      {title || description || actions ? (
        <Inline justify="space-between" align="center" gap="md" wrap>
          <Stack gap="xs">
            {title ? <H3>{title}</H3> : null}
            {description ? <Muted>{description}</Muted> : null}
          </Stack>
          {actions}
        </Inline>
      ) : null}
      {children}
    </Stack>
  );
}

export interface PanelFrameProps {
  readonly actions?: React.ReactNode;
  readonly children: React.ReactNode;
  readonly description?: React.ReactNode;
  readonly title: React.ReactNode;
}

export function PanelFrame({ actions, children, description, title }: PanelFrameProps) {
  return (
    <Surface tone="raised" padding="lg" gap="md">
      <Section title={title} description={description} actions={actions}>
        {children}
      </Section>
    </Surface>
  );
}

export { ScrollArea } from "../primitives/index.web";
