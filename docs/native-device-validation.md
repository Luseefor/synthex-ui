# Native device validation

Scope: branch `ace/native-remaining-overlays`, stacked on OPEN PR #130 (`ace/native-sheet-drawer`),
unreleased source in this checkout. The source tests use
mocked React Native hosts plus pure geometry tests. The `native:check` gate installs
the packed UI in an isolated Expo app, typechecks its native subpath imports
(including `synthex-ui/input-otp` via its `react-native` condition),
adds owned overlays and owned OTP using the packed CLI, compiles their implementation files
against the consumer's React Native types, checks forwarded ref declarations,
and exports iOS and Android bundles.
No step runs a native app.
The generated type-only consumer also checks every exported native forwarded
component's packed ref declaration against its host instance type under the
Expo starter's React Native types.

Full OTP contract in [native OTP](./native-otp.md). Full slider contract in [native slider](./native-slider.md). Full resizable contract in [native resizable](./native-resizable.md). Full carousel contract in [native carousel](./native-carousel.md). Sheet/Drawer contracts in [native Sheet/Drawer](./native-sheet-drawer.md).

## Reproduce the fixture

From the repository root:

```sh
bun --filter synthex-ui build
bun --filter '@luseefor/synthex-cli' build
bun run native:check
```

To keep the installed fixture for manual testing:

```sh
node scripts/native-check.mjs --keep
# The command prints the app directory.
cd <printed-app-directory>
npm start
```

The fixture sources are [App.tsx](../fixtures/native-contracts/App.tsx) and
[OwnedOverlays.tsx](../fixtures/native-contracts/OwnedOverlays.tsx); dependencies
come from the Expo starter, with only the scratch app's `synthex-ui` dependency
replaced by a local tarball. The checkout's dependency files are not changed.
The copied-overlay fixture imports the generated local component barrels. This
checks implementation APIs under RN 0.88 as well as the package's ref declarations.
Without `--keep`, the scratch directory is removed on success or failure.
With `--keep`, remove the printed scratch directory after review.

