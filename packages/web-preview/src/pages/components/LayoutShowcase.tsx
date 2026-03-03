import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  ButtonGroup,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  ScrollArea,
} from "synthex-ui/components";
import { ShowcaseSection } from "./ShowcaseSection";

export function LayoutShowcase() {
  return (
    <ShowcaseSection
      title="Layout and motion"
      description="Resizable panes, bounded scroll regions, disclosure primitives, and carousels shown in a stable docs layout."
      includes={["Resizable", "Accordion", "Collapsible", "ScrollArea", "Carousel", "ButtonGroup"]}
    >
      <div className="preview-section-stack">
        <ButtonGroup><Button size="sm">Build</Button><Button size="sm" variant="outline">Preview</Button><Button size="sm" variant="ghost">Ship</Button></ButtonGroup>
        <ResizablePanelGroup direction="horizontal" style={{ minHeight: 220 }}><ResizablePanel defaultSize={58}><div className="preview-pane">Editor surface</div></ResizablePanel><ResizableHandle /><ResizablePanel defaultSize={42}><div className="preview-pane">Inspector</div></ResizablePanel></ResizablePanelGroup>
        <Accordion type="single" defaultValue="notes" collapsible className="preview-pane">
          <AccordionItem value="notes"><AccordionTrigger>Release notes</AccordionTrigger><AccordionContent>Accordion items expose stacked disclosure without needing a custom wrapper.</AccordionContent></AccordionItem>
          <AccordionItem value="migration"><AccordionTrigger>Migration guide</AccordionTrigger><AccordionContent>Use this for denser docs sections that should still preserve scanning rhythm.</AccordionContent></AccordionItem>
        </Accordion>
        <Collapsible defaultOpen><div className="preview-section-stack"><CollapsibleTrigger className="preview-trigger">Release notes</CollapsibleTrigger><CollapsibleContent className="preview-pane">Collapsible regions help compress secondary guidance without losing structure.</CollapsibleContent></div></Collapsible>
        <ScrollArea border padding="md" radius="lg" style={{ height: 180 }}><div className="preview-section-stack"><div>Release notes</div><div>Migration guide</div><div>Workspace commands</div><div>Docking behavior</div><div>Theme tokens</div><div>Package checks</div></div></ScrollArea>
        <Carousel><CarouselContent><CarouselItem><Card><CardHeader><CardTitle>Step 1</CardTitle><CardDescription>Install packages.</CardDescription></CardHeader></Card></CarouselItem><CarouselItem><Card><CardHeader><CardTitle>Step 2</CardTitle><CardDescription>Compose screens.</CardDescription></CardHeader></Card></CarouselItem></CarouselContent><div className="preview-inline-row"><CarouselPrevious /><CarouselNext /></div></Carousel>
      </div>
    </ShowcaseSection>
  );
}
