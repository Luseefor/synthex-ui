import { Button, Badge } from "@synthex/ui/components";
import { AddIcon, PanelBottomIcon, PanelRightIcon, RedoIcon, UndoIcon } from "@synthex/ui/icons";
import { Inline } from "@synthex/ui/primitives";

export interface ToolbarProps {
  readonly canRedo: boolean;
  readonly canUndo: boolean;
  readonly lastAction: string;
  readonly onAddPanel: () => void;
  readonly onRedo: () => void;
  readonly onSplitColumns: () => void;
  readonly onSplitRows: () => void;
  readonly onUndo: () => void;
  readonly selectedLabel: string;
}

export function Toolbar({
  canRedo,
  canUndo,
  lastAction,
  onAddPanel,
  onRedo,
  onSplitColumns,
  onSplitRows,
  onUndo,
  selectedLabel,
}: ToolbarProps) {
  return (
    <div className="workbench-toolbar">
      <div className="workbench-toolbar-actions">
        <Inline gap="sm" wrap>
          <Button size="sm" onClick={onAddPanel}>
            <AddIcon size={16} />
            Add Panel
          </Button>
          <Button size="sm" variant="outline" onClick={onSplitColumns}>
            <PanelRightIcon size={16} />
            Split Left / Right
          </Button>
          <Button size="sm" variant="outline" onClick={onSplitRows}>
            <PanelBottomIcon size={16} />
            Split Top / Bottom
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
      <div className="workbench-toolbar-meta">
        <Badge variant="outline">{selectedLabel}</Badge>
        <Badge variant="secondary">{lastAction}</Badge>
      </div>
    </div>
  );
}
