import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ThemeProvider } from "./theme";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  AlertDescription,
  AlertTitle,
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Input,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  Progress,
  Popover,
  PopoverContent,
  PopoverTrigger,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Toggle,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./components";
import { Box, Surface } from "./primitives";

describe("@synthex/ui web components", () => {
  it("renders button and badge variants with accessible semantics", () => {
    render(
      <ThemeProvider>
        <Button variant="secondary">Run</Button>
        <Badge variant="outline">Preview</Badge>
      </ThemeProvider>,
    );

    expect(screen.getByRole("button", { name: "Run" })).toBeEnabled();
    expect(screen.getByText("Preview")).toBeInTheDocument();
  });

  it("marks invalid inputs and supports ui sizing", () => {
    render(
      <ThemeProvider>
        <Input aria-label="Search" invalid placeholder="Search" uiSize="lg" />
      </ThemeProvider>,
    );

    expect(screen.getByLabelText("Search")).toHaveAttribute("aria-invalid", "true");
  });

  it("switches tabs in uncontrolled mode", () => {
    render(
      <ThemeProvider>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">Overview Panel</TabsContent>
          <TabsContent value="details">Details Panel</TabsContent>
        </Tabs>
      </ThemeProvider>,
    );

    expect(screen.getByText("Overview Panel")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Details" }));
    expect(screen.getByText("Details Panel")).toBeInTheDocument();
  });

  it("toggles checkbox, switch, and toggle controls", () => {
    render(
      <ThemeProvider>
        <Checkbox aria-label="Autosave" />
        <Switch aria-label="Inspector" />
        <Toggle>Snap</Toggle>
      </ThemeProvider>,
    );

    const checkbox = screen.getByRole("checkbox", { name: "Autosave" });
    const switchControl = screen.getByRole("switch", { name: "Inspector" });
    const toggle = screen.getByRole("button", { name: "Snap" });

    fireEvent.click(checkbox);
    fireEvent.click(switchControl);
    fireEvent.click(toggle);

    expect(checkbox).toHaveAttribute("aria-checked", "true");
    expect(switchControl).toHaveAttribute("aria-checked", "true");
    expect(toggle).toHaveAttribute("aria-pressed", "true");
  });

  it("updates radio groups and renders pagination items", () => {
    render(
      <ThemeProvider>
        <RadioGroup defaultValue="comfortable">
          <RadioGroupItem value="compact">Compact</RadioGroupItem>
          <RadioGroupItem value="comfortable">Comfortable</RadioGroupItem>
        </RadioGroup>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink isActive>1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink>2</PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole("radio", { name: "Compact" }));

    expect(screen.getByRole("radio", { name: "Compact" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByRole("button", { name: "1" })).toHaveAttribute("aria-current", "page");
  });

  it("renders alerts, avatars, progress, and skeleton states", () => {
    render(
      <ThemeProvider>
        <Alert>
          <AlertTitle>Ready</AlertTitle>
          <AlertDescription>Everything is healthy.</AlertDescription>
        </Alert>
        <Avatar>
          <AvatarFallback>SX</AvatarFallback>
        </Avatar>
        <Progress value={64} />
        <Skeleton data-testid="skeleton" className="h-4 w-24" />
      </ThemeProvider>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Everything is healthy.");
    expect(screen.getByText("SX")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "64");
    expect(screen.getByTestId("skeleton")).toBeInTheDocument();
  });

  it("supports accordion, select, and dialog interactions", () => {
    render(
      <ThemeProvider>
        <Accordion type="single" defaultValue="overview">
          <AccordionItem value="overview">
            <AccordionTrigger>Overview</AccordionTrigger>
            <AccordionContent>Overview body</AccordionContent>
          </AccordionItem>
          <AccordionItem value="details">
            <AccordionTrigger>Details</AccordionTrigger>
            <AccordionContent>Details body</AccordionContent>
          </AccordionItem>
        </Accordion>

        <Select defaultValue="schematic">
          <SelectTrigger aria-label="Panel selector">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="schematic">Schematic</SelectItem>
            <SelectItem value="pcb">PCB</SelectItem>
          </SelectContent>
        </Select>

        <Dialog>
          <DialogTrigger>Open dialog</DialogTrigger>
          <DialogContent hideClose>
            <DialogTitle>Release</DialogTitle>
            <DialogDescription>Dialog body</DialogDescription>
          </DialogContent>
        </Dialog>
      </ThemeProvider>,
    );

    expect(screen.getByText("Overview body")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Details" }));
    expect(screen.getByText("Details body")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Panel selector" }));
    fireEvent.click(screen.getByRole("option", { name: "PCB" }));
    expect(screen.getByRole("button", { name: "Panel selector" })).toHaveTextContent("PCB");

    fireEvent.click(screen.getByRole("button", { name: "Open dialog" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("Dialog body");
  });

  it("supports popover, sheet, and tooltip overlays", () => {
    render(
      <ThemeProvider>
        <Popover>
          <PopoverTrigger>Open popover</PopoverTrigger>
          <PopoverContent>Popover body</PopoverContent>
        </Popover>

        <Sheet>
          <SheetTrigger>Open sheet</SheetTrigger>
          <SheetContent>
            <SheetTitle>Inspector</SheetTitle>
          </SheetContent>
        </Sheet>

        <Tooltip>
          <TooltipTrigger>Hover target</TooltipTrigger>
          <TooltipContent>Tooltip body</TooltipContent>
        </Tooltip>
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open popover" }));
    expect(screen.getByText("Popover body")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Open sheet" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("Inspector");

    fireEvent.mouseEnter(screen.getByText("Hover target"));
    expect(screen.getByRole("tooltip")).toHaveTextContent("Tooltip body");
  });

  it("applies theme mode and primitive styles", () => {
    render(
      <ThemeProvider mode="dark">
        <Surface data-testid="surface" padding="lg">
          <Box data-testid="box" background="accentMuted" padding="md">
            Content
          </Box>
        </Surface>
      </ThemeProvider>,
    );

    expect(screen.getByTestId("surface").closest("[data-theme='dark']")).toBeInTheDocument();
    expect(screen.getByTestId("surface").getAttribute("style")).toContain("border-radius");
    expect(screen.getByTestId("box").getAttribute("style")).toContain("background-color");
  });
});
