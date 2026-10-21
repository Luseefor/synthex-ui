import * as React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
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
import { InputOTP, InputOTPGroup, InputOTPSlot } from "synthex-ui/input-otp";
import { Slider } from "synthex-ui/slider";

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
  const inputRef = React.useRef<React.ElementRef<typeof Input>>(null);
  const labelStyle = { color: theme.colors.foreground, fontSize: 16 };
  const headingStyle = { ...labelStyle, fontSize: 20, fontWeight: "700" as const };
  return <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
    <ScrollView testID="native-contracts" keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 24, paddingTop: 64, gap: 20 }}>
      <Text accessibilityRole="header" style={{ ...headingStyle, fontSize: 26 }}>Synthex native contracts</Text>
      <Text style={labelStyle}>Interactive fixture. Bundle success does not verify device behavior.</Text>
      <OwnedOverlays />

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
  </KeyboardAvoidingView>;
}
