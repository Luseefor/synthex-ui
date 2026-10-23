import * as React from "react";
import { Pressable, Text, View } from "react-native";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "./components/ui/popover";
import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList, ComboboxTrigger, ComboboxValue } from "./components/ui/combobox";
import { DirectionProvider } from "./components/ui/direction/direction.native";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./components/ui/input-otp";
import { Slider } from "./components/ui/slider";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "./components/ui/resizable";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type NativeCarouselApi } from "./components/ui/carousel";

import { Sheet, SheetTrigger, SheetContent, SheetClose } from "./components/ui/sheet";
import { Drawer, DrawerTrigger, DrawerContent, DrawerClose } from "./components/ui/drawer";
// Copied by native:check next to the CLI's owned sources. These imports must
// compile as source under the consumer's RN types, not just packaged .d.ts.

const triggerStyle = {
  minHeight: 44,
  paddingHorizontal: 12,
  paddingVertical: 12,
  borderWidth: 1,
  borderColor: "#71717a",
  borderRadius: 8,
  backgroundColor: "#f4f4f5",
  justifyContent: "center" as const,
};
const triggerTextStyle = { color: "#18181b", fontSize: 14, fontWeight: "600" as const };
const titleStyle = { fontSize: 18, fontWeight: "700" as const };
const sectionStyle = { fontSize: 16, fontWeight: "700" as const };
const helpStyle = { fontSize: 12, opacity: 0.65 };
const cardStyle = {
  flex: 1,
  padding: 12,
  backgroundColor: "#f4f4f5",
  borderRadius: 8,
  borderWidth: 1,
  borderColor: "#d4d4d8",
  justifyContent: "center" as const,
  alignItems: "center" as const,
};
const cardTitleStyle = { color: "#18181b", fontSize: 14, fontWeight: "600" as const, textAlign: "center" as const };
const cardHelpStyle = { color: "#52525b", fontSize: 12, textAlign: "center" as const };
const panelStyle = {
  backgroundColor: "#f4f4f5",
  borderWidth: 1,
  borderColor: "#d4d4d8",
  borderRadius: 8,
  padding: 12,
  justifyContent: "center" as const,
  alignItems: "center" as const,
};
const panelTextStyle = { color: "#18181b", fontSize: 14, fontWeight: "600" as const };

