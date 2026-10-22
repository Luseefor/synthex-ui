# Native device validation

Scope: branch `ace/native-otp`, stacked on OPEN PR #125 (`ace/native-overlays`),
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

Full OTP contract in [native OTP](./native-otp.md).

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

All entries are **pending on both iOS and Android**. Device and computer-use
tools were disabled for this stage; no VoiceOver/TalkBack result is claimed.
Native accessibility props describe intended state; actual announcements and
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
| RTL overlay direction | `overlay-direction` flips the global `DirectionProvider`; re-run Select/Dropdown/Popover/Combobox checks | `start`/`end` alignment mirrors under RTL; record any trigger/content mismatch | Pending | Pending |
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
Dropdown sub-menus stay inline inside the modal surface; menu checkbox/radio semantics are
unchanged from the shared controllers.

OTP is a native `View` + `TextInput` family: no automatic SMS-code retrieval and no
form-submit behavior is claimed. `keyboardType="number-pad"` is a hint only
(alphanumeric accepted, no filter); `autoComplete="one-time-code"` and
`textContentType="oneTimeCode"` are hints only. Mocked-host tests, pure geometry,
typechecks, and packed Metro export verify wiring and bundle generation; none of
them proves layout, keyboard behavior, SMS autofill, or TalkBack/VoiceOver
announcements on iOS/Android.

Caveats for device runs: content is measured on open and on window/root-layout changes only
(continuous anchor tracking is not implemented); a trigger whose ref cannot be measured falls
back to a centered surface; nested-Modal stacking and real device-keyboard behavior are pending
and not claimed. Sheet/Drawer limits are unchanged (positional sheet `side` styles, no
swipe-to-close; drawer always bottom-presented).

For the remaining families, use the gaps and broader checklist in
[native capabilities](./native-capabilities.md) and the OTP contract in
[native OTP](./native-otp.md). Carousel swipe, resizable drag,
slider gestures, and the remaining in-flow overlays (command,
context-menu, hover-card, navigation-menu, tooltip) require separate
implementation and device evidence. OTP interaction is implemented in source;
all OTP device checks above remain pending and require real-device evidence.

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
