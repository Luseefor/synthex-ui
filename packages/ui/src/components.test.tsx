import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ThemeProvider } from "./theme";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
  Alert,
  AlertDescription,
  AlertTitle,
  AspectRatio,
  Avatar,
  AvatarFallback,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Checkbox,
  Calendar,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
  LineChart,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
  DataTable,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  DirectionProvider,
  DatePicker,
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  ButtonGroup,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
  InputGroup,
  InputGroupAddon,
  Input,
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
  Item,
  ItemDescription,
  ItemTitle,
  Kbd,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
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
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
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
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  Slider,
  Sonner,
  ScrollArea,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
  ToastProvider,
  Toaster,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  NativeSelect,
  Spinner,
  useSonner,
} from "./components";
import { Box, Surface } from "./primitives";

describe("synthex-ui web components", () => {
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

  it("renders utility surfaces for grouped input and empty states", () => {
    render(
      <ThemeProvider>
        <Field>
          <ButtonGroup>
            <Button size="sm">Run</Button>
            <Button size="sm" variant="outline">Preview</Button>
          </ButtonGroup>
          <InputGroup>
            <InputGroupAddon>https://</InputGroupAddon>
            <Input aria-label="Repository URL" placeholder="example.com/repo" />
          </InputGroup>
          <NativeSelect aria-label="Native select fallback" defaultValue="one">
            <option value="one">One</option>
            <option value="two">Two</option>
          </NativeSelect>
          <Kbd>cmd+k</Kbd>
          <Spinner />
        </Field>
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No saved layouts</EmptyTitle>
            <EmptyDescription>Create a new workspace snapshot to begin.</EmptyDescription>
          </EmptyHeader>
        </Empty>
        <Item>
          <ItemTitle>Command palette</ItemTitle>
          <ItemDescription>Search actions, files, and panels.</ItemDescription>
        </Item>
      </ThemeProvider>,
    );

    expect(screen.getByLabelText("Repository URL")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Native select fallback" })).toBeInTheDocument();
    expect(screen.getByText("cmd+k")).toBeInTheDocument();
    expect(screen.getByLabelText("Loading")).toBeInTheDocument();
    expect(screen.getByText("No saved layouts")).toBeInTheDocument();
    expect(screen.getByText("Command palette")).toBeInTheDocument();
  });

  it("renders field composition helpers with consistent helper text", () => {
    render(
      <ThemeProvider>
        <FieldSet>
          <FieldLegend>Release gate</FieldLegend>
          <Field>
            <FieldLabel htmlFor="publish-token">Publish token</FieldLabel>
            <FieldContent>
              <Input id="publish-token" placeholder="npm_xxxxx" />
              <FieldDescription>Used only during release automation.</FieldDescription>
              <FieldError>Token is required.</FieldError>
            </FieldContent>
          </Field>
        </FieldSet>
      </ThemeProvider>,
    );

    expect(screen.getByText("Release gate")).toBeInTheDocument();
    expect(screen.getByLabelText("Publish token")).toBeInTheDocument();
    expect(screen.getByText("Used only during release automation.")).toBeInTheDocument();
    expect(screen.getByText("Token is required.")).toBeInTheDocument();
  });

  it("marks invalid inputs and supports ui sizing", () => {
    render(
      <ThemeProvider>
        <Input aria-label="Search" invalid placeholder="Search" uiSize="lg" />
      </ThemeProvider>,
    );

    expect(screen.getByLabelText("Search")).toHaveAttribute("aria-invalid", "true");
  });

  it("wires form field labels, descriptions, and messages", () => {
    render(
      <ThemeProvider>
        <Form>
          <FormField
            name="email"
            description="We only use this for updates."
            error="Email is required."
          >
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input aria-label="Email input" placeholder="name@example.com" />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          </FormField>
        </Form>
      </ThemeProvider>,
    );

    const input = screen.getByLabelText("Email input");

    expect(screen.getByText("We only use this for updates.")).toBeInTheDocument();
    expect(screen.getByText("Email is required.")).toBeInTheDocument();
    expect(screen.getByText("Email")).toHaveAttribute("for", input.getAttribute("id"));
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby");
  });

  it("supports slider and otp input interactions", () => {
    render(
      <ThemeProvider>
        <Slider aria-label="Opacity" defaultValue={[42]} />
        <InputOTP defaultValue="12">
          <InputOTPGroup>
            <InputOTPSlot index={0} aria-label="Digit 1" />
            <InputOTPSlot index={1} aria-label="Digit 2" />
            <InputOTPSeparator />
            <InputOTPSlot index={2} aria-label="Digit 3" />
            <InputOTPSlot index={3} aria-label="Digit 4" />
          </InputOTPGroup>
        </InputOTP>
      </ThemeProvider>,
    );

    fireEvent.change(screen.getByLabelText("Opacity"), { target: { value: "58" } });
    fireEvent.change(screen.getByLabelText("Digit 3"), { target: { value: "7" } });

    expect(screen.getByLabelText("Opacity")).toHaveValue("58");
    expect(screen.getByLabelText("Digit 3")).toHaveValue("7");
  });

  it("supports resizable panel groups", () => {
    render(
      <ThemeProvider>
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={60}>
            <div>Primary pane</div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={40}>
            <div>Secondary pane</div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ThemeProvider>,
    );

    const group = screen.getByTestId("resizable-group");
    const primaryPanel = screen.getByText("Primary pane").closest('[data-slot="resizable-panel"]');

    Object.defineProperty(group, "clientWidth", {
      configurable: true,
      value: 400,
    });

    expect(primaryPanel).toHaveAttribute("data-size", "60.00");

    fireEvent.mouseDown(screen.getByLabelText("Resize panels"), { clientX: 200 });
    fireEvent.mouseMove(window, { clientX: 240 });
    fireEvent.mouseUp(window);

    expect(Number(primaryPanel?.getAttribute("data-size"))).toBeGreaterThan(60);
  });

  it("renders toast notifications through the provider and viewport", () => {
    function ToastHarness() {
      const { toast } = useSonner();

      return (
        <>
          <Button
            onClick={() =>
              toast({
                description: "Workspace state persisted to disk.",
                title: "Saved layout",
              })
            }
          >
            Show toast
          </Button>
          <Toaster />
        </>
      );
    }

    render(
      <ThemeProvider>
        <ToastProvider>
          <ToastHarness />
        </ToastProvider>
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Show toast" }));

    expect(screen.getByText("Saved layout")).toBeInTheDocument();
    expect(screen.getByText("Workspace state persisted to disk.")).toBeInTheDocument();
  });

  it("supports calendar navigation", () => {
    render(
      <ThemeProvider>
        <Calendar defaultValue={new Date(2026, 2, 12)} />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Next month" }));
    expect(screen.getByText(/\w+ 2026/)).toBeInTheDocument();
  });

  it("supports carousel navigation", () => {
    render(
      <ThemeProvider>
        <Carousel>
          <CarouselContent>
            <CarouselItem>Slide one</CarouselItem>
            <CarouselItem>Slide two</CarouselItem>
          </CarouselContent>
          <div>
            <CarouselPrevious />
            <CarouselNext />
          </div>
        </Carousel>
      </ThemeProvider>,
    );

    expect(screen.getByText("Slide one")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next slide" }));
    expect(screen.getByText("Slide two")).toBeInTheDocument();
  });

  it("renders chart primitives with legend and tooltip content", () => {
    render(
      <ThemeProvider>
        <ChartContainer>
          <ChartLegend
            series={[
              {
                key: "visitors",
                label: "Visitors",
                data: [
                  { label: "Mon", value: 16 },
                  { label: "Tue", value: 24 },
                  { label: "Wed", value: 20 },
                ],
              },
            ]}
          />
          <LineChart
            ariaLabel="Traffic chart"
            series={[
              {
                key: "visitors",
                label: "Visitors",
                data: [
                  { label: "Mon", value: 16 },
                  { label: "Tue", value: 24 },
                  { label: "Wed", value: 20 },
                ],
              },
            ]}
          />
          <ChartTooltip>
            <ChartTooltipContent
              items={[{ label: "Visitors", value: 24 }]}
              label="Tuesday"
            />
          </ChartTooltip>
        </ChartContainer>
      </ThemeProvider>,
    );

    expect(screen.getAllByText("Visitors")).toHaveLength(2);
    expect(screen.getByRole("img", { name: "Traffic chart" })).toBeInTheDocument();
    expect(screen.getByText("Tuesday")).toBeInTheDocument();
  });

  it("toggles the shared sidebar shell", () => {
    render(
      <ThemeProvider>
        <SidebarProvider defaultOpen>
          <div className="flex gap-4">
            <Sidebar>
              <SidebarHeader>
                <SidebarTrigger>Toggle navigation</SidebarTrigger>
              </SidebarHeader>
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton active>Overview</SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>
            </Sidebar>
            <SidebarInset>
              <div>Content</div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </ThemeProvider>,
    );

    const sidebar = screen.getByRole("complementary");
    expect(sidebar).toHaveAttribute("data-state", "open");

    fireEvent.click(screen.getByRole("button", { name: "Toggle navigation" }));

    expect(sidebar).toHaveAttribute("data-state", "closed");
  });

  it("supports date picker selection", () => {
    render(
      <ThemeProvider>
        <DatePicker placeholder="Pick a date" />
      </ThemeProvider>,
    );

    const datePickerTrigger = screen.getByRole("button", { name: "Pick a date" });

    fireEvent.click(datePickerTrigger);
    fireEvent.click(screen.getAllByRole("button", { name: "12" })[0]!);

    expect(datePickerTrigger).not.toHaveTextContent("Pick a date");
    expect(datePickerTrigger.textContent).toMatch(/\d{4}/);
  });

  it("renders direction provider wrappers", () => {
    render(
      <ThemeProvider>
        <DirectionProvider dir="rtl">
          <div>Right to left content</div>
        </DirectionProvider>
      </ThemeProvider>,
    );

    expect(screen.getByText("Right to left content").parentElement).toHaveAttribute("dir", "rtl");
  });

  it("supports data table sorting and filtering", () => {
    render(
      <ThemeProvider>
        <DataTable
          columns={[
            { id: "package", header: "Package", accessor: "package" },
            { id: "status", header: "Status", accessor: "status" },
            { id: "downloads", header: "Downloads", accessor: "downloads", align: "right" },
          ]}
          data={[
            { package: "synthex-ui", status: "Stable", downloads: 8200 },
            { package: "@synthex/core", status: "Stable", downloads: 6400 },
            { package: "@synthex/react-web", status: "Preview", downloads: 2300 },
          ]}
          searchKey="package"
        />
      </ThemeProvider>,
    );

    fireEvent.change(screen.getByLabelText("Filter table rows"), {
      target: { value: "core" },
    });

    expect(screen.getByText("@synthex/core")).toBeInTheDocument();
    expect(screen.queryByText("synthex-ui")).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Filter table rows"), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Downloads/ }));

    const rows = screen.getAllByRole("row");
    expect(rows.at(1)).toHaveTextContent("@synthex/react-web");
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
        <ScrollArea data-testid="scroll-area" style={{ maxHeight: 120 }}>
          <div>Scrollable content</div>
        </ScrollArea>
      </ThemeProvider>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Everything is healthy.");
    expect(screen.getByText("SX")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "64");
    expect(screen.getByTestId("skeleton")).toBeInTheDocument();
    expect(screen.getByTestId("scroll-area")).toBeInTheDocument();
  });

  it("uses an inset viewport for scroll areas so content does not clip against the shell", () => {
    render(
      <ThemeProvider>
        <ScrollArea
          data-testid="scroll-area"
          border
          padding="md"
          radius="lg"
          style={{ height: 120 }}
        >
          <div>Scrollable content</div>
        </ScrollArea>
      </ThemeProvider>,
    );

    const root = screen.getByTestId("scroll-area");
    const viewport = root.firstElementChild as HTMLDivElement | null;
    const content = viewport?.firstElementChild as HTMLDivElement | null;

    expect(viewport).not.toBeNull();
    expect(viewport?.style.overflow).toBe("auto");
    expect(content).not.toBeNull();
    expect(content?.style.boxSizing).toBe("border-box");
  });

  it("renders breadcrumb and aspect ratio helpers", () => {
    render(
      <ThemeProvider>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#docs">Docs</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Components</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <AspectRatio ratio={4 / 3} data-testid="ratio-box">
          <div>Preview</div>
        </AspectRatio>
      </ThemeProvider>,
    );

    expect(screen.getByLabelText("Breadcrumb")).toBeInTheDocument();
    expect(screen.getByText("Components")).toBeInTheDocument();
    expect(screen.getByTestId("ratio-box")).toBeInTheDocument();
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

  it("supports collapsible, hover card, and drawer overlays", () => {
    render(
      <ThemeProvider>
        <Collapsible defaultOpen>
          <CollapsibleTrigger>Toggle section</CollapsibleTrigger>
          <CollapsibleContent>Collapsible body</CollapsibleContent>
        </Collapsible>

        <HoverCard openDelay={0} closeDelay={0}>
          <HoverCardTrigger>Hover target</HoverCardTrigger>
          <HoverCardContent>Hover card body</HoverCardContent>
        </HoverCard>

        <Drawer>
          <DrawerTrigger>Open drawer</DrawerTrigger>
          <DrawerContent>
            <DrawerTitle>Drawer title</DrawerTitle>
          </DrawerContent>
        </Drawer>
      </ThemeProvider>,
    );

    expect(screen.getByText("Collapsible body")).toBeInTheDocument();
    fireEvent.mouseEnter(screen.getByText("Hover target"));
    expect(screen.getByText("Hover card body")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Open drawer" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("Drawer title");
  });

  it("supports alert dialog and toggle group state changes", () => {
    render(
      <ThemeProvider>
        <AlertDialog>
          <AlertDialogTrigger>Delete file</AlertDialogTrigger>
          <AlertDialogContent hideClose>
            <AlertDialogTitle>Delete asset</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
            <AlertDialogAction>Confirm</AlertDialogAction>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogContent>
        </AlertDialog>

        <ToggleGroup type="multiple" defaultValue={["design"]}>
          <ToggleGroupItem value="design">Design</ToggleGroupItem>
          <ToggleGroupItem value="code">Code</ToggleGroupItem>
        </ToggleGroup>
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete file" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("Delete asset");

    const code = screen.getByRole("button", { name: "Code" });
    fireEvent.click(code);
    expect(code).toHaveAttribute("aria-pressed", "true");
  });

  it("filters command results and selects combobox options", () => {
    render(
      <ThemeProvider>
        <Command>
          <CommandInput aria-label="Command palette" />
          <CommandList>
            <CommandGroup heading="Navigation">
              <CommandItem value="open-schematic">Open schematic</CommandItem>
              <CommandItem value="open-console">Open console</CommandItem>
            </CommandGroup>
            <CommandEmpty>No matching command.</CommandEmpty>
          </CommandList>
        </Command>

        <Combobox defaultValue="pcb" placeholder="Choose workspace">
          <ComboboxTrigger aria-label="Workspace combobox">
            <ComboboxValue />
          </ComboboxTrigger>
          <ComboboxContent>
            <ComboboxInput aria-label="Workspace search" />
            <ComboboxList>
              <ComboboxEmpty>No matching workspace.</ComboboxEmpty>
              <ComboboxItem value="schematic">Schematic</ComboboxItem>
              <ComboboxItem value="pcb">PCB</ComboboxItem>
              <ComboboxItem value="console">Console</ComboboxItem>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </ThemeProvider>,
    );

    fireEvent.change(screen.getByRole("textbox", { name: "Command palette" }), {
      target: { value: "console" },
    });

    expect(screen.queryByRole("option", { name: "Open schematic" })).not.toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Open console" })).toBeInTheDocument();

    fireEvent.change(screen.getByRole("textbox", { name: "Command palette" }), {
      target: { value: "missing" },
    });

    expect(screen.getByText("No matching command.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Workspace combobox" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Workspace search" }), {
      target: { value: "schem" },
    });
    fireEvent.click(screen.getByRole("option", { name: "Schematic" }));

    expect(screen.getByRole("button", { name: "Workspace combobox" })).toHaveTextContent(
      "Schematic",
    );
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

  it("supports dropdown menus and context menus", () => {
    render(
      <ThemeProvider>
        <DropdownMenu>
          <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Panels</DropdownMenuLabel>
            <DropdownMenuItem>Schematic</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Console</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <ContextMenu>
          <ContextMenuTrigger data-testid="context-surface">
            <div>Right click area</div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuLabel>Inspector</ContextMenuLabel>
            <ContextMenuItem>Rename panel</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem>Duplicate panel</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    expect(screen.getByRole("menu")).toHaveTextContent("Panels");

    fireEvent.click(screen.getByRole("menuitem", { name: "Console" }));
    expect(screen.queryByRole("menuitem", { name: "Console" })).not.toBeInTheDocument();

    fireEvent.contextMenu(screen.getByTestId("context-surface"));
    expect(screen.getByRole("menu")).toHaveTextContent("Rename panel");
  });

  it("supports menubar and navigation menu patterns", () => {
    render(
      <ThemeProvider>
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarLabel>Project</MenubarLabel>
              <MenubarItem>New file</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Open recent</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>

        <NavigationMenu defaultValue="guides">
          <NavigationMenuList>
            <NavigationMenuItem value="guides">
              <NavigationMenuTrigger>Guides</NavigationMenuTrigger>
            </NavigationMenuItem>
            <NavigationMenuItem value="api">
              <NavigationMenuTrigger>API</NavigationMenuTrigger>
            </NavigationMenuItem>
            <NavigationMenuLink href="https://example.com/changelog">Changelog</NavigationMenuLink>
          </NavigationMenuList>
          <NavigationMenuItem value="guides">
            <NavigationMenuContent>Guides content</NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem value="api">
            <NavigationMenuContent>API content</NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenu>
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "File" }));
    expect(screen.getByRole("menu")).toHaveTextContent("New file");

    fireEvent.click(screen.getByRole("button", { name: "API" }));
    expect(screen.getByText("API content")).toBeInTheDocument();
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