Use an appropriate Expo client or development build on each target. Record the
OS, device, app commit, Expo/React Native versions, screen-reader settings,
and results below. An exported bundle is not an installable app or a device pass.
See the [Expo CLI guide](https://docs.expo.dev/more/expo-cli/).

## Device checks

All entries are **pending on both iOS and Android**. Devices and screen tools are off
in this session (device and computer-use groups disabled); no VoiceOver/TalkBack result is claimed.
Mocked-host tests, typechecks, and Metro export verify wiring and bundle generation — none of them
is device validation. Native accessibility props describe intended state; actual announcements and
focus behavior require testing. See [React Native accessibility](https://reactnative.dev/docs/accessibility).

| Check | Fixture IDs / action | Expected behavior | iOS | Android |
| --- | --- | --- | --- | --- |
| Action and disabled state | `count-button`, `disabled-button`, `count-value` | Normal press increments once; disabled press changes nothing and announces disabled | Pending | Pending |
| Input ref and editing | `focus-input`, `name-input`, `readonly-input`, `notes-input` | Ref focuses Name; typed text updates summary; read-only stays unchanged; Notes supports multiple lines | Pending | Pending |
| Checkbox states | `controlled-checkbox`, `mixed-checkbox`, `disabled-checkbox` | Announce label and checked/mixed/disabled state; enabled toggles; disabled stays unchanged | Pending | Pending |
| Switch state | `controlled-switch`, `disabled-switch` | Enabled toggles and announces state; disabled stays unchanged | Pending | Pending |
| Select interaction | `fruit-trigger`, `fruit-content`, `fruit-apple`, `fruit-banana`, `fruit-disabled`, `disabled-select`, `fruit-value` | Banana updates summary and closes; disabled controls do not activate; anchored content does not shift layout; record clipping near edges | Pending | Pending |
| Dropdown interaction | `dropdown-trigger`, `dropdown-content`, `dropdown-action`, `dropdown-cancel`, `dropdown-value` | Action updates summary and closes; cancelled press keeps menu open without updating; anchored content does not shift layout | Pending | Pending |
| Dropdown outside/back dismissal | `dropdown-content-overlay`, `dropdown-content-modal`, Android Back | Outside press and Android Back dismiss without updating the summary; interior taps do not dismiss | Pending | Pending |
| Popover interaction | `popover-trigger`, `popover-content`, `popover-input`, `popover-interior`, `popover-value` | Interior action updates summary without closing; input stays editable; anchored content does not shift layout | Pending | Pending |
| Popover outside/back dismissal | `popover-content-overlay`, `popover-content-modal`, Android Back | Outside press and Android Back dismiss; interior taps do not dismiss | Pending | Pending |
| Combobox interaction | `combobox-trigger`, `combobox-content`, `combobox-search`, `combobox-apple`, `combobox-banana`, `combobox-disabled`, `combobox-value` | Apple/Banana update summary and close; disabled item does not activate; search filters without closing | Pending | Pending |
| Combobox keyboard search first tap | Type in `combobox-search`, then tap a matching item while the keyboard is open | First item tap selects and closes rather than only hiding the keyboard; record keyboard-avoidance shrink and ScrollView scrolling of tall results | Pending | Pending |
| Combobox outside/back dismissal | `combobox-content-overlay`, `combobox-content-modal`, Android Back | Outside press and Android Back dismiss; interior taps do not dismiss | Pending | Pending |
| RTL overlay direction | `overlay-direction` flips the global `DirectionProvider`; re-run Select/Dropdown/Popover/Combobox checks | `start`/`end` alignment mirrors under RTL for top/bottom placements; record any trigger/content mismatch | Pending | Pending |
| Edge anchoring and rotation | `edge-trigger`, `edge-content` near a screen edge; rotate with content open | Content flips to the side with more room and clamps/shrinks inside the viewport; rotation re-anchors without clipping | Pending | Pending |
| Nested Modal | `nested-popover-trigger`, `nested-popover-content` inside the controlled dialog | Record stacking, backdrop routing, Back behavior, and any unmount warnings; nested-Modal support is not claimed | Pending | Pending |
| Tabs and handler composition | `tab-two`, `tab-disabled`, `tab-value` | Two selects its panel and increments handler count once; disabled tab does neither | Pending | Pending |
| OTP typing and focus | `otp-slot-0..5`, `otp-value`, `otp-ref-focus` | Type in each slot auto-advances; ref button focuses slot `0`; `otp-value` shows the contiguous code; labels announce `Code character N of 6` | Pending | Pending |
| OTP paste via OS menu | Paste into `otp-slot-0..5` using the OS context menu; check `otp-value` | Partial paste overwrites from the focused index with no gaps; full-code paste replaces from `0`; Unicode codepoints count as one | Pending | Pending |
| OTP backspace order | `otp-slot-0..5`, `otp-value` | Backspace removes one character with suffix shift and focuses previous; empty-cell Backspace removes the previous filled character once; no double-delete from paired events | Pending | Pending |
| OTP autofill platforms | `otp-slot-0..5`, iOS vs Android autofill | Record SMS/keyboard autofill differences; `one-time-code` / `oneTimeCode` are hints only, no automatic SMS retrieval is claimed | Pending | Pending |
| OTP scaling and unicode | `otp-slot-0..5`, OS large font setting; `theme-toggle` | Slots stay legible and tappable under large fonts; multi-code-unit characters count as one codepoint | Pending | Pending |
| OTP controlled and disable | `otp-fill`, `otp-clear`, `otp-disabled-toggle`, `otp-value` | Fill sets `123456`, clear empties; disabled toggle blocks edits without changing `otp-value` | Pending | Pending |
| Owned OTP | `owned-otp-0..5`, `owned-otp-value` | Owned slots mirror packaged behavior for typing, focus, and controlled value | Pending | Pending |
| Slider tap, drag, and commit | `slider-single`, `slider-single-value`, `slider-single-commit`, thumbs `<root>-thumb-<i>` | Tap jumps nearest thumb; drag past 4pt follows axis; release commits once when changed | Pending | Pending |
| Slider drag beyond track and in ScrollView | Drag `slider-single` beyond track ends; drag each slider inside a `ScrollView` | Clamps to `min`/`max`/neighbor without switching thumbs; scroll negotiation recorded per gesture | Pending | Pending |
| Slider RTL, vertical, and inverted | `slider-vertical`, `slider-vertical-value`, `slider-inverted-toggle`, global direction flip | RTL mirrors horizontal axis; vertical keeps `min` at bottom; `inverted` flips; record mismatches | Pending | Pending |
| Slider range overlap and thumb identity | `slider-range`, `slider-range-value`, `slider-range-commit` | Press-time nearest thumb stays active; thumbs clamp without crossing; overlap keeps identity | Pending | Pending |
| Slider labels, actions, scaling, and disable | `slider-range` with `thumbLabels`, OS large font, `slider-disabled-toggle` | Thumbs expose own value plus global `min`/`max`; step actions do not cross; disabled blocks edits; large fonts stay usable | Pending | Pending |
| Slider ref and controlled value | Ref on `slider-single`; controlled `value` updates | Ref resolves; controlled renders props with no optimistic value; cancel/config change clears without commit | Pending | Pending |
| Owned slider | `owned-slider`, `owned-slider-value` | Owned copy mirrors packaged tap/drag/value behavior | Pending | Pending |
| Resizable drag and commit | `resizable-horizontal`, `resizable-horizontal-sizes`, `resizable-horizontal-commit`, handles `resizable-horizontal-handle-0` | Drag past 4pt resizes the handle pair with the pair total conserved; release commits once when changed | Pending | Pending |
| Resizable drag beyond pair and in ScrollView | Drag `resizable-horizontal` beyond pair bounds; drag each group inside a `ScrollView` | Clamps to feasible `minSize`/`maxSize` without moving other panels; scroll negotiation recorded per gesture | Pending | Pending |
| Resizable RTL and vertical | `resizable-vertical`, `resizable-vertical-sizes`, `resizable-vertical-commit`, global direction flip | RTL mirrors horizontal axis; vertical stays physical; record mismatches | Pending | Pending |
| Resizable labels, actions, scaling, and disable | `resizable-horizontal` with custom labels, OS large font, `resizable-disabled-toggle` | Handles expose leading-panel value plus feasible pair bounds; step actions stay in bounds; disabled blocks edits; large fonts stay usable | Pending | Pending |
| Resizable ref and controlled sizes | Ref on `resizable-horizontal`; controlled `sizes` updates | Ref resolves; controlled renders props with no optimistic size; cancel/config change clears without commit | Pending | Pending |
| Owned resizable | `owned-resizable`, `owned-resizable-sizes`, `owned-resizable-handle-0` | Owned copy mirrors packaged drag/size behavior | Pending | Pending |
| Carousel paging and buttons | `carousel-horizontal`, `carousel-horizontal-content`, `carousel-horizontal-prev`, `carousel-horizontal-next`, `carousel-horizontal-index` | Button press and `ScrollView` paging advance one full-page slide; index label updates; endpoint guards hold | Pending | Pending |
| Carousel count shrink and disable | `carousel-remove-slide`, `carousel-disabled-toggle`, `carousel-horizontal-index` | Removing a slide clamps into the remaining valid range; an empty list shows no page; disabled toggle blocks pager and button input | Pending | Pending |
| Carousel RTL and vertical | `carousel-vertical`, `carousel-vertical-content`, `carousel-vertical-prev`, `carousel-vertical-next`, `carousel-vertical-index` (extent `height: 240`), global direction flip | RTL reverses horizontal physical order with positive LTR scroll coordinate; vertical stays physical; record mismatches | Pending | Pending |
| Carousel ref and controlled index | Ref on `carousel-horizontal-content`; controlled `index` updates | Ref resolves; controlled renders props with no optimistic index; rejected requests realign; count changes emit `reInit` without `onIndexChange` | Pending | Pending |
| Owned carousel | `owned-carousel`, `owned-carousel-content`, `owned-carousel-prev`, `owned-carousel-next`, `owned-carousel-index` | Owned copy mirrors packaged paging, button, direction, and API behavior | Pending | Pending |
| Sheet controlled/disabled/cancelled actions | `sheet-trigger`, `sheet-disable-trigger`, `sheet-content`, `sheet-explicit-close` | Disabled trigger blocks caller/state changes; controlled open follows props; explicit close works with ambient dismissal off | Pending | Pending |
| Sheet dismissal and interior hit-testing | `sheet-dismiss-toggle`, `sheet-request-count`, `sheet-overlay`, `sheet-close` | Backdrop/Android Back/accessibility escape follow setting; request observer still runs; interior interactions never dismiss via backdrop; close action labeled | Pending | Pending |
| Sheet edges and RTL | `sheet-side-cycle`, global direction flip | All four physical edges, border and close-icon placement; rotation and nested Modal layout remain usable | Pending | Pending |
| Drawer root configuration | `drawer-direction-cycle`, `drawer-dismiss-toggle`, `drawer-trigger`, `drawer-content` | Root direction and dismissible setting take effect; left/right stay physical under RTL; handle is decorative | Pending | Pending |
| Drawer dismissal/disabled/refs | `drawer-disable-trigger`, `drawer-explicit-close`, `drawer-request-count`, `drawer-overlay`, `drawer-close` | Disabled guard, correct refs/cleanup, composed Back callback, interior hit-testing and explicit exit when ambient dismissal off | Pending | Pending |
| Owned Sheet/Drawer | `owned-sheet-trigger/content/close`, `owned-drawer-trigger/content/close` | Owned left Sheet/right Drawer match packaged handlers, direction and blocked ambient dismissal; explicit close works | Pending | Pending |
| Remaining overlay toggles | `advanced-direction`, `advanced-disabled`, `advanced-cancel` (owned: `owned-advanced-direction`, `owned-advanced-disabled`, `owned-advanced-cancel`) | Direction flip mirrors `start`/`end` only on `top`/`bottom` placements; disabled toggle blocks activations; cancel toggle keeps `preventDefault()` paths testable | Pending | Pending |
| ContextMenu long-press anchored surface | `advanced-context-trigger`, `advanced-context-content`, `advanced-context-state` (owned: `owned-advanced-context-trigger`, `owned-advanced-context-content`, `owned-advanced-context-state`) | Long-press opens a trigger-anchored surface (not pointer-anchored); plain press does not open; outside press and Android Back dismiss | Pending | Pending |
| HoverCard tap-toggle anchored surface | `advanced-hover-trigger`, `advanced-hover-content`, `advanced-hover-action` (owned: `owned-advanced-hover-trigger`, `owned-advanced-hover-content`, `owned-advanced-hover-action`) | Tap toggles the anchored surface; interior action runs without closing; outside press and Android Back dismiss | Pending | Pending |
| Tooltip tap-toggle anchored surface | `advanced-tooltip-trigger`, `advanced-tooltip-content`, `advanced-tooltip-state` (owned: `owned-advanced-tooltip-trigger`, `owned-advanced-tooltip-content`, `owned-advanced-tooltip-state`) | Tap toggles the anchored tip; outside press and Android Back dismiss; `containerStyle` sizes the surface | Pending | Pending |
| NavigationMenu per-item anchors, orientation, Link | `advanced-nav-overview`, `advanced-nav-account`, `advanced-nav-content-overview`, `advanced-nav-content-account`, `advanced-nav-link-overview`, `advanced-nav-link-account`, `advanced-navigation-state` (owned: same suffixes under `owned-advanced-`) | Each item's content anchors to its own trigger; `vertical` orientation stacks the list; Link chooses and dismisses; disabled/cancelled Link presses never dismiss | Pending | Pending |
| Command inline filter and selection | `advanced-command-input`, `advanced-last-action` (owned: `owned-advanced-command-input`, `owned-advanced-last-action`; items expose no testID — drive by visible text) | Search filters inline without opening a surface; `shouldFilter=false` renders all items; disabled/cancelled selection never invokes `onCommandSelect` | Pending | Pending |
| Owned remaining overlays | All `owned-advanced-*` IDs above, mirroring the packaged `advanced-*` checks | Owned copies mirror packaged anchoring, tap-toggle/long-press, per-item navigation, and inline command behavior | Pending | Pending |
| Sheet/Drawer accessibility and keyboard | Both content surfaces | VoiceOver/TalkBack role/state/labels, focus containment/restoration, large text, keyboard occlusion and nested Modal behavior recorded; no pass inferred from bundle checks | Pending | Pending |
| Chart geometry | `grouped-chart` | Category labels align with bar groups; chart label announces; record small-screen readability | Pending | Pending |
| Modal interior and close | `open-dialog`, `dialog-interior-action`, `explicit-close` | Interior action increments without closing; explicit close closes | Pending | Pending |
| Backdrop and system dismissal | `dismiss-mode`, `dialog-overlay`, Android Back / iOS accessibility escape | Backdrop and Android Back honor dismissal mode; record accessibility escape behavior separately | Pending | Pending |
| Modal accessibility | Open dialog with screen reader active | Record initial focus, labels, background traversal, and focus after close; missing containment/restoration is a failure to track | Pending | Pending |
| Theme and text scaling | `theme-toggle`; OS large font setting | Controls remain legible and usable; record clipping and touch-target issues | Pending | Pending |
| Keyboard and rotation | Focus Name/Notes; open dialog; rotate | Record keyboard avoidance, layout, scrolling, and Modal behavior | Pending | Pending |

No custom focus containment/restoration and no desktop keyboard navigation (roving highlight,
arrow-key menus, Escape-to-close beyond the OS `onRequestClose`/accessibility-escape path) is
claimed for the overlays: outside-press dismisses via the `-overlay` Pressable, Android Back via
the `-modal` `onRequestClose`, and accessibility escape composes the caller's handler before
dismissing. `modal={false}` remains ignored — content always renders in a native `Modal`.
Dropdown/ContextMenu sub-menus stay inline inside the modal surface; menu checkbox/radio semantics are
unchanged from the shared controllers.

OTP is a native `View` + `TextInput` family: no automatic SMS-code retrieval and no
form-submit behavior is claimed. `keyboardType="number-pad"` is a hint only
(alphanumeric accepted, no filter); `autoComplete="one-time-code"` and
`textContentType="oneTimeCode"` are hints only. Mocked-host tests, pure geometry,
typechecks, and packed Metro export verify wiring and bundle generation; none of
them proves layout, keyboard behavior, SMS autofill, or TalkBack/VoiceOver
announcements on iOS/Android.

Slider is a native `Pressable` track plus `PanResponder` drag: track-frame pairing with
page coordinates, mocked tap/drag/accessibility/ref contracts, typechecks, and packed
Metro export verify wiring and bundle generation; none of them proves device frames,
`ScrollView` negotiation, or TalkBack/VoiceOver announcements on iOS/Android.

Resizable is a native `View` group plus `Pressable` handles with `PanResponder` drag:
measured panel spans and responder deltas, mocked drag/accessibility/ref contracts,
typechecks, and packed Metro export verify wiring and bundle generation; none of them
proves device frames, `ScrollView` negotiation, or TalkBack/VoiceOver announcements
on iOS/Android.

Carousel is a native `ScrollView` pager with full-page slides. Native
types (`carousel.types.native.ts`), controlled index semantics, stable native API,
and caller-first guarded buttons are documented in [native carousel](./native-carousel.md);
the fixture and packed-consumer gates exercise packaged and copied sources. No paging frames, `ScrollView`
negotiation, RTL order/coordinate behavior, or TalkBack/VoiceOver announcements are
claimed until real-device evidence lands.

Caveats for device runs: content is measured on open and on window/root-layout changes only
(continuous anchor tracking is not implemented); a trigger whose ref cannot be measured falls
back to a centered surface; nested-Modal stacking and real device-keyboard behavior are pending
and not claimed. Sheet/Drawer now honor their native placement/dismissal contracts, including Drawer root settings. Their press/ref/modal wiring is mocked and compiled in packaged + copied-source consumers; swipe-to-close, snap points and custom focus management remain unimplemented. See [native Sheet/Drawer](./native-sheet-drawer.md).

For the remaining families, use the gaps and broader checklist in
[native capabilities](./native-capabilities.md), the OTP contract in
[native OTP](./native-otp.md), the slider contract in
[native slider](./native-slider.md), the resizable contract in
[native resizable](./native-resizable.md), the carousel contract in
[native carousel](./native-carousel.md), the Sheet/Drawer contract in
[native Sheet/Drawer](./native-sheet-drawer.md), and the remaining-overlays contract in
[native remaining overlays](./native-remaining-overlays.md). ContextMenu, HoverCard, Tooltip,
and NavigationMenu are implemented as anchored native surfaces in source; Command stays inline
by design (web `Command` is inline too; native provides no `CommandDialog`). OTP, slider,
resizable, and carousel interaction are implemented in source; all OTP, slider, resizable,
carousel, and remaining-overlay device checks above remain pending and require real-device evidence.

## Result record

Copy this record for each test run; leave untested cases pending.

```text
Commit:
Date:
Device and OS:
Expo / React Native:
App/client build:
VoiceOver / TalkBack settings:
Font size / orientation:
Passed checks:
Failed checks (steps, expected, actual):
Untested checks:
Logs / screenshots / recording:
```
