import type { PanelNode } from "@synthex/core";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@synthex/ui/components";
import { Stack, Text } from "@synthex/ui/primitives";

export interface PreviewPanelProps {
  readonly panel: PanelNode;
  readonly isSelected: boolean;
}

export function PreviewPanel({ panel, isSelected }: PreviewPanelProps) {
  return (
    <Card variant={isSelected ? "accent" : "default"} className="preview-panel-card">
      <CardHeader className="preview-panel-card-header">
        <Stack gap="xs">
          <div className="preview-panel-header">
            <CardTitle>{panel.title ?? panel.panelType}</CardTitle>
            <Badge variant={isSelected ? "secondary" : "outline"}>{panel.id}</Badge>
          </div>
          <Text as="div" tone="muted" size="sm">
            Panel type: {panel.panelType}
          </Text>
        </Stack>
      </CardHeader>
      <CardContent className="preview-panel-card-body">
        <Stack gap="sm" justify="space-between" height="100%">
          <Text as="div" tone="muted">
            Use the docs toolbar to mutate the layout tree and validate reducer-backed state changes.
          </Text>
          <div className="preview-chip-row">
            <Badge variant="outline">{panel.panelType}</Badge>
            {isSelected ? <Badge variant="secondary">Selected</Badge> : null}
          </div>
        </Stack>
      </CardContent>
    </Card>
  );
}
