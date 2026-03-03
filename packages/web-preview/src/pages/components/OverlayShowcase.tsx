import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Drawer,
  DrawerContent,
  DrawerClose,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Sheet,
  SheetContent,
  SheetClose,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "synthex-ui/components";
import { ShowcaseSection } from "./ShowcaseSection";

export function OverlayShowcase() {
  return (
    <ShowcaseSection
      title="Overlays"
      description="Dialogs, popovers, menus, sheets, drawers, and tooltips shown as direct overlay references instead of random triggers."
      includes={["Dialog", "Popover", "DropdownMenu", "ContextMenu", "AlertDialog", "Drawer", "Sheet", "Tooltip"]}
    >
      <div className="preview-inline-row preview-wrap">
        <Dialog><DialogTrigger asChild><Button variant="outline">Open dialog</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Publish preview</DialogTitle><DialogDescription>Reusable dialog surface for structured actions.</DialogDescription></DialogHeader><DialogFooter><DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose><Button>Publish</Button></DialogFooter></DialogContent></Dialog>
        <Popover><PopoverTrigger asChild><Button variant="outline">Open popover</Button></PopoverTrigger><PopoverContent>Quick action content for lightweight contextual UI.</PopoverContent></Popover>
        <DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline">Open menu</Button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuLabel>Actions</DropdownMenuLabel><DropdownMenuItem>Duplicate panel</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem>Export image</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
        <ContextMenu><ContextMenuTrigger><div className="preview-trigger">Right click area</div></ContextMenuTrigger><ContextMenuContent><ContextMenuLabel>Canvas</ContextMenuLabel><ContextMenuItem>Rename node</ContextMenuItem><ContextMenuSeparator /><ContextMenuItem>Duplicate node</ContextMenuItem></ContextMenuContent></ContextMenu>
        <HoverCard><HoverCardTrigger asChild><Button variant="outline">@synthex</Button></HoverCardTrigger><HoverCardContent>Cross-platform primitives and workbench helpers.</HoverCardContent></HoverCard>
        <Tooltip><TooltipTrigger asChild><Button variant="outline">Hover me</Button></TooltipTrigger><TooltipContent>Tooltip hint text.</TooltipContent></Tooltip>
        <AlertDialog><AlertDialogTrigger asChild><Button variant="outline">Confirm action</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Ship release?</AlertDialogTitle><AlertDialogDescription>This uses the exported alert dialog surface.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction>Confirm</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
        <Drawer><DrawerTrigger>Open drawer</DrawerTrigger><DrawerContent><DrawerHeader><DrawerTitle>Drawer</DrawerTitle><DrawerDescription>Mobile-first slide-up content surface.</DrawerDescription></DrawerHeader><DrawerFooter><DrawerClose>Close</DrawerClose></DrawerFooter></DrawerContent></Drawer>
        <Sheet><SheetTrigger asChild><Button variant="outline">Open sheet</Button></SheetTrigger><SheetContent><SheetHeader><SheetTitle>Sheet</SheetTitle><SheetDescription>Side panel overlay for secondary controls.</SheetDescription></SheetHeader><SheetFooter><SheetClose asChild><Button variant="outline">Done</Button></SheetClose></SheetFooter></SheetContent></Sheet>
      </div>
    </ShowcaseSection>
  );
}