export default function OwnedOverlays() {
  const [rtl, setRtl] = React.useState(false);
  const [otp, setOtp] = React.useState("");
  const [range, setRange] = React.useState([25, 75]);
  const [sizes, setSizes] = React.useState([50, 50]);
  const [carouselApi, setCarouselApi] = React.useState<NativeCarouselApi>();
  const [carouselIndex, setCarouselIndex] = React.useState(0);
  React.useEffect(() => {
    if (!carouselApi) return;
    const sync = () => setCarouselIndex(carouselApi.selectedScrollSnap());
    sync();
    carouselApi.on("select", sync).on("reInit", sync);
    return () => { carouselApi.off("select", sync); carouselApi.off("reInit", sync); };
  }, [carouselApi]);
  return <View style={{ minHeight: 260, gap: 16, paddingVertical: 12 }}>
    <DirectionProvider dir={rtl ? "rtl" : "ltr"}>
      <View style={{ gap: 16 }}>
      <View style={{ gap: 8 }}>
        <Text accessibilityRole="header" style={titleStyle}>Owned source overlays</Text>
        <Text style={helpStyle}>Same contracts as the packaged fixture, backed by CLI-copied sources.</Text>
        <Pressable accessibilityRole="button" onPress={() => setRtl(!rtl)} style={triggerStyle}>
          <Text style={triggerTextStyle}>Owned direction: {rtl ? "RTL" : "LTR"}</Text>
        </Pressable>
      </View>
      <View style={{ gap: 8 }}>
        <Text accessibilityRole="header" style={sectionStyle}>Owned sheets and drawers</Text>
        <Sheet>
          <SheetTrigger testID="owned-sheet-trigger" style={triggerStyle}><Text style={triggerTextStyle}>Owned sheet</Text></SheetTrigger>
          <SheetContent testID="owned-sheet-content" side="left" dismissible={false}>
            <Text>Owned left sheet; ambient dismissal blocked</Text>
            <SheetClose testID="owned-sheet-close" style={triggerStyle}><Text style={triggerTextStyle}>Close owned sheet</Text></SheetClose>
          </SheetContent>
        </Sheet>
        <Drawer direction="right" dismissible={false}>
          <DrawerTrigger testID="owned-drawer-trigger" style={triggerStyle}><Text style={triggerTextStyle}>Owned drawer</Text></DrawerTrigger>
          <DrawerContent testID="owned-drawer-content">
            <Text>Owned right drawer; root dismissal blocked</Text>
            <DrawerClose testID="owned-drawer-close" style={triggerStyle}><Text style={triggerTextStyle}>Close owned drawer</Text></DrawerClose>
          </DrawerContent>
        </Drawer>
      </View>
      <View style={{ gap: 8 }}>
        <Text accessibilityRole="header" style={sectionStyle}>Owned carousel</Text>
        <Text style={helpStyle}>Swipe horizontally or use the arrows below.</Text>
        <Carousel testID="owned-carousel" setApi={setCarouselApi}>
          <CarouselContent testID="owned-carousel-content" style={{ height: 120 }}>
            {[1, 2, 3].map(number => <CarouselItem key={number} style={cardStyle}>
              <Text style={cardTitleStyle}>Owned slide {number} of 3</Text>
              <Text style={cardHelpStyle}>Swipe or use arrows</Text>
            </CarouselItem>)}
          </CarouselContent>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <CarouselPrevious testID="owned-carousel-prev" />
            <CarouselNext testID="owned-carousel-next" />
          </View>
        </Carousel>
        <Text testID="owned-carousel-index" style={helpStyle}>Owned carousel index: {carouselIndex}</Text>
      </View>
      <View style={{ gap: 8 }}>
        <Text accessibilityRole="header" style={sectionStyle}>Owned resizable panels</Text>
        <ResizablePanelGroup testID="owned-resizable" direction="horizontal" sizes={sizes} onSizesChange={setSizes} style={{ minHeight: 128, height: 128 }}>
          <ResizablePanel minSize={15} maxSize={85} style={panelStyle}><Text style={panelTextStyle}>Owned first panel</Text></ResizablePanel>
          <ResizableHandle testID="owned-resizable-handle-0" accessibilityLabel="Resize owned panels" />
          <ResizablePanel minSize={15} maxSize={85} style={panelStyle}><Text style={panelTextStyle}>Owned second panel</Text></ResizablePanel>
        </ResizablePanelGroup>
        <Text testID="owned-resizable-sizes" style={helpStyle}>Owned sizes: {sizes.map(n => n.toFixed(1)).join(", ")}</Text>
      </View>
      <View style={{ gap: 8 }}>
        <Text accessibilityRole="header" style={sectionStyle}>Owned slider and code</Text>
        <Slider testID="owned-slider" step={5} value={range} onValueChange={setRange} thumbLabels={["Owned lower bound", "Owned upper bound"]} />
        <Text testID="owned-slider-value" style={helpStyle}>Owned range: {range.join(", ")}</Text>
        <InputOTP length={6} value={otp} onValueChange={setOtp}>
          <InputOTPGroup style={{ flexWrap: "wrap", gap: 6, rowGap: 8 }}>
            {Array.from({ length: 6 }, (_, index) => <InputOTPSlot key={index} index={index} testID={"owned-otp-" + index} />)}
          </InputOTPGroup>
        </InputOTP>
        <Text testID="owned-otp-value" style={helpStyle}>Owned code: {otp || "empty"}</Text>
      </View>
      <View style={{ gap: 8 }}>
        <Text accessibilityRole="header" style={sectionStyle}>Owned anchored inputs</Text>
        <Select>
          <SelectTrigger testID="owned-select-trigger"><SelectValue placeholder="Owned select" /></SelectTrigger>
          <SelectContent><SelectItem value="one">One</SelectItem><SelectItem value="two">Two</SelectItem></SelectContent>
        </Select>
        <DropdownMenu>
          <DropdownMenuTrigger testID="owned-dropdown-trigger" style={triggerStyle}><Text style={triggerTextStyle}>Owned menu</Text></DropdownMenuTrigger>
          <DropdownMenuContent><DropdownMenuItem>Owned action</DropdownMenuItem></DropdownMenuContent>
        </DropdownMenu>
        <Popover>
          <PopoverTrigger testID="owned-popover-trigger" style={triggerStyle}><Text style={triggerTextStyle}>Owned popover</Text></PopoverTrigger>
          <PopoverContent><Text>Owned surface</Text></PopoverContent>
        </Popover>
        <Combobox>
          <ComboboxTrigger testID="owned-combobox-trigger"><ComboboxValue /></ComboboxTrigger>
          <ComboboxContent><ComboboxInput /><ComboboxList><ComboboxItem value="one">One</ComboboxItem></ComboboxList></ComboboxContent>
        </Combobox>
      </View>
      </View>
    </DirectionProvider>
  </View>;
}
