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
import { ThemeProvider, useTheme } from "synthex-ui/theme";
import { BarChart } from "synthex-ui/native";

export default function App() {
  const [dark, setDark] = React.useState(false);
  return <ThemeProvider mode={dark ? "dark" : "light"}>
    <Contracts dark={dark} setDark={setDark} />
  </ThemeProvider>;
}

function Contracts({ dark, setDark }: { dark: boolean; setDark: (value: boolean) => void }) {
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
  const inputRef = React.useRef<React.ElementRef<typeof Input>>(null);
  const labelStyle = { color: theme.colors.foreground, fontSize: 16 };
  const headingStyle = { ...labelStyle, fontSize: 20, fontWeight: "700" as const };
  return <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
    <ScrollView testID="native-contracts" keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 24, paddingTop: 64, gap: 20 }}>
      <Text accessibilityRole="header" style={{ ...headingStyle, fontSize: 26 }}>Synthex native contracts</Text>
      <Text style={labelStyle}>Interactive fixture. Bundle success does not verify device behavior.</Text>

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
        <Text accessibilityRole="header" style={headingStyle}>Inline select and tabs</Text>
        <Select value={fruit} onValueChange={setFruit}>
          <SelectTrigger testID="fruit-trigger" accessibilityLabel="Fruit"><SelectValue /></SelectTrigger>
          <SelectContent>
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
            <DialogClose asChild><Button testID="explicit-close" variant="secondary">Explicit close</Button></DialogClose>
          </DialogContent>
        </Dialog>
        <Text testID="dialog-value" style={labelStyle}>Dialog: {open ? "open" : "closed"}; Interior count: {dialogPresses}</Text>
      </View>
    </ScrollView>
  </KeyboardAvoidingView>;
}
