import * as React from "react";
import { Text, View } from "react-native";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "./components/ui/popover";
import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList, ComboboxTrigger, ComboboxValue } from "./components/ui/combobox";
import { DirectionProvider } from "./components/ui/direction/direction.native";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./components/ui/input-otp";
import { Slider } from "./components/ui/slider";

// Copied by native:check next to the CLI's owned sources. These imports must
// compile as source under the consumer's RN types, not just packaged .d.ts.
export default function OwnedOverlays() {
  const [rtl, setRtl] = React.useState(false);
  const [otp, setOtp] = React.useState("");
  const [range, setRange] = React.useState([25, 75]);
  return <View style={{ minHeight: 260 }}>
    <DirectionProvider dir={rtl ? "rtl" : "ltr"}>
      <Text accessibilityRole="header">Owned source overlays</Text>
      <Text onPress={() => setRtl(!rtl)} accessibilityRole="button">Owned direction: {rtl ? "RTL" : "LTR"}</Text>
      <Slider testID="owned-slider" step={5} value={range} onValueChange={setRange} thumbLabels={["Owned lower bound", "Owned upper bound"]} />
      <Text testID="owned-slider-value">Owned range: {range.join(", ")}</Text>
      <InputOTP length={6} value={otp} onValueChange={setOtp}>
        <InputOTPGroup style={{ flexWrap: "wrap" }}>
          {Array.from({ length: 6 }, (_, index) => <InputOTPSlot key={index} index={index} testID={"owned-otp-" + index} />)}
        </InputOTPGroup>
      </InputOTP>
      <Text testID="owned-otp-value">Owned code: {otp || "empty"}</Text>
      <Select>
        <SelectTrigger testID="owned-select-trigger"><SelectValue placeholder="Owned select" /></SelectTrigger>
        <SelectContent><SelectItem value="one">One</SelectItem><SelectItem value="two">Two</SelectItem></SelectContent>
      </Select>
      <DropdownMenu>
        <DropdownMenuTrigger testID="owned-dropdown-trigger"><Text>Owned menu</Text></DropdownMenuTrigger>
        <DropdownMenuContent><DropdownMenuItem>Owned action</DropdownMenuItem></DropdownMenuContent>
      </DropdownMenu>
      <Popover>
        <PopoverTrigger testID="owned-popover-trigger"><Text>Owned popover</Text></PopoverTrigger>
        <PopoverContent><Text>Owned surface</Text></PopoverContent>
      </Popover>
      <Combobox>
        <ComboboxTrigger testID="owned-combobox-trigger"><ComboboxValue /></ComboboxTrigger>
        <ComboboxContent><ComboboxInput /><ComboboxList><ComboboxItem value="one">One</ComboboxItem></ComboboxList></ComboboxContent>
      </Combobox>
    </DirectionProvider>
  </View>;
}
