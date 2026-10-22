import * as React from "react";
import { Pressable, Text, View } from "react-native";
import { DirectionProvider } from "./components/ui/direction/direction.native";
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuCheckboxItem,
  ContextMenuRadioGroup, ContextMenuRadioItem, ContextMenuSub, ContextMenuSubTrigger, ContextMenuSubContent } from "./components/ui/context-menu";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "./components/ui/hover-card";
import { Tooltip, TooltipTrigger, TooltipContent } from "./components/ui/tooltip";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink, NavigationMenuViewport } from "./components/ui/navigation-menu";
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from "./components/ui/command";

const prefix = "owned-advanced";
const buttonStyle = { minHeight: 44, padding: 12, borderWidth: 1, borderColor: "#71717a", borderRadius: 8 };
export default function OwnedRemainingOverlays() {
  const [rtl, setRtl] = React.useState(false), [disabled, setDisabled] = React.useState(false);
  const [cancel, setCancel] = React.useState(false), [checked, setChecked] = React.useState(false);
  const [navigation, setNavigation] = React.useState(""), [query, setQuery] = React.useState("");
  const [lastAction, setLastAction] = React.useState("none"), [menuOpen, setMenuOpen] = React.useState(false);
  const [tooltipOpen, setTooltipOpen] = React.useState(false);
  return <DirectionProvider dir={rtl ? "rtl" : "ltr"}>
    <View style={{ gap: 12, paddingVertical: 12 }}>
      <Text accessibilityRole="header">{prefix}: anchored native surfaces</Text>
      <Pressable testID={prefix + "-direction"} accessibilityRole="button" onPress={() => setRtl(!rtl)} style={buttonStyle}><Text>Direction: {rtl ? "RTL" : "LTR"}</Text></Pressable>
      <Pressable testID={prefix + "-disabled"} accessibilityRole="button" onPress={() => setDisabled(!disabled)} style={buttonStyle}><Text>Actions: {disabled ? "disabled" : "enabled"}</Text></Pressable>
      <Pressable testID={prefix + "-cancel"} accessibilityRole="button" onPress={() => setCancel(!cancel)} style={buttonStyle}><Text>Cancel activation: {cancel ? "on" : "off"}</Text></Pressable>
      <ContextMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <ContextMenuTrigger asChild disabled={disabled}>
          <Pressable testID={prefix + "-context-trigger"} style={buttonStyle} onLongPress={e => { if (cancel) e.preventDefault(); }}><Text>Long press for actions</Text></Pressable>
        </ContextMenuTrigger>
        <ContextMenuContent testID={prefix + "-context-content"} side="bottom" align="start" style={{ width: 280 }}>
          <ContextMenuItem disabled={disabled} onPress={e => { if (cancel) e.preventDefault(); else setLastAction("context action"); }}>Run action</ContextMenuItem>
          <ContextMenuCheckboxItem checked={checked} onCheckedChange={setChecked} disabled={disabled}>Checked: {checked ? "yes" : "no"}</ContextMenuCheckboxItem>
          <ContextMenuRadioGroup defaultValue="one"><ContextMenuRadioItem value="one">One</ContextMenuRadioItem><ContextMenuRadioItem value="two">Two</ContextMenuRadioItem></ContextMenuRadioGroup>
          <ContextMenuSub><ContextMenuSubTrigger>More</ContextMenuSubTrigger><ContextMenuSubContent><ContextMenuItem onPress={() => setLastAction("nested action")}>Nested action</ContextMenuItem></ContextMenuSubContent></ContextMenuSub>
        </ContextMenuContent>
      </ContextMenu>
      <Text testID={prefix + "-context-state"}>Context menu: {menuOpen ? "open" : "closed"}</Text>
      <HoverCard>
        <HoverCardTrigger asChild disabled={disabled}><Pressable testID={prefix + "-hover-trigger"} style={buttonStyle} onPress={e => { if (cancel) e.preventDefault(); }}><Text>Tap for profile details</Text></Pressable></HoverCardTrigger>
        <HoverCardContent testID={prefix + "-hover-content"} side="right" align="center" style={{ width: 240 }}>
          <Text>Interactive profile details stay open until dismissed.</Text>
          <Pressable testID={prefix + "-hover-action"} accessibilityRole="button" onPress={() => setLastAction("profile action")} style={buttonStyle}><Text>Profile action</Text></Pressable>
        </HoverCardContent>
      </HoverCard>
      <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
        <TooltipTrigger asChild disabled={disabled}><Pressable testID={prefix + "-tooltip-trigger"} style={buttonStyle} onPress={e => { if (cancel) e.preventDefault(); }}><Text>Tap for help</Text></Pressable></TooltipTrigger>
        <TooltipContent testID={prefix + "-tooltip-content"} side="top" align="center" containerStyle={{ width: 240 }}>Native help is tap-toggle; outside press or Back closes it.</TooltipContent>
      </Tooltip>
      <Text testID={prefix + "-tooltip-state"}>Tooltip: {tooltipOpen ? "open" : "closed"}</Text>
      <NavigationMenu value={navigation} onValueChange={setNavigation} orientation={rtl ? "vertical" : "horizontal"}>
        <NavigationMenuList>{["overview", "account"].map(value => <NavigationMenuItem key={value} value={value}>
          <NavigationMenuTrigger asChild disabled={disabled}><Pressable testID={prefix + "-nav-" + value} style={buttonStyle} onPress={e => { if (cancel) e.preventDefault(); }}><Text>{value}</Text></Pressable></NavigationMenuTrigger>
          <NavigationMenuContent testID={prefix + "-nav-content-" + value} side="bottom" align="start" style={{ width: 240 }}>
            <Text>{value} is anchored to its own trigger.</Text>
            <NavigationMenuLink asChild disabled={disabled} onPress={e => { if (cancel) e.preventDefault(); }}><Pressable testID={prefix + "-nav-link-" + value} style={buttonStyle} onPress={() => setLastAction(value)}><Text>Choose {value}</Text></Pressable></NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>)}</NavigationMenuList>
        <NavigationMenuViewport />
      </NavigationMenu>
      <Text testID={prefix + "-navigation-state"}>Navigation: {navigation || "closed"}</Text>
      <Command query={query} onQueryChange={setQuery} label="Inline actions">
        <CommandInput testID={prefix + "-command-input"} placeholder="Search inline commands" />
        <CommandList><CommandEmpty>No matching actions</CommandEmpty>
          <CommandItem value="profile" disabled={disabled} onCommandSelect={setLastAction} onPress={e => { if (cancel) e.preventDefault(); }}>Profile</CommandItem>
          <CommandItem value="settings" disabled={disabled} onCommandSelect={setLastAction}>Settings</CommandItem>
        </CommandList>
      </Command>
      <Text testID={prefix + "-last-action"}>Last action: {lastAction}</Text>
    </View>
  </DirectionProvider>;
}
