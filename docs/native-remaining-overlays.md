# Native remaining overlays

Scope: `synthex-ui` 2.0, included in the v1.2 milestone. Web implementations retain their existing behavior. Native `ContextMenu`, `HoverCard`, `Tooltip`, and `NavigationMenu` use the shared anchored `Modal` layer (`_shared/overlay.native.tsx` + `_shared/positioning.native.ts`); `Command` stays inline by design. Devices and screen tools are off in this session; no device, VoiceOver, or TalkBack result is claimed.

```tsx
import * as React from "react";
import { Pressable, Text } from "react-native";
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem } from "synthex-ui/context-menu";
import { Tooltip, TooltipTrigger, TooltipContent } from "synthex-ui/tooltip";
import { Command, CommandInput, CommandList, CommandItem } from "synthex-ui/command";

export function Actions() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  return <>
    <ContextMenu open={menuOpen} onOpenChange={setMenuOpen}>
      <ContextMenuTrigger asChild><Pressable><Text>Long press</Text></Pressable></ContextMenuTrigger>
      <ContextMenuContent side="bottom" align="start"><ContextMenuItem>Run</ContextMenuItem></ContextMenuContent>
    </ContextMenu>
    <Tooltip><TooltipTrigger><Text>Help</Text></TooltipTrigger><TooltipContent>Tap toggles this tip.</TooltipContent></Tooltip>
    <Command label="Inline actions"><CommandInput /><CommandList><CommandItem value="profile">Profile</CommandItem></CommandList></Command>
  </>;
}
```

Metro selects native parts through each family's `react-native` condition. They also work as owned copies installed with the CLI. Use `Text` around string children of native triggers/items/links, or use `asChild` with a compatible `Pressable`.

## Shared anchored geometry

Content parts render in `NativeOverlayContent`: a transparent `Modal` (`presentationStyle="overFullScreen"`, `animationType="none"`) with a full-screen outside `Pressable`, a `SafeAreaView`, a `KeyboardAvoidingView` (`padding` on iOS, `height` on Android), and a nested `ScrollView` (`keyboardShouldPersistTaps="handled"`). Dismissal calls `Keyboard.dismiss()` before the family's `onDismiss`. Outside-press dismisses; `Modal` `onRequestClose` (Android Back) dismisses; `onAccessibilityEscape` runs the caller first, then dismisses. `accessibilityViewIsModal` defaults to `true`; focus containment/restoration is not implemented.

Positioning (`resolveNativeOverlayPosition`):

- `side` defaults to `bottom`, `align` to `start`, `sideOffset` to `8`, `alignOffset` to `0`. All four sides are supported; `start`/`end` alignment mirrors under `dir="rtl"` only for `top`/`bottom` placements — the `left`/`right` cross-axis stays physical.
- The surface flips to the opposite side only when the requested side cannot fit the natural main-axis size and the opposite side offers strictly more space. The result is then clamped inside the padded viewport; oversized content shrinks (`maxHeight` on the vertical axis, width bounded by the selected-side space on the horizontal axis).
- Measurement uses the trigger's `measureInWindow` anchor plus the modal root/viewport frame and `useWindowDimensions`. Content is measured on open and on window/root-layout changes only; continuous anchor tracking is not implemented.
- Fallback: a trigger whose ref cannot be measured (no `measureInWindow`), a non-finite measurement, or a rect with both `width` and `height` equal to `0` resolves to a `null` anchor and renders a centered surface instead of an anchored one (a rect with only one zero dimension is still accepted). Custom `asChild` children that do not forward a native ref hit this path and still open a usable surface.
- Coordinate limits: geometry is computed in the modal root's frame (`anchor - origin`); the padded viewport uses an 8pt collision pad with 16pt available-width margins (`viewport.width - 16`). Offscreen anchors, rotation, and nested-Modal stacking are covered only by mocked/pure-geometry tests; real-device behavior is pending.

## ContextMenu: long-press anchored to the trigger

`ContextMenuTrigger` activates on `onLongPress` only; a plain `onPress` does not open the menu (contract test fires both paths). The shared `position` state in `context-menu.shared.tsx` is never set natively; the surface anchors to the trigger frame via `useNativeOverlayTriggerRef`, not to pointer coordinates. Root `modal` is accepted and `void` (always Modal); root `dir` flows through `NativeOverlayProvider`/`NativeDirectionContext`. `ContextMenuContent` honors `side/align/sideOffset/alignOffset` through `NativeOverlayContent`.

