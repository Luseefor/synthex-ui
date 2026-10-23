import * as React from "react";
import { Keyboard, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, View } from "react-native";
import { Button } from "synthex-ui/button";
import { Checkbox } from "synthex-ui/checkbox";
import { Switch } from "synthex-ui/switch";
import { Input } from "synthex-ui/input";
import { Textarea } from "synthex-ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "synthex-ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "synthex-ui/tabs";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "synthex-ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "synthex-ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "synthex-ui/popover";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList, ComboboxTrigger, ComboboxValue } from "synthex-ui/combobox";
import { ThemeProvider, useTheme } from "synthex-ui/theme";
import { BarChart, DirectionProvider } from "synthex-ui/native";
import OwnedOverlays from "./OwnedOverlays";
import RemainingOverlays from "./RemainingOverlays";
import OwnedRemainingOverlays from "./OwnedRemainingOverlays";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "synthex-ui/input-otp";
import { Slider } from "synthex-ui/slider";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "synthex-ui/resizable";
import { Sheet, SheetTrigger, SheetContent, SheetClose, SheetTitle } from "synthex-ui/sheet";
import { Drawer, DrawerTrigger, DrawerContent, DrawerClose, DrawerTitle } from "synthex-ui/drawer";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type NativeCarouselApi } from "synthex-ui/carousel";

function useCarouselReadout(api: NativeCarouselApi | undefined) {
  const [index, setIndex] = React.useState(0);
  React.useEffect(() => {
    if (!api) return;
    const sync = () => setIndex(api.selectedScrollSnap());
    sync();
    api.on("select", sync).on("reInit", sync);
    return () => { api.off("select", sync); api.off("reInit", sync); };
  }, [api]);
  return index;
}

export default function App() {
  const [dark, setDark] = React.useState(false);
  const [rtl, setRtl] = React.useState(false);
  return <ThemeProvider mode={dark ? "dark" : "light"}>
    <DirectionProvider dir={rtl ? "rtl" : "ltr"}>
      <Contracts dark={dark} setDark={setDark} rtl={rtl} setRtl={setRtl} />
    </DirectionProvider>
  </ThemeProvider>;
}

