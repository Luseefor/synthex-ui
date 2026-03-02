import { Button, Badge, Separator, Tooltip, TooltipTrigger, TooltipContent } from "synthex-ui/components";
import {
  AddIcon,
  PanelBottomIcon,
  PanelRightIcon,
  RedoIcon,
  UndoIcon,
  LayoutIcon,
  ColumnsIcon,
  RowsIcon
} from "synthex-ui/icons";
import { Inline } from "synthex-ui/primitives";

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
  readonly onSetLayout?: (name: string) => void;
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
  onSetLayout,
}: ToolbarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-2.5">
      <div className="flex items-center justify-between">
        <Inline gap="xs" align="center">
          <div className="flex bg-background rounded-md border p-0.5 shadow-sm">
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onUndo} disabled={!canUndo}>
              <UndoIcon size={14} />
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onRedo} disabled={!canRedo}>
              <RedoIcon size={14} />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-7 mx-1" />

          <Button size="sm" variant="outline" className="h-8 gap-2" onClick={onAddPanel}>
            <AddIcon size={14} />
            <span className="text-[11px] font-semibold">New Panel</span>
          </Button>

          <Separator orientation="vertical" className="h-7 mx-1" />

          <Tooltip>
            <TooltipTrigger>
              <Button size="sm" variant="ghost" className="h-8 gap-2 px-2.5" onClick={() => onSetLayout?.("default")}>
                <LayoutIcon size={14} />
                <span className="text-[11px] font-bold">Reset Layout</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset workspace to default view</TooltipContent>
          </Tooltip>
        </Inline>

        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="h-6 px-2 text-[10px] uppercase font-bold tracking-tight">
            {selectedLabel}
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-3 px-1.5 py-1 bg-background/40 rounded-md border border-dashed border-muted-foreground/20">
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <span className="uppercase tracking-[0.2em] text-[8px] font-black text-primary/80">System State</span>
        </div>
        <Separator orientation="vertical" className="h-3 opacity-30" />
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="text-[10px] font-bold text-muted-foreground/40 font-mono">/</span>
          <span className="text-[10px] font-medium text-muted-foreground/80 truncate italic tracking-tight">
            {lastAction}
          </span>
        </div>
      </div>
    </div>
  );
}