`ContextMenuItem` closes the menu after the caller runs unless `disabled` or `event.preventDefault()` cancelled the press. `ContextMenuSub/SubTrigger/SubContent`, `CheckboxItem`, `RadioGroup/RadioItem`, `Shortcut`, and `Arrow` are aliases over the dropdown-menu native implementations: sub content stays inline inside the modal surface (see below), and cancelled/disabled presses never reach state changes.

## HoverCard and Tooltip: tap-toggle, no delays

Both triggers activate on `onPress` toggle only. `HoverCard` `openDelay`/`closeDelay` are accepted into the shared controller but have no timer path natively; `Tooltip` `delayDuration` is `void`. `onPressIn`/`onPressOut`/`onHoverIn`/`onHoverOut`/`onFocus`/`onBlur` callers still run (composed child-first) but never toggle state; `onLongPress` is `undefined` on these triggers only when neither the caller nor the child supplies one — a supplied `onLongPress` observer still composes through, and still never toggles state. There is no press-in or hover takeover and no phantom long-press path. `expanded` reflects the rendered open state.

`HoverCardContent` honors `side/align/sideOffset/alignOffset`. Both families support controlled `open`/`onOpenChange` (controlled requests notify without mutating rendered state) and `dir` via the overlay provider with explicit RTL reaching the surface, trigger style, and nested context.

Tooltip surface split: the public ref stays `React.ElementRef<typeof Text>`, and `style` (`TextStyle`) applies to that inner `Text`. The new `containerStyle` (`ViewStyle`) sizes the modal surface (`testID + "-surface"`, default `minWidth: 160`). Callers that need surface geometry must use `containerStyle`; `style` never affects the surface frame. Its `onAccessibilityEscape` callback is routed through the outer surface, which runs the caller observer, dismisses the keyboard and requests close. The callback is declared explicitly for portability: React Native 0.88 no longer exposes it on `TextProps`.

## NavigationMenu: one anchor per item, vertical orientation, Link behavior

Each `NavigationMenuItem` owns a `NativeOverlayProvider`, so each item's content anchors to its own trigger frame. Content opens when the root controller `value` equals the item `value`; the trigger toggles `active ? "" : item.value`. Externally switching `value` moves the open surface to the newly selected item's anchor (covered with distinct per-trigger frames). Root `orientation` defaults to `horizontal`; `vertical` switches the list to `flexDirection: "column"`. Root `dir` is honored and reaches descendants through `NativeDirectionContext` (physical edge names do not swap). Root `delayDuration`/`skipDelayDuration` are `void`.

`NavigationMenuTrigger` and `NavigationMenuLink` accept `asChild`. `NavigationMenuLink` uses role `link`; its built-in action dismisses the menu (`setValue("")`). Disabled or caller-cancelled (`preventDefault`) Link presses never dismiss: `disabled` keeps the surface open with no handler order recorded; `cancelled` runs child then parent and stops before close; `enabled` runs child, parent, then close. `NavigationMenuViewport` is a compatibility layout container (`gap: 16`) only; each item already owns its anchored `Modal` surface.

## Inline submenus

`DropdownMenuSubContent` (and therefore `ContextMenuSubContent`) is an inline `View` inside the parent modal surface, not a nested `Modal`: `marginTop: 4`, `marginLeft: 16`, `minWidth: 176`, rendered only when the sub controller is open. `SubTrigger` toggles with `expanded` and a submenu hint; disabled or caller-cancelled sub/checkbox/radio presses never change state.

## Command: inline list, real filtering, no dialog loop

Native `Command` has no `CommandDialog` export and never uses the overlay layer: the root is an inline themed `View` (matching web, where `Command` is inline and `CommandDialog` is separate), `CommandList` is a `ScrollView` (`maxHeight: 288`), and there is no desktop keyboard loop (`loop` is `void`). `label` maps to `accessibilityLabel` with explicit caller-label priority. `shouldFilter={false}` renders all items; `CommandEmpty` renders whenever the visible-item count is zero, so it hides while items render but an actually empty command still renders `Empty` (visibility counting still runs). A custom `filter(value, search, keywords?)` selects items by positive score and receives the item `keywords` array when present. `CommandInput` is a `TextInput` row with a search icon; `CommandEmpty` renders only when the visible-item count is zero.

`CommandItem` selection is guarded: `disabled` blocks everything and wins in `accessibilityState`; otherwise the caller's `onPress` runs first and `event.preventDefault()` cancels `onCommandSelect`. `CommandGroup` headings and per-item `textValue`/`keywords` matching follow the shared helpers. No `cmdk` keyboard navigation, scoring, or dialog semantics is claimed.

## Generic action: child-first cancellation, disabled, refs, styles

