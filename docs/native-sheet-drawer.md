# Native Sheet and Drawer

Scope: `synthex-ui` 2.0, included in the v1.2 milestone. Web implementations retain their existing behavior. Native uses React Native `Modal`; swipe-to-close, snap points and custom focus containment/restoration are not implemented.

```tsx
import * as React from "react";
import { Text } from "react-native";
import { Button } from "synthex-ui/button";
import { Drawer, DrawerTrigger, DrawerContent, DrawerClose } from "synthex-ui/drawer";

export function Settings() {
  const [open, setOpen] = React.useState(false);
  return <Drawer open={open} onOpenChange={setOpen} direction="left" dismissible={false}>
    <DrawerTrigger asChild><Button>Open settings</Button></DrawerTrigger>
    <DrawerContent closeLabel="Close settings">
      <Text>Settings</Text>
      <DrawerClose asChild><Button>Done</Button></DrawerClose>
    </DrawerContent>
  </Drawer>;
}
```

Metro selects native parts through `synthex-ui/sheet` and `synthex-ui/drawer`. They also work as owned copies installed with the CLI. Use `Text` around text children of native trigger/close parts, or use `asChild` with a compatible `Pressable`/Button.

## State and placement

Both roots accept `open`/`onOpenChange` for controlled state or `defaultOpen` for uncontrolled state. Controlled requests notify the caller without changing the rendered `open` value.

- Sheet content `side` defaults to `right`; content `dismissible` defaults to `true`.
- Drawer root `direction` defaults to `bottom`, and root `dismissible` defaults to `true`. Content `side` and `dismissible`, when supplied, override those root settings. Changes take effect while mounted.
- All four physical edges (`top`, `right`, `bottom`, `left`) are supported. Left/right panels stretch vertically with a default maximum width of 420 layout points; top/bottom panels span the viewport width with bounded natural height. Content `style` can customize dimensions and decoration.
- Both roots accept native `dir="ltr" | "rtl"`, defaulting to the inherited native direction context. This direction reaches descendants and content, including through the Modal. The close icon moves to the left in RTL. Physical `left`/`right` edge names do not swap.

The root `modal` prop remains accepted for compatibility but does not enable non-modal presentation: native always uses `Modal`. Drawer’s handle is decorative; its orientation follows the panel edge. No drag or slide animation contract is implied by `direction`.

## Trigger and close contracts

Disabled actions return before invoking callers or changing state. With `asChild`, parent and child `disabled` values are ORed. Accessibility metadata is merged from child and parent; the actual disabled state wins, and a trigger's `expanded` value reflects the rendered open state.

Enabled `asChild` press order is child handler → cancellation check → parent handler → cancellation check → state request. For a normal trigger/close, the caller runs before the cancellation check and state request. Call `event.preventDefault()` to prevent the built-in action. Caller exceptions propagate normally.

`asChild` preserves both refs, including React 19 callback cleanups, callbacks that expect `null` on detach, and object refs. It reads refs through `props.ref`. Parent and child Pressable callback styles are evaluated with the same press state; child styles merge last. A custom child must forward the resulting ref, press props, and style to a compatible native host.

## Ambient dismissal and explicit close

`dismissible={false}` blocks backdrop presses, system close requests and accessibility escape from changing state. Explicit close parts and the built-in close icon still close the surface, so a non-dismissible panel retains an exit path.

Content accepts:

| Prop | Behavior |
|---|---|
| `hideClose` | Hides the built-in close icon; default `false`. Provide your own close action if needed. |
| `closeLabel` | Accessible label; defaults to `Close sheet` or `Close drawer`. |
| `modalProps` | Native Modal options/observers excluding `children`, `transparent`, and `visible`. |
| `onAccessibilityEscape` | Caller runs first, followed by dismissal if allowed. |

`modalProps.onRequestClose` runs first; `event.preventDefault()` cancels the built-in dismissal. Otherwise dismissal follows the effective `dismissible` setting. Other Modal observers, including `onShow` and `onDismiss`, are forwarded. Caller `animationType` is preserved, defaulting to `fade`. Runtime prop spreading cannot replace internal visibility, transparency, or request-close composition.

Backdrop and content are siblings rather than nested Pressables, so an interior press does not bubble through the backdrop. Content refs resolve to the actual panel `View`. `accessibilityViewIsModal` defaults to `true`; actual screen-reader focus and announcements require device testing. Native does not automatically associate title/description parts with the panel or implement keyboard avoidance.

## Verification and device work

`modal-actions.contract.native.test.tsx` tests both public families against mocked native hosts: disabled/cancelled presses, controlled state, child handler/style/ref composition, dismissal routes, root configuration, physical sides, RTL and mounted updates. These tests establish callback and prop behavior, not platform hit-testing or screen-reader output.

`native:check` installs local UI and CLI tarballs in an isolated Expo consumer, copies both families, typechecks packaged declarations and owned implementation bodies under React Native 0.88, and exports iOS and Android bundles. The development workspace uses React Native 0.81. Neither build is a device run.

Packaged fixture controls: `sheet-trigger`, `sheet-content`, `sheet-explicit-close`, `sheet-disable-trigger`, `sheet-dismiss-toggle`, `sheet-side-cycle`, `sheet-request-count`; corresponding Drawer IDs use `drawer-direction-cycle`. Owned fixture IDs: `owned-sheet-trigger`, `owned-sheet-content`, `owned-sheet-close`, `owned-drawer-trigger`, `owned-drawer-content`, `owned-drawer-close`.

Devices and screen tools are unavailable in this session. Real backdrop/interior hit-testing, Android Back, RTL edge coordinates, rotation, nested Modals, keyboard occlusion, VoiceOver and TalkBack remain **Pending** in the [device checklist](./native-device-validation.md).