function Contracts({ dark, setDark, rtl, setRtl }: { dark: boolean; setDark: (value: boolean) => void; rtl: boolean; setRtl: (value: boolean) => void }) {
  const theme = useTheme();
  const [count, setCount] = React.useState(0);
  const [checked, setChecked] = React.useState(false);
  const [enabled, setEnabled] = React.useState(false);
  const [name, setName] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [fruit, setFruit] = React.useState("apple");
  const [tab, setTab] = React.useState("one");
  const [open, setOpen] = React.useState(false);
  const [dismissible, setDismissible] = React.useState(true);
  const [dialogPresses, setDialogPresses] = React.useState(0);
  const [tabPresses, setTabPresses] = React.useState(0);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [menuActions, setMenuActions] = React.useState(0);
  const [popoverActions, setPopoverActions] = React.useState(0);
  const [popoverText, setPopoverText] = React.useState("");
  const [choice, setChoice] = React.useState("apple");
  const [choiceOpen, setChoiceOpen] = React.useState(false);
  const [otp, setOtp] = React.useState("");
  const [otpDisabled, setOtpDisabled] = React.useState(false);
  const otpRef = React.useRef<React.ElementRef<typeof InputOTPSlot>>(null);
  const [sliderSingle, setSliderSingle] = React.useState([13]);
  const [sliderRange, setSliderRange] = React.useState([20, 80]);
  const [sliderVertical, setSliderVertical] = React.useState([50]);
  const [sliderDisabled, setSliderDisabled] = React.useState(false);
  const [sliderInverted, setSliderInverted] = React.useState(false);
  const [singleCommits, setSingleCommits] = React.useState(0);
  const [rangeCommits, setRangeCommits] = React.useState(0);
  const sliderRef = React.useRef<React.ElementRef<typeof Slider>>(null);
  const [horizontalSizes, setHorizontalSizes] = React.useState([30, 40, 30]);
  const [verticalSizes, setVerticalSizes] = React.useState([50, 50]);
  const [resizableDisabled, setResizableDisabled] = React.useState(false);
  const [horizontalCommits, setHorizontalCommits] = React.useState(0);
  const [verticalCommits, setVerticalCommits] = React.useState(0);
  const resizableRef = React.useRef<React.ElementRef<typeof ResizablePanelGroup>>(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [sheetDisabled, setSheetDisabled] = React.useState(false);
  const [sheetDismissible, setSheetDismissible] = React.useState(true);
  const [sheetSide, setSheetSide] = React.useState<"top" | "right" | "bottom" | "left">("right");
  const [sheetRequests, setSheetRequests] = React.useState(0);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [drawerDisabled, setDrawerDisabled] = React.useState(false);
  const [drawerDismissible, setDrawerDismissible] = React.useState(true);
  const [drawerDirection, setDrawerDirection] = React.useState<"top" | "right" | "bottom" | "left">("bottom");
  const [drawerRequests, setDrawerRequests] = React.useState(0);
  const sheetTriggerRef = React.useRef<React.ElementRef<typeof SheetTrigger>>(null);
  const drawerContentRef = React.useRef<React.ElementRef<typeof DrawerContent>>(null);
  const modalSides = ["top", "right", "bottom", "left"] as const;
  const [carouselCount, setCarouselCount] = React.useState(3);
  const [carouselDisabled, setCarouselDisabled] = React.useState(false);
  const [carouselIndex, setCarouselIndex] = React.useState(0);
  const [horizontalApi, setHorizontalApi] = React.useState<NativeCarouselApi>();
  const [verticalApi, setVerticalApi] = React.useState<NativeCarouselApi>();
  const horizontalIndex = useCarouselReadout(horizontalApi);
  const verticalIndex = useCarouselReadout(verticalApi);
  const carouselContentRef = React.useRef<React.ElementRef<typeof CarouselContent>>(null);
  const inputRef = React.useRef<React.ElementRef<typeof Input>>(null);
  const labelStyle = { color: theme.colors.foreground, fontSize: 16 };
  const headingStyle = { ...labelStyle, fontSize: 20, fontWeight: "700" as const };
  return <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
    <ScrollView style={{ flex: 1 }} testID="native-contracts" keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 24, gap: 20 }}>
      <View style={{ gap: 8 }}>
        <Text accessibilityRole="header" style={{ ...headingStyle, fontSize: 26 }}>Synthex native contracts</Text>
        <Text style={labelStyle}>Interactive fixture. Bundle success does not verify device behavior.</Text>
      </View>
      <OwnedOverlays />
      <RemainingOverlays />
      <OwnedRemainingOverlays />

      <View style={{ gap: 10 }}>
        <Text accessibilityRole="header" style={headingStyle}>Sheet and Drawer interactions</Text>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild ref={sheetTriggerRef} testID="sheet-trigger" disabled={sheetDisabled}>
            <Button>Open sheet ({sheetSide})</Button>
          </SheetTrigger>
          <SheetContent side={sheetSide} dismissible={sheetDismissible} testID="sheet-content"
            modalProps={{ onRequestClose: () => setSheetRequests(n => n + 1) }}>
            <SheetTitle>Sheet: {sheetSide}</SheetTitle>
            <Text style={labelStyle}>Backdrop/Back: {sheetDismissible ? "dismisses" : "blocked"}. Explicit close remains available.</Text>
            <SheetClose asChild testID="sheet-explicit-close"><Button>Close sheet explicitly</Button></SheetClose>
          </SheetContent>
        </Sheet>
        <Button testID="sheet-disable-trigger" variant="outline" onPress={() => setSheetDisabled(!sheetDisabled)}>Sheet trigger: {sheetDisabled ? "disabled" : "enabled"}</Button>
        <Button testID="sheet-dismiss-toggle" variant="outline" onPress={() => setSheetDismissible(!sheetDismissible)}>Sheet ambient dismissal: {sheetDismissible ? "on" : "off"}</Button>
        <Button testID="sheet-side-cycle" variant="outline" onPress={() => setSheetSide(side => modalSides[(modalSides.indexOf(side) + 1) % 4]!)}>Sheet side: {sheetSide}</Button>
        <Text testID="sheet-request-count" style={labelStyle}>Sheet system requests: {sheetRequests}</Text>
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} direction={drawerDirection} dismissible={drawerDismissible}>
          <DrawerTrigger asChild testID="drawer-trigger" disabled={drawerDisabled}><Button>Open drawer ({drawerDirection})</Button></DrawerTrigger>
          <DrawerContent ref={drawerContentRef} testID="drawer-content"
            modalProps={{ onRequestClose: () => setDrawerRequests(n => n + 1) }}>
            <DrawerTitle>Drawer: {drawerDirection}</DrawerTitle>
            <Text style={labelStyle}>Root dismissal: {drawerDismissible ? "on" : "off"}. The handle is decorative.</Text>
            <DrawerClose asChild testID="drawer-explicit-close"><Button>Close drawer explicitly</Button></DrawerClose>
          </DrawerContent>
        </Drawer>
        <Button testID="drawer-disable-trigger" variant="outline" onPress={() => setDrawerDisabled(!drawerDisabled)}>Drawer trigger: {drawerDisabled ? "disabled" : "enabled"}</Button>
        <Button testID="drawer-dismiss-toggle" variant="outline" onPress={() => setDrawerDismissible(!drawerDismissible)}>Drawer ambient dismissal: {drawerDismissible ? "on" : "off"}</Button>
        <Button testID="drawer-direction-cycle" variant="outline" onPress={() => setDrawerDirection(side => modalSides[(modalSides.indexOf(side) + 1) % 4]!)}>Drawer direction: {drawerDirection}</Button>
        <Text testID="drawer-request-count" style={labelStyle}>Drawer system requests: {drawerRequests}</Text>
      </View>

      <View style={{ gap: 10 }}>
        <Text accessibilityRole="header" style={headingStyle}>Paged carousels</Text>
        <Carousel testID="carousel-horizontal" index={carouselIndex} onIndexChange={setCarouselIndex}
          setApi={setHorizontalApi} disabled={carouselDisabled}>
          <CarouselContent ref={carouselContentRef} testID="carousel-horizontal-content" style={{ height: 180 }}>
            {Array.from({ length: carouselCount }, (_, index) => <CarouselItem key={index}
              style={{ flex: 1, padding: 16, backgroundColor: theme.colors.surfaceRaised }}>
              <Text style={labelStyle}>Horizontal slide {index + 1}</Text>
              <Button onPress={() => setCount(count + 1)}>Slide action {index + 1}</Button>
            </CarouselItem>)}
          </CarouselContent>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <CarouselPrevious testID="carousel-horizontal-prev" />
            <CarouselNext testID="carousel-horizontal-next" />
          </View>
        </Carousel>
        <Text testID="carousel-horizontal-index" style={labelStyle}>Horizontal index: {horizontalIndex}; slides: {carouselCount}</Text>
        <Button testID="carousel-remove-slide" variant="secondary" disabled={carouselCount === 0}
          onPress={() => setCarouselCount(count => Math.max(0, count - 1))}>Remove last slide</Button>
        <Button testID="carousel-restore-slides" variant="secondary" onPress={() => setCarouselCount(3)}>Restore three slides</Button>
        <Button testID="carousel-disabled-toggle" variant="outline" onPress={() => setCarouselDisabled(!carouselDisabled)}>
          Carousel editing: {carouselDisabled ? "off" : "on"}
        </Button>
        <Carousel testID="carousel-vertical" orientation="vertical" opts={{ startIndex: 1 }}
          setApi={setVerticalApi} disabled={carouselDisabled}>
          <CarouselContent testID="carousel-vertical-content" style={{ height: 240 }}>
            {[1, 2, 3].map(number => <CarouselItem key={number} style={{ flex: 1, padding: 16, backgroundColor: theme.colors.surfaceRaised }}>
              <Text style={labelStyle}>Vertical slide {number}</Text>
            </CarouselItem>)}
          </CarouselContent>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <CarouselPrevious testID="carousel-vertical-prev" />
            <CarouselNext testID="carousel-vertical-next" />
          </View>
        </Carousel>
        <Text testID="carousel-vertical-index" style={labelStyle}>Vertical index: {verticalIndex}</Text>
      </View>

      <View style={{ gap: 10 }}>
        <Text accessibilityRole="header" style={headingStyle}>Resizable panels</Text>
        <ResizablePanelGroup ref={resizableRef} testID="resizable-horizontal" direction="horizontal"
          sizes={horizontalSizes} onSizesChange={setHorizontalSizes} disabled={resizableDisabled}
          onSizesCommit={() => setHorizontalCommits(count => count + 1)}>
          <ResizablePanel minSize={15} maxSize={70}><Text style={labelStyle}>First panel</Text></ResizablePanel>
          <ResizableHandle testID="resizable-horizontal-handle-0" accessibilityLabel="Resize first and middle panels" />
          <ResizablePanel minSize={15} maxSize={70}><Text style={labelStyle}>Middle panel</Text></ResizablePanel>
          <ResizableHandle testID="resizable-horizontal-handle-1" accessibilityLabel="Resize middle and last panels" />
          <ResizablePanel minSize={15} maxSize={70}><Text style={labelStyle}>Last panel</Text></ResizablePanel>
        </ResizablePanelGroup>
        <Text testID="resizable-horizontal-sizes" style={labelStyle}>Horizontal: {horizontalSizes.map(n => n.toFixed(1)).join(", ")}</Text>
        <Text testID="resizable-horizontal-commit" style={labelStyle}>Horizontal commits: {horizontalCommits}</Text>
        <ResizablePanelGroup testID="resizable-vertical" direction="vertical" style={{ height: 260 }}
          sizes={verticalSizes} onSizesChange={setVerticalSizes} disabled={resizableDisabled}
          onSizesCommit={() => setVerticalCommits(count => count + 1)}>
          <ResizablePanel minSize={15} maxSize={70}><Text style={labelStyle}>Upper panel</Text></ResizablePanel>
          <ResizableHandle testID="resizable-vertical-handle-0" accessibilityLabel="Resize upper and lower panels" />
          <ResizablePanel minSize={15} maxSize={70}><Text style={labelStyle}>Lower panel</Text></ResizablePanel>
        </ResizablePanelGroup>
        <Text testID="resizable-vertical-sizes" style={labelStyle}>Vertical: {verticalSizes.map(n => n.toFixed(1)).join(", ")}</Text>
        <Text testID="resizable-vertical-commit" style={labelStyle}>Vertical commits: {verticalCommits}</Text>
        <Button testID="resizable-disabled-toggle" variant="secondary" onPress={() => setResizableDisabled(!resizableDisabled)}>
          Panel resizing: {resizableDisabled ? "off" : "on"}
        </Button>
      </View>

      <View style={{ gap: 10 }}>
        <Text accessibilityRole="header" style={headingStyle}>Draggable sliders</Text>
        <Slider ref={sliderRef} testID="slider-single" min={5} max={25} step={2} value={sliderSingle} onValueChange={setSliderSingle}
          onValueCommit={() => setSingleCommits(count => count + 1)} disabled={sliderDisabled} inverted={sliderInverted}
          accessibilityLabel="Single value" />
        <Text testID="slider-single-value" style={labelStyle}>Single: {sliderSingle.join(", ")}</Text>
        <Text testID="slider-single-commit" style={labelStyle}>Single commits: {singleCommits}</Text>
        <Slider testID="slider-range" step={5} value={sliderRange} onValueChange={setSliderRange}
          onValueCommit={() => setRangeCommits(count => count + 1)} disabled={sliderDisabled} inverted={sliderInverted}
          accessibilityLabel="Selected range" thumbLabels={["Lower bound", "Upper bound"]} />
        <Text testID="slider-range-value" style={labelStyle}>Range: {sliderRange.join(", ")}</Text>
        <Text testID="slider-range-commit" style={labelStyle}>Range commits: {rangeCommits}</Text>
        <Slider testID="slider-vertical" orientation="vertical" style={{ height: 180 }} value={sliderVertical}
          onValueChange={setSliderVertical} disabled={sliderDisabled} inverted={sliderInverted} accessibilityLabel="Vertical value" />
        <Text testID="slider-vertical-value" style={labelStyle}>Vertical: {sliderVertical.join(", ")}</Text>
        <Button testID="slider-disabled-toggle" variant="secondary" onPress={() => setSliderDisabled(!sliderDisabled)}>
          Slider editing: {sliderDisabled ? "off" : "on"}
        </Button>
        <Button testID="slider-inverted-toggle" variant="outline" onPress={() => setSliderInverted(!sliderInverted)}>
          Inverted: {String(sliderInverted)}
        </Button>
      </View>

      <View style={{ gap: 10 }}>
        <Text accessibilityRole="header" style={headingStyle}>One-time code</Text>
        <InputOTP length={6} value={otp} onValueChange={setOtp} disabled={otpDisabled}>
          <InputOTPGroup style={{ flexWrap: "wrap" }}>
            {Array.from({ length: 6 }, (_, index) => <InputOTPSlot key={index} index={index}
              ref={index === 0 ? otpRef : undefined} testID={"otp-slot-" + index} />)}
          </InputOTPGroup>
        </InputOTP>
        <Text testID="otp-value" style={labelStyle}>Code: {otp || "empty"}</Text>
        <Button testID="otp-fill" variant="secondary" onPress={() => setOtp("123456")}>Set controlled code</Button>
        <Button testID="otp-clear" variant="secondary" onPress={() => setOtp("")}>Clear code</Button>
        <Button testID="otp-disabled-toggle" variant="outline" onPress={() => setOtpDisabled(!otpDisabled)}>OTP editing: {otpDisabled ? "off" : "on"}</Button>
        <Button testID="otp-ref-focus" onPress={() => otpRef.current?.focus()}>Focus first code slot using ref</Button>
      </View>

      <View style={{ gap: 10 }}>
        <Text accessibilityRole="header" style={headingStyle}>Theme and actions</Text>
        <Button testID="theme-toggle" onPress={() => setDark(!dark)}>Use {dark ? "light" : "dark"} theme</Button>
        <Button testID="count-button" onPress={() => setCount(count + 1)}>Count {count}</Button>
        <Button testID="disabled-button" disabled onPress={() => setCount(count + 100)}>Disabled: count must stay unchanged</Button>
        <Text testID="count-value" style={labelStyle}>Count: {count}</Text>
      </View>

      <View style={{ gap: 10 }}>
        <Text accessibilityRole="header" style={headingStyle}>Controlled inputs</Text>
        <Input ref={inputRef} testID="name-input" accessibilityLabel="Name" placeholder="Name" value={name} onChangeText={setName} />
        <Button testID="focus-input" variant="secondary" onPress={() => inputRef.current?.focus()}>Focus name using ref</Button>
        <Input testID="readonly-input" accessibilityLabel="Read only example" editable={false} value="Read only" />
        <Textarea testID="notes-input" accessibilityLabel="Notes" placeholder="Notes" value={notes} onChangeText={setNotes} />
        <Text testID="text-value" style={labelStyle}>Name: {name}; Notes: {notes}</Text>
        <Checkbox testID="controlled-checkbox" accessibilityLabel="Accept terms" checked={checked} onCheckedChange={setChecked} />
        <Checkbox testID="mixed-checkbox" accessibilityLabel="Mixed example" defaultChecked="indeterminate" />
        <Checkbox testID="disabled-checkbox" accessibilityLabel="Disabled checkbox" disabled checked={false} />
        <Switch testID="controlled-switch" accessibilityLabel="Enable notifications" checked={enabled} onCheckedChange={setEnabled} />
        <Switch testID="disabled-switch" accessibilityLabel="Disabled switch" disabled checked={false} />
        <Text testID="control-values" style={labelStyle}>Accepted: {String(checked)}; Notifications: {String(enabled)}</Text>
      </View>

      <View style={{ gap: 10 }}>
        <Text accessibilityRole="header" style={headingStyle}>Anchored select and tabs</Text>
        <Select value={fruit} onValueChange={setFruit}>
          <SelectTrigger testID="fruit-trigger" accessibilityLabel="Fruit"><SelectValue /></SelectTrigger>
          <SelectContent testID="fruit-content">
            <SelectItem testID="fruit-apple" value="apple">Apple</SelectItem>
            <SelectItem testID="fruit-banana" value="banana">Banana</SelectItem>
            <SelectItem testID="fruit-disabled" value="disabled" disabled>Unavailable fruit</SelectItem>
          </SelectContent>
        </Select>
        <Select disabled>
          <SelectTrigger testID="disabled-select" accessibilityLabel="Disabled select"><SelectValue placeholder="Unavailable select" /></SelectTrigger>
        </Select>
        <Text testID="fruit-value" style={labelStyle}>Fruit: {fruit}</Text>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger testID="tab-one" value="one">One</TabsTrigger>
            <TabsTrigger testID="tab-two" value="two" onPress={() => setTabPresses(tabPresses + 1)}>Two</TabsTrigger>
            <TabsTrigger testID="tab-disabled" value="disabled" disabled>Disabled</TabsTrigger>
          </TabsList>
          <TabsContent testID="panel-one" value="one"><Text style={labelStyle}>First panel</Text></TabsContent>
          <TabsContent testID="panel-two" value="two"><Text style={labelStyle}>Second panel</Text></TabsContent>
        </Tabs>
        <Text testID="tab-value" style={labelStyle}>Tab: {tab}; Two handler calls: {tabPresses}</Text>
      </View>

      <View style={{ gap: 10 }}>
        <Text accessibilityRole="header" style={headingStyle}>Anchored overlays</Text>
        <Button testID="overlay-direction" variant="secondary" onPress={() => setRtl(!rtl)}>Direction: {rtl ? "RTL" : "LTR"}</Button>
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild><Button testID="dropdown-trigger">Open actions</Button></DropdownMenuTrigger>
          <DropdownMenuContent testID="dropdown-content" align="start" sideOffset={6}>
            <DropdownMenuItem testID="dropdown-action" onPress={() => setMenuActions(menuActions + 1)}>Run and close</DropdownMenuItem>
            <DropdownMenuItem testID="dropdown-cancel" onPress={event => event.preventDefault()}>Keep menu open</DropdownMenuItem>
            <DropdownMenuItem disabled>Disabled action</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Text testID="dropdown-value" style={labelStyle}>Actions: {menuActions}; Menu: {menuOpen ? "open" : "closed"}</Text>
        <Popover>
          <PopoverTrigger asChild><Button testID="popover-trigger" variant="outline">Open editable popover</Button></PopoverTrigger>
          <PopoverContent testID="popover-content" style={{ width: 300 }}>
            <Text style={labelStyle}>Interior presses keep this open.</Text>
            <Input testID="popover-input" accessibilityLabel="Popover note" placeholder="Show the keyboard" value={popoverText} onChangeText={setPopoverText} />
            <Button testID="popover-interior" onPress={() => setPopoverActions(popoverActions + 1)}>Interior count {popoverActions}</Button>
          </PopoverContent>
        </Popover>
        <Text testID="popover-value" style={labelStyle}>Popover count: {popoverActions}; Note: {popoverText}</Text>
        <Combobox value={choice} onValueChange={setChoice} open={choiceOpen} onOpenChange={setChoiceOpen}>
          <ComboboxTrigger testID="combobox-trigger" accessibilityLabel="Search fruit"><ComboboxValue /></ComboboxTrigger>
          <ComboboxContent testID="combobox-content" side="bottom" align="start">
            <ComboboxInput testID="combobox-search" accessibilityLabel="Filter fruit" />
            <ComboboxList>
              <ComboboxEmpty>No matching fruit</ComboboxEmpty>
              <ComboboxItem testID="combobox-apple" value="apple">Apple</ComboboxItem>
              <ComboboxItem testID="combobox-banana" value="banana">Banana</ComboboxItem>
              <ComboboxItem testID="combobox-disabled" value="disabled" disabled>Unavailable fruit</ComboboxItem>
              {Array.from({ length: 20 }, (_, index) => <ComboboxItem key={index} value={"fruit-" + index}>Fruit {index + 1}</ComboboxItem>)}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <Text testID="combobox-value" style={labelStyle}>Choice: {choice}; Search: {choiceOpen ? "open" : "closed"}</Text>
        <View style={{ alignItems: "flex-end", overflow: "hidden", borderWidth: 1, borderColor: theme.colors.border }}>
          <Popover>
            <PopoverTrigger asChild><Button testID="edge-trigger">Edge / clipped parent</Button></PopoverTrigger>
            <PopoverContent testID="edge-content" side="right" align="end" style={{ width: 300 }}>
              <Text style={labelStyle}>This surface should flip and remain inside the screen, outside the clipped parent.</Text>
            </PopoverContent>
          </Popover>
        </View>
      </View>

      <View style={{ gap: 10 }}>
        <Text accessibilityRole="header" style={headingStyle}>Native chart geometry</Text>
        <BarChart testID="grouped-chart" ariaLabel="Visitors and signups by day" series={[
          { key: "visitors", label: "Visitors", data: [{ label: "Mon", value: 16 }, { label: "Tue", value: 24 }, { label: "Wed", value: 20 }] },
          { key: "signups", label: "Signups", data: [{ label: "Mon", value: 8 }, { label: "Tue", value: 0 }, { label: "Wed", value: 12 }] },
        ]} />
      </View>

      <View style={{ gap: 10 }}>
        <Text accessibilityRole="header" style={headingStyle}>Controlled modal</Text>
        <Button testID="dismiss-mode" variant="outline" onPress={() => setDismissible(!dismissible)}>
          Backdrop and Back dismissal: {dismissible ? "on" : "off"}
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button testID="open-dialog">Open dialog</Button></DialogTrigger>
          <DialogContent testID="contract-dialog" dismissible={dismissible}>
            <DialogTitle>Native contract dialog</DialogTitle>
            <DialogDescription>Test interior taps, close, backdrop, Android Back, and screen reader focus.</DialogDescription>
            <Button testID="dialog-interior-action" onPress={() => setDialogPresses(dialogPresses + 1)}>Interior count {dialogPresses}</Button>
            <Popover>
              <PopoverTrigger asChild><Button testID="nested-popover-trigger">Open popover inside dialog</Button></PopoverTrigger>
              <PopoverContent testID="nested-popover-content"><Text style={labelStyle}>Dismiss this surface before the parent dialog.</Text></PopoverContent>
            </Popover>
            <DialogClose asChild><Button testID="explicit-close" variant="secondary">Explicit close</Button></DialogClose>
          </DialogContent>
        </Dialog>
        <Text testID="dialog-value" style={labelStyle}>Dialog: {open ? "open" : "closed"}; Interior count: {dialogPresses}</Text>
      </View>
    </ScrollView>
    <View style={{ paddingHorizontal: 24, paddingVertical: 8, borderTopWidth: 1, borderColor: theme.colors.border }}>
      <Button testID="dismiss-keyboard" variant="secondary" onPress={() => Keyboard.dismiss()}>Hide keyboard</Button>
    </View>
  </KeyboardAvoidingView>
  </SafeAreaView>;
}
