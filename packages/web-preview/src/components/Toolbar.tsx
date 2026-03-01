import { Button, Badge } from "@synthex/ui/components";
import { AddIcon, PanelBottomIcon, PanelRightIcon, RedoIcon, UndoIcon } from "@synthex/ui/icons";
import { Inline, Text } from "@synthex/ui/primitives";

export interface ToolbarProps {
  readonly canRedo: boolean;
  readonly canUndo: boolean;
  readonly lastAction: string;
  readonly onAddPanel: () => void;
  readonly onRedo: () => void;
  readonly onSplitHorizontal: () => void;
  readonly onSplitVertical: () => void;
  readonly onUndo: () => void;
  readonly selectedLabel: string;
}

export function Toolbar({
  canRedo,
  canUndo,
  lastAction,
  onAddPanel,
  onRedo,
  onSplitHorizontal,
  onSplitVertical,
  onUndo,
  selectedLabel,
}: ToolbarProps) {
  return (
    <div className="workbench-toolbar">
      <div className="workbench-toolbar-group">
        <Text as="div" size="sm" tone="muted">
          Commands
        </Text>
        <Inline gap="sm" wrap>
          <Button size="sm" onClick={onAddPanel}>
            <AddIcon size={16} />
            Add Panel
          </Button>
          <Button size="sm" variant="outline" onClick={onSplitHorizontal}>
            <PanelBottomIcon size={16} />
            Split Horizontal
          </Button>
          <Button size="sm" variant="outline" onClick={onSplitVertical}>
            <PanelRightIcon size={16} />
            Split Vertical
          </Button>
          <Button size="sm" variant="ghost" onClick={onUndo} disabled={!canUndo}>
            <UndoIcon size={16} />
            Undo
          </Button>
          <Button size="sm" variant="ghost" onClick={onRedo} disabled={!canRedo}>
            <RedoIcon size={16} />
            Redo
          </Button>
        </Inline>
      </div>
      <div className="workbench-toolbar-group workbench-toolbar-group-meta">
        <Text as="div" size="sm" tone="muted">
          Selection
        </Text>
        <div className="workbench-toolbar-meta">
          <Badge variant="outline">{selectedLabel}</Badge>
          <Badge variant="secondary">{lastAction}</Badge>
        </div>
      </div>
    </div>
  );
}