`NativePressableAction` (used by all four overlay triggers and `NavigationMenuLink`) implements:

- Enabled order is child handler → cancellation check → parent handler → cancellation check → built-in state request. `event.preventDefault()` at either stage stops the built-in action. Caller exceptions propagate.
- Disabled is ORed (`parent.disabled || child.disabled`) and checked before activation and press-in/out callers; hover/focus observers remain available while disabled; the rendered `accessibilityState.disabled` reflects the actual disabled value while other caller keys (e.g. `busy`) are preserved. `expanded` reflects rendered open/active state.
- `asChild` clones the child: `testID` resolves child → parent → default, `accessibilityRole` resolves parent → child → default, and the ref is preserved; parent and child callback styles are evaluated with the same press state with child styles last, plus a `direction` style from context. A custom child must forward the resulting ref, press props, and style to a compatible native host.
- Refs merge React 19 callback cleanups and `void`-callback detach (`ref(null)`), including object refs read via `props.ref`; direction-only updates do not re-fire child cleanup, and unmount clears refs to `null`.

Controlled roots notify (`onOpenChange`/`onValueChange`) without mutating rendered state; interior `Command`/popover-style actions never route through the outside-press backdrop because backdrop and content are siblings.

## Verification and device work

`remaining-overlays.contract.native.test.tsx` drives the four overlay families against mocked native hosts (stubbed `measureInWindow`/`onLayout`, fixed `400x700` window): anchored geometry with forwarded `side/align/offset` props, outside/Back/accessibility-escape dismissal, disabled-before-caller guards with preserved metadata, child-first `asChild` cancellation order, ref/cleanup/style composition, controlled requests, explicit RTL inheritance, public host refs (`Text` for Tooltip, `View` for the others), long-press-only ContextMenu, tap-toggle HoverCard/Tooltip without press-in/hover takeover, per-item NavigationMenu anchoring with vertical orientation, Link/Item guard matrices, submenu alias guards, and the inline Command filter/label/selection matrix. These tests establish callback and prop behavior, not layout, gestures, `Modal` stacking, keyboard behavior, or screen-reader output.

`native:check` installs the local UI and CLI tarballs in an isolated Expo consumer, copies the remaining families plus direction, typechecks packaged declarations and owned implementation bodies under React Native 0.88, and exports iOS and Android bundles. Neither the mocked tests, the typechecks, nor the Metro export is a device run.

Packaged fixture (`fixtures/native-contracts/RemainingOverlays.tsx`, prefix `advanced`): `advanced-direction`, `advanced-disabled`, `advanced-cancel`, `advanced-context-trigger`, `advanced-context-content`, `advanced-context-state`, `advanced-hover-trigger`, `advanced-hover-content`, `advanced-hover-action`, `advanced-tooltip-trigger`, `advanced-tooltip-content`, `advanced-tooltip-state`, `advanced-nav-overview`, `advanced-nav-account`, `advanced-nav-content-overview`, `advanced-nav-content-account`, `advanced-nav-link-overview`, `advanced-nav-link-account`, `advanced-navigation-state`, `advanced-command-input`, `advanced-last-action`. Owned fixture (`fixtures/native-contracts/OwnedRemainingOverlays.tsx`, prefix `owned-advanced`) mirrors the same suffixes: `owned-advanced-direction`, `owned-advanced-disabled`, `owned-advanced-cancel`, `owned-advanced-context-trigger`, `owned-advanced-context-content`, `owned-advanced-context-state`, `owned-advanced-hover-trigger`, `owned-advanced-hover-content`, `owned-advanced-hover-action`, `owned-advanced-tooltip-trigger`, `owned-advanced-tooltip-content`, `owned-advanced-tooltip-state`, `owned-advanced-nav-overview`, `owned-advanced-nav-account`, `owned-advanced-nav-content-overview`, `owned-advanced-nav-content-account`, `owned-advanced-nav-link-overview`, `owned-advanced-nav-link-account`, `owned-advanced-navigation-state`, `owned-advanced-command-input`, `owned-advanced-last-action`. Command items in both fixtures expose no dedicated testID; drive them by visible text with `advanced-command-input` / `owned-advanced-command-input` and read `advanced-last-action` / `owned-advanced-last-action`.

Devices and screen tools are unavailable in this session. Real trigger anchoring, flip/clamp near edges, rotation, nested-Modal stacking, keyboard avoidance/occlusion, long-press timing, tap-toggle feel, large-font layouts, and VoiceOver/TalkBack role/state/labels, focus containment/restoration, and focus after close remain **Pending** in the [device checklist](./native-device-validation.md). No custom focus management is claimed.
