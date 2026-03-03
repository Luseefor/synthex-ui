import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "synthex-ui/components";

export function OverlayShowcase() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Overlays</CardTitle>
        <CardDescription>Dialogs, popovers, hover cards, dropdowns, and tooltips without relying on an external framework.</CardDescription>
      </CardHeader>
      <CardContent className="preview-inline-row preview-wrap">
        <Dialog><DialogTrigger asChild><Button variant="outline">Open dialog</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Publish preview</DialogTitle><DialogDescription>Reusable dialog surface for structured actions.</DialogDescription></DialogHeader><DialogFooter><Button variant="ghost">Cancel</Button><Button>Publish</Button></DialogFooter></DialogContent></Dialog>
        <Popover><PopoverTrigger asChild><Button variant="outline">Open popover</Button></PopoverTrigger><PopoverContent>Quick action content for lightweight contextual UI.</PopoverContent></Popover>
        <DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline">Open menu</Button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem>Duplicate panel</DropdownMenuItem><DropdownMenuItem>Export image</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
        <HoverCard><HoverCardTrigger asChild><Button variant="outline">@synthex</Button></HoverCardTrigger><HoverCardContent>Cross-platform primitives and workbench helpers.</HoverCardContent></HoverCard>
        <Tooltip><TooltipTrigger asChild><Button variant="outline">Hover me</Button></TooltipTrigger><TooltipContent>Tooltip hint text.</TooltipContent></Tooltip>
      </CardContent>
    </Card>
  );
}
