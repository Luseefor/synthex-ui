# Native capabilities

Scope: `synthex-ui` native (`react-native` condition) vs web, branch `ace/native-resizable`
stacked on OPEN PR #127 (`ace/native-slider`), unreleased source in this checkout
(packed Expo checks pass, device evidence is pending).
Method: read every `packages/ui/src/*/*.native.tsx|ts` + `index.native.ts`, `package.json` exports,
`native-exports.test.ts`, the mocked native tests, `packages/ui/src/_shared/overlay.native.tsx`,
`packages/ui/src/_shared/positioning.native.ts`, `packages/ui/src/_shared/direction-context.native.ts`,
and `packages/ui/src/input-otp/input-otp.edit.ts` + `input-otp.shared.tsx` for the OTP contract.
No device run (devices/computer-use disabled). This is an implementation inventory, not a claim
of complete web/native parity.
See [device validation](./native-device-validation.md) for a runnable packed Expo fixture,
[native OTP](./native-otp.md) for the one-time-code contract,
[native slider](./native-slider.md) for the slider contract, and
[native resizable](./native-resizable.md) for the resizable contract.

## What each evidence tier means

- **Mocked render (not device evidence):** `vi.mock("react-native", …)` mapping
  `View/Pressable/Text/Modal` to `mock-view/mock-pressable/…` + `react-test-renderer` `act/create`.
  Style used in `button.native.test.tsx`, `card.native.test.tsx`, `calendar.native.test.tsx`,
  `carousel.native.test.tsx`, `chart.native.test.tsx` (also mocks `react-native-svg`),
  `dialog.native.test.tsx`, `select.native.test.tsx`, `toast.native.test.tsx`.
  New `*.contract.native.test.tsx` tests also invoke host callbacks to verify controllers, disabled guards, cancellation, handler composition, accessibility props, and refs. They do not prove layout,
  gestures, `Modal`, accessibility-tree, TalkBack/VoiceOver, or performance on iOS/Android.
- **Mocked overlay hosts + pure geometry (not device evidence):**
  `overlay.native.test.tsx` drives `NativeOverlayContent` with stubbed `measureInWindow`/`onLayout`
  (anchor→viewport coordinate conversion, backdrop/system dismissal routing, keyboard-avoidance
  shrink, centered fallback, stale-measurement guards, ref/accessibility-escape composition,
  direction inheritance); `positioning.native.test.ts` exercises pure
  `resolveNativeOverlayPosition` (four sides, RTL start/end, offsets, flip, shrink/clamp,
  offscreen anchors, NaN/huge-padding normalization, deterministic viewport invariants).
  Neither executes a real `Modal`, keyboard, rotation, or screen reader.
  The four `*.overlay.native.test.tsx` component suites exercise the actual shared helper,
  including controllers, cancelled/disabled presses, `asChild` refs and child styles.
- **Types / export graph:** `bun --filter synthex-ui typecheck` (tsc) +
  `native-exports.test.ts`: per-component `react-native` condition is first and points at
  `dist/<family>/index.native.js`, and every native graph is transitively web-file-free and
  DOM-package-free (no runtime `@radix/*`, `cmdk`, `embla`, `recharts`, `sonner`, `vaul`,
  `react-dom`, …). This checks export shape and source imports. It does not execute Metro or a device.
- **Metro export:** `bun run native:check` installs the local UI tarball in an isolated Expo app, copies four overlays and direction using the local CLI tarball, typechecks native subpath imports and the copied implementations, and exports iOS + Android bundles. The fixture also imports the native root (including chart). This verifies packed module resolution, source compatibility and bundle generation, not device behavior.
- **Pending real-device evidence:** everything under “Device checklist” below — none of it
  has been run in this stage.

Existence of an export is never treated as capability below.

## Native ref declarations

Native forwarded components explicitly retain `React.ElementRef<typeof Host>`
in their exported declarations. Inferred declarations built with React Native
0.81 can otherwise emit the old class name as the instance type; React Native
0.88's strict API uses component types for those names, hiding methods such as
TextInput `focus()` in consumers. The annotations preserve host instance types
without adding runtime files or changing refs. Workspace types cover the 0.81
development dependency; the packed Expo fixture checks the 0.88 consumer.
See the [React Native strict TypeScript API discussion](https://github.com/react-native-community/discussions-and-proposals/discussions/1015).

Owned source copies have their own contexts. To share RTL direction between copied
overlays, also copy `direction` and use its owned `DirectionProvider`; a provider
imported from the installed package cannot update the copied context. Select and
DropdownMenu also accept an explicit `dir` override. The same context boundary
applies to custom native themes.

## Compact matrix

| Family | Native shape (file) | Material web differences / limitations | Evidence |
|---|---|---|---|
| primitives (`Box/Text/Stack/Inline/Grid/Surface/PressablePrimitive/ScrollArea`) | `View`/`NativeText`/`Pressable`/`ScrollView` + theme token resolvers; `Grid` is row-wrap with `%` widths; `toNativeDimension` drops non-`%`/number units (`primitives/index.native.tsx`) | No CSS cascade, no responsive breakpoints, no web slots; `Grid` has no real 12-col grid, gap uses RN `gap`; `toNativeDimension` returns `undefined` for `px`/`rem`/calc strings | typecheck; no dedicated native test; export via `synthex-ui/primitives` |
| layout (`AppShell/Pane/Section/PanelFrame` + `ScrollArea` re-export) | `Stack`/`Inline`/`Surface`/`ScrollArea` composition, fixed sidebar `width={248}` (`layout/index.native.tsx`) | Native shell uses a fixed-width sidebar in a row; no responsive breakpoints, no sticky/fixed positioning | typecheck only; no native test |
| hooks (`useTheme/useControllableState/useDisclosure/usePlatformValue/useReducedMotion/useMobile`) | `hooks/index.native.ts`: `usePlatformValue` returns `values.native`; `useReducedMotion` subscribes to `AccessibilityInfo` (`useReducedMotion.native.ts`); `useMobile` returns `false` (`useMobile.native.ts`) | `useMobile` is a hardcoded `false` (no dimension listener); `useReducedMotion` initial `false` then async update (first-frame flash) | typecheck only; no hook tests |
| icons | `lucide-react-native` map, 30 names, `Icon` defaults `color=theme.colors.foreground size=18` (`icons/index.native.tsx`, `icons/shared.ts`) | Web `lucide-react` CSS sizing/stroke vs RN props; set is closed — any web-side icon outside the 30 has no native equivalent | typecheck only |
| theme (`ThemeProvider/createTheme/tokens`) | `ThemeProvider.native.tsx`: `ThemeContext` + root `View{flex:1,background}`; tokens from `_shared/tokens/*` | No CSS variables, no `dark` class/media query — `mode` prop only; `ChartStyle` returns `null` (see chart); shadows are iOS props + `elevation` approximations | `moat-theme.test.tsx` (web/jsdom theming); native provider has no device test |
| direction | `DirectionProvider` holds `dir` state, wraps children in `View{direction:dir,flex:1}`, publishes via `NativeDirectionContext` (`direction/direction.native.tsx`, `_shared/direction-context.native.ts`) | Web Radix `DirectionProvider` flips DOM `dir`; native sets RN `direction` style on one wrapper — nested absolute/overlay children and third-party components may not inherit | `direction/direction.test.tsx` (web/jsdom); overlay direction inheritance covered by mocked `overlay.native.test.tsx`; no native RTL device test |
| accordion | `View` + `Pressable` trigger, controller from `accordion.shared`, chevron rotate, content `null` when closed (`accordion/accordion.native.tsx`) | No animation, no keyboard arrows/Home/End, no `collapsible` animation; type `single`/`multiple` via shared controller only | `accordion.keyboard.test.tsx` is web; native has no test |
| alert | `View` + `Text` title/description, 4-tone inline styles (`alert/alert.native.tsx`) | No `role="alert"`, no live-region announcement; warning tone hardcodes `#d97706`/`rgba(245,158,11,0.14)` instead of theme token | typecheck only |
| alert-dialog | Thin wrapper over `dialog.native` (`AlertDialog*=Dialog*`); Cancel/Action are `Button` that `setOpen(false)` then `onPress` (`alert-dialog/alert-dialog.native.tsx`) | No `AlertDialogOverlay` portal semantics, no focus trap, no Escape; `hideClose` only on `AlertDialogContent` | mocked `dialog.native.test.tsx` covers base dialog only |
| aspect-ratio | `View{width:100%,aspectRatio:ratio,overflow:hidden}` + inner `flex:1` (`aspect-ratio/aspect-ratio.native.tsx`) | Faithful for image/video boxes; web `padding-hack` vs RN native `aspectRatio` — same outcome, different mechanism | typecheck only |
| avatar | `View` circle + `Image{width/height:100%}` + absolute fallback `View` hidden when `imageStatus==="loaded"` (`avatar/avatar.native.tsx`) | No web `onLoadingStatusChange`/delay semantics beyond `loaded/error`; fallback shows during `idle/loading/error` (no shimmer) | typecheck only |
| badge | `View` pill + uppercase `Text` (`badge/badge.native.tsx`) | Static; no interactive/link semantics | typecheck only |
| breadcrumb | Row/wrap `View`s + `Pressable` link with `accessibilityState.selected` (`breadcrumb/breadcrumb.native.tsx`) | No `nav`/`ol` semantics, no overflow collapse; ellipsis/separator are visual only | typecheck only |
| button | `Pressable` + string/number children wrapped in `Text`; `asChild` clones child merging `onPress`/`style` (`button/button.native.tsx`) | `asChild` composes press handlers and refs; disabled state is guarded; no web `:focus-visible` or form submit | mocked `button.native.test.tsx` + `button.contract.native.test.tsx` |
| calendar | Hand-rolled month grid (`Pressable` days, `createCalendarGrid`), `mode` single/multiple/range, prev/next chevrons; `numberOfMonths`/`required` ignored (`calendar/calendar.native.tsx`) | Single month only (web `react-day-picker` multi-month ignored); no keyboard navigation, no `required` form validation, no locale/date-fns parsing beyond shared helpers | mocked `calendar.native.test.tsx` |
| card (+`CardAction`) | `View` tones (default/elevated/interactive/muted) + `Text` parts (`card/card.native.tsx`) | Shadows are `shadow*`+`elevation` approximations; `CardAction` is positioned View, not web absolute corner | mocked `card.native.test.tsx` |
| carousel | `index` state + `CarouselContent` renders **only** `items[index]`; Prev/Next `Button`s; `orientation/opts/plugins/setApi` ignored (`carousel/carousel.native.tsx`) | No swipe/scroll, no Embla, no loop, no keyboard, no partial slides; `setApi` never called so controlled API is dead | mocked `carousel.native.test.tsx` (render only) |
| chart | `react-native-svg` (`Svg/Polyline/Path/Rect/Circle/Line/SvgText`), fixed `SVG_WIDTH=640` viewBox, `series`-prop API; `ChartStyle→null`, `config→ignored`, `indicator→dot-only` (`chart/chart.native.tsx`) | No recharts interactivity/tooltip-hover/responsive container; axis labels from `series[0]` only; bar groups share label centers; all-zero data has a finite baseline | mocked `chart.native.test.tsx`, `chart.geometry.native.test.tsx`, `chart-compat.test.tsx` |
| checkbox | `Pressable` box + `CheckIcon`/indeterminate bar; `indeterminate→accessibilityState.checked:"mixed"`; `name/required` ignored (`checkbox/checkbox.native.tsx`) | No native form element; tri-state toggles `true→false` (indeterminate not reachable by press); no keyboard space handling beyond Pressable | `checkbox.contract.native.test.tsx` (mocked) |
| collapsible | `Pressable` trigger + conditional content, `asChild` clone supported (`collapsible/collapsible.native.tsx`) | No height animation; `forceMount` accepted but content still gated on open | typecheck only |
| combobox | Anchored `Modal{transparent,overFullScreen}` via shared `NativeOverlayContent` + `NativeOverlayProvider`; `side/align/sideOffset/alignOffset` honored via `resolveNativeOverlayPosition`, RTL-aware, flip + clamp/shrink; content is `KeyboardAvoidingView` + `SafeAreaView` + `ScrollView` (reduced viewport scrolls, `keyboardShouldPersistTaps="handled"`); outside-press and `onRequestClose` dismiss (`combobox/combobox.native.tsx`, `_shared/overlay.native.tsx`) | `modal` prop does not exist natively (always Modal); no desktop keyboard combobox pattern (no roving highlight/Enter selection beyond tap, no scoring beyond substring filter); no custom focus containment/restoration; nested-Modal and real keyboard behavior unverified on device | mocked `overlay.native.test.tsx` + pure `positioning.native.test.ts`; no combobox device test (see device-validation checklist) |
| command | `TextInput` + `ScrollView` list + filter props `_label/_filter/_loop` ignored (`command/command.native.tsx`) | No `cmdk` keyboard navigation/loop/scoring; search is substring filter only; still in-flow (not on the shared overlay layer), no dialog semantics | typecheck only |
| context-menu | `onLongPress` trigger → inline `View` content; `dir/modal/side/align*` ignored (`context-menu/context-menu.native.tsx`) | Long-press replaces right-click (discoverability gap); still in-flow (pushes layout, clipped, no shared overlay layer, unverified flip/outside-dismiss); sub-menu behavior unchanged | typecheck only |
| dashboard (`DashboardView`) | Composes native `Button/Input/Table/Stack/Surface/Text` + bar-strip usage chart (`dashboard/dashboard.native.tsx`) | Web version has search results, branding toggle, `Card` header, GitHub copy (`chartTitle/chartDescription/componentResults/showBranding` absent natively); usage chart is proportional bars, not real chart | typecheck only |
| data-table | TanStack `useReactTable` (sort/filter/pagination state) rendered with `ScrollView`+`View` rows + `TextInput` filter (`data-table/data-table.native.tsx`) | Real TanStack logic reused; UI is stacked rows, no column pinning/virtualization/column visibility; large tables will mount all rows (perf) | `data-table.web.test.tsx` is web-only; native has no test |
| date-picker | `Pressable` trigger + inline `Calendar`; select closes (`date-picker/date-picker.native.tsx`) | No portal/modal, no input mask, no keyboard entry; calendar opens inline shifting layout | typecheck only |
| dialog (+alert-dialog aliases) | `Modal{transparent,animation fade}` + overlay `Pressable` (dismiss) + inner `Pressable stopPropagation` + content `View` + absolute close button; `modal` prop ignored (`dialog/dialog.native.tsx`) | RN `Modal`; no custom initial-focus/containment/restoration implementation; interior stops propagation; OS behavior pending device checks; `modal=false` still modals | mocked `dialog.native.test.tsx` + `dialog.contract.native.test.tsx`; base dismissal and composed handlers tested, sheet/drawer are separate implementations |
| drawer | Same `Modal` pattern as dialog, bottom-sheet styling; `direction/dismissible/modal` ignored (`drawer/drawer.native.tsx`) | Always bottom presentation; `direction` (left/right) silently ignored; no gesture drag-to-dismiss, no `vaul` snap points | typecheck only |
| dropdown-menu (+menubar base) | Anchored `Modal{transparent,overFullScreen}` via shared `NativeOverlayContent` + `NativeOverlayProvider` (`dropdown-menu/dropdown-menu.native.tsx`, `_shared/overlay.native.tsx`); `side/align/sideOffset/alignOffset` honored via `resolveNativeOverlayPosition`, RTL-aware, flip + clamp/shrink; outside-press and `onRequestClose` dismiss; `asChild` trigger clone supported; sub-menus (`SubTrigger/SubContent`) stay inline `View`s inside the modal surface; checkbox/radio items keep web-shared toggle semantics | `modal` prop accepted and always ignored (always Modal); no hover, no desktop keyboard menu pattern, no custom focus containment/restoration; nested-Modal and real Backdrop/Back behavior unverified on device | mocked `overlay.native.test.tsx` + pure `positioning.native.test.ts`; `dropdown-menu-extras.test.ts` (shared logic); no dropdown device test (see device-validation checklist) |
| form | `View` wrappers + `FormFieldProvider/FormItemProvider(id=useId)`; `FormControl` clones child adding `accessibilityState.invalid`+`nativeID`; message/description via `nativeID` (`form/form.native.tsx`) | No `react-hook-form` binding natively (providers are context only); no submit handling; label↔control linkage is `nativeID` only (screen-reader support unverified) | `form.web.test.tsx` + `form.contract.web.test.tsx` are web-only |
| hover-card | `onPress` toggles inline `View`; `side/align*` ignored (`hover-card/hover-card.native.tsx`) | Hover replaced by tap (no `openDelay` timing on device — prop accepted but tap-driven); still in-flow, not on the shared overlay layer | typecheck only |
| input | `NativeTextInput` with field-control style; `disabled` maps to `editable=false` and accessibility disabled state (`input/input.native.tsx`) | No web `type`/date/file semantics; multiline is textarea’s job | `input.contract.native.test.tsx` (mocked) |
| input-otp | N `TextInput` slots sharing `value` via `useInputOTPController` + focus registry (`input-otp/input-otp.native.tsx`, `input-otp.shared.tsx`, `input-otp.edit.ts`); see [native OTP](./native-otp.md) | `View` + `TextInput` family (no web caret/fake-slot model); `keyboardType` defaults to `number-pad` but alphanumeric accepted with no filter; `selectTextOnFocus` defaults `true`; `autoComplete="one-time-code"` / `textContentType="oneTimeCode"` are hints only, no automatic SMS retrieval; no form-submit behavior; device paste/backspace/autofill/labels pending (see G3) | pure edit/controller + mocked native contract tests; `native:check` compiles packaged + owned OTP and checks ref declarations |
| label | `NativeText` styled (`label/label.native.tsx`) | No `htmlFor` association; linkage depends on `FormControl nativeID` | typecheck only |
| menubar | `Menubar` is row `View`; `MenubarMenu→DropdownMenu`, triggers/contents are dropdown aliases; `value/defaultValue/onValueChange/dir` ignored (`menubar/menubar.native.tsx`) | Desktop menubar keyboard model (arrows, mnemonics) absent; sub-menus are dropdown aliases — anchored-modal behavior follows the dropdown row, desktop patterns unverified | typecheck only |
| navigation-menu | `Pressable` triggers + inline content/viewport `View`s; `dir` + both `asChild` ignored (`navigation-menu/navigation-menu.native.tsx`) | No viewport positioning/orientation animation; `asChild` silently ignored (extra wrapper vs web Slot); still in-flow, not on the shared overlay layer | typecheck only |
| pagination | `Pressable` links with `accessibilityRole/state` (`pagination/pagination.native.tsx`) | Page changes are caller-driven; no URL/router integration | typecheck only |
| popover | Anchored `Modal{transparent,overFullScreen}` via shared `NativeOverlayContent` + `NativeOverlayProvider` (`popover/popover.native.tsx`, `_shared/overlay.native.tsx`); `side/align/sideOffset/alignOffset` honored via `resolveNativeOverlayPosition`, RTL-aware, flip + clamp/shrink; content is `KeyboardAvoidingView` + `SafeAreaView` + `ScrollView`; outside-press and `onRequestClose` dismiss; `asChild` trigger clone supported | `modal` prop accepted and always ignored (always Modal); no Escape key, no custom focus containment/restoration; nested-Modal and real Backdrop/Back behavior unverified on device | mocked `overlay.native.test.tsx` + pure `positioning.native.test.ts`; no popover device test (see device-validation checklist) |
| progress | `View` track + `%`-width fill, clamped (`progress/progress.native.tsx`) | No `aria-valuenow` numbers exposed beyond `accessibilityRole=progressbar` (no `accessibilityValue`) | typecheck only |
| radio-group | `radiogroup` View + `radio` Pressables (`radio-group/radio-group.native.tsx`) | No arrow-key roving; disabled resolution is per-item `effectiveDisabled` | `radio-group.direction.test.tsx` is web-only; no dedicated native test |
| resizable | `View` group + flex-ratio panels + `Pressable` handles with parent `PanResponder` drag past 4pt single-axis intent; adjacent pair total conserved with size-limit clamping; per-handle adjustable actions (`resizable/resizable.native.tsx` + math); see [native resizable](./native-resizable.md) | No imperative panel API, collapse, or autosave; measured panel span converts responder deltas to percentages (device layout/`ScrollView` negotiation pending); VoiceOver/TalkBack announcements pending | mocked contract tests; `native:check` bundles; device checks pending |
| select | Anchored `Modal{transparent,overFullScreen}` via shared `NativeOverlayContent` + `NativeOverlayProvider` (`select/select.native.tsx`, `_shared/overlay.native.tsx`); `side/align/sideOffset/alignOffset` honored via `resolveNativeOverlayPosition`, RTL-aware, flip + clamp/shrink; `asChild` trigger clone supported (same pattern as dropdown/dialog); content is `KeyboardAvoidingView` + `SafeAreaView` + `ScrollView`; outside-press and `onRequestClose` dismiss; `Pressable` items register labels; root/part disabled state propagated and guarded | `name/required/position` accepted and inert (no native form behavior; `void name/required/position`); no desktop keyboard select pattern, no custom focus containment/restoration; nested-Modal and real Backdrop/Back behavior unverified on device | mocked `select.native.test.tsx` + `select.contract.native.test.tsx` + mocked `overlay.native.test.tsx` + pure `positioning.native.test.ts`; shared `select-extras.test.tsx`; no select device test (see device-validation checklist) |
| separator | `View` line (`separator/separator.native.tsx`) | Orientation via props; no `role=separator` | typecheck only |
| sheet | `Modal` pattern shared with dialog; `side` prop styles placement; `modal` ignored (`sheet/sheet.native.tsx`) | Side variants are positional styles inside one Modal; no swipe-to-close | typecheck only |
| sidebar | `SidebarProvider{open state}` + fixed `width: open?288:88` View + `ScrollView` content (`sidebar/sidebar.native.tsx`) | No `collapsible=offcanvas/icon` modes, no sheet-on-mobile, no keyboard shortcut; `SidebarRail` is a static bar | typecheck only |
| skeleton | Static `View` block (`skeleton/skeleton.native.tsx`) | No shimmer/pulse animation | typecheck only |
| slider | Root `Pressable` track (ref/tap retained) + parent `PanResponder` drag past 4pt single-finger axis intent; nearest thumb fixed per gesture with no-cross clamp; per-thumb adjustable actions (`slider/slider.native.tsx` + math); see [native slider](./native-slider.md) | No `minStepsBetweenThumbs`; track measure paired with responder page coords (device frame/`ScrollView` negotiation pending); VoiceOver/TalkBack announcements pending | mocked contract tests; `native:check` bundles; device checks pending |
| switch | `Pressable` track + translating thumb `View`; `name/required` ignored (`switch/switch.native.tsx`) | Custom Pressable, not RN `Switch` (no native haptics/settings integration); form props inert | `switch.contract.native.test.tsx` (mocked) |
| synthex blocks (`ThemeAccentSwitcher/AssistantChatPanel/FloatingAssistantLauncher/CadenceBarChart/Marquee/KPIStatGrid/TimelineRow/ExperienceTimeline/ProjectCaseRow/ContactSplitForm/DungeonHUDShell`) | RN Views/Text/ScrollView/Animated (`Animated.loop/timing`, `Linking`); `Marquee` duplicates items + `translateX` loop honoring `useReducedMotion` (`synthex/synthex.native.tsx`) | Marketing/demo blocks, not shadcn parity targets; charts are simplified bars; chat/launcher are styled Views with no network; animation curves differ from web CSS | typecheck only; no native tests |
| table | `ScrollView{horizontal}` + `View` sections; string/number cells auto-wrapped in `Text` (`table/table.native.tsx`) | No `table` semantics, no sticky header, horizontal-only scroll container | typecheck only |
| tabs | Controller + `Pressable` triggers (`role=tab`, `selected`) + gated content; `orientation/activationMode` ignored (`tabs/tabs.native.tsx`) | No arrow-key navigation, no automatic vs manual activation distinction | `tabs.contract.native.test.tsx` (mocked); direction keyboard tests are web-only |
| textarea | `NativeTextInput` multiline styling; `disabled` maps to `editable=false` (`textarea/textarea.native.tsx`) | No auto-grow; web `rows`/`auto-resize` absent | `textarea.contract.native.test.tsx` (mocked) |
| toast/sonner | `ToastProvider` store + `ToastViewport` renders `Modal{visible=toasts.length>0}` with stacked `ToastCard`s + auto-dismiss timeout; `richColors/expand/position` styling only (`toast/toast.native.tsx`) | RN Modal; no swipe-to-dismiss, no queue limit/pause-on-hover, `Sonner/Toaster` are aliases over same viewport; timeout uses `setTimeout` (background-timer drift) | mocked `toast.native.test.tsx` (Modal mocked) |
| toggle | `Pressable` with `pressed` state (`toggle/toggle.native.tsx`) | No keyboard toggle beyond Pressable | typecheck only |
| toggle-group | `ToggleGroup` context + `Toggle` items; single toggles `""`, multiple toggles array (`toggle-group/toggle-group.native.tsx`) | No roving tabindex; `disabled` is group-OR-item | typecheck only |
| tooltip | `onPressIn→open/onPressOut→close` + `absolute` content View; `side/align*` ignored (`tooltip/tooltip.native.tsx`) | Press-hold replaces hover/focus; absolute positioning inside relative parent with no flip/collision handling; still in-flow, not on the shared overlay layer | typecheck only |
| typography (`H1-H4/P/Lead/Large/Small/Muted/Blockquote/Code`) | Styled `Text` from theme tokens (`typography/typography.native.tsx`) | No semantic HTML mapping (`h1`/`blockquote` are styled Text); no responsive type | typecheck only |
| utilities (`Spinner/Kbd/ButtonGroup/Field*/InputGroup*/Empty*/Item*/NativeSelect`) | `Spinner` is bordered `View` (no `ActivityIndicator`, no rotation); `NativeSelect` is styled `TextInput`; rest are `View`/`Text` stacks (`utilities/utilities.native.tsx`) | `Spinner` never animates (static ring); `NativeSelect` is a text field, not a picker; `Field/InputGroup/Empty/Item` are layout aliases | typecheck only |
| helpers (`cn/cva/defineVariants/resolveVariants`, `field-control.native`, `positioning`, tokens) | Pure style/geometric resolvers; `positioning.ts` holds shared `OverlaySide/Align/PositionProps` types; `positioning.native.ts` implements pure `resolveNativeOverlayPosition` for the anchored overlay layer (other native families may still accept the props without implementing positioning); `field-control.native.ts` returns RN style object | No runtime host behavior; geometry is pure math, host measurement lives in `overlay.native.tsx` | `variants.test.ts`, `positioning.native.test.ts` |

Subpath notes: `synthex-ui/blocks` is web-only (no `react-native` condition).
`chart`, `data-table`, `direction`, and `sidebar` have no dedicated package subpath; they are exported
through the root/components native graph (`components/index.native.ts`, `index.native.ts`).
`native-exports.test.ts` enforces the `react-native`-first condition on every other subpath.

## Accepted-but-ignored props (concrete `void` inventory, not exhaustive)

`calendar:_numberOfMonths,_required`; `carousel:_orientation,_opts,_plugins,_setApi`;
`chart:_config(×2),_indicator`; `command:_label,_filter,_loop`; `tabs:_orientation,_activationMode`;
`dialog/sheet:modal`; `drawer:direction,dismissible,modal`; `dropdown/popover:modal` (always Modal);
`context-menu:dir,modal,side,align,sideOffset,alignOffset`; `hover-card/tooltip:same side/align set`;
`select:name,required,position` (`void` each); `menubar:value,defaultValue,onValueChange,dir`;
`navigation-menu:dir,asChild(×2)`; `switch/checkbox:name,required`; `toast viewport:richColors`.
Dropdown/popover/select/combobox `side/align/sideOffset/alignOffset` are honored by the shared overlay
layer; select/popover/dropdown `asChild` clones the child; select/combobox/dropdown/popover `dir` resolves
via `NativeOverlayProvider`/`NativeDirectionContext`. Each remaining listed prop is API-parity-accepted and inert at runtime.

## Placeholders / no-ops (concrete)

- `ChartStyle` returns `null` (`chart/chart.native.tsx`) — documented CSS-var gap, not a runtime control.
- `ResizableHandle` renders a `Pressable` with no press/move handler (`resizable/resizable.native.tsx`) — visual only.
- `useMobile()` returns `false` unconditionally (`hooks/useMobile.native.ts`).
- `CarouselContent` renders one item (`items[index]`, `carousel/carousel.native.tsx`); `api` is `undefined`, `carouselRef` is `()=>{}` cast to `never`.
- `ToastViewport` `richColors`/`expand` change spacing only; `Sonner`/`Toaster` alias the same viewport.
- `Spinner` is a static bordered `View`, never animates (`utilities/utilities.native.tsx`).

## Remaining implementation gaps

- **G1 (resolved in source, device pending) — Resizable drag is implemented.**
  Pair-conserved drag with feasible `minSize`/`maxSize` clamping, per-handle adjustable
  actions, direction handling, and controlled commit semantics are implemented and covered
  by source + mocked-host tests. Drag beyond the pair, `ScrollView` negotiation, RTL/vertical
  axes, labels/actions under large fonts and disable, ref/controlled behavior,
  and the owned copy require the [device checklist](./native-device-validation.md). See the
  [native resizable contract](./native-resizable.md).
- **G3 — OTP device validation remains pending.** Native focus, bounded paste and
  Backspace handling are implemented and covered by edit/controller/mocked-host tests.
  OS paste, keyboard event order, autofill, focus timing and screen-reader output
  require the [device checklist](./native-device-validation.md). See the
  [native OTP contract](./native-otp.md).
- **G4 (narrowed) — Remaining in-flow overlays shift layout and clip**
  (`command/command.native.tsx`, `context-menu`, `hover-card`,
  `navigation-menu`, `tooltip`). Content renders as a sibling `View` gated on `open`, with no shared
  `Modal` layer, no flip, no outside-press/Escape dismiss. Near screen edges or inside `ScrollView`/`Modal`
  parents the content pushes layout or clips. Select/DropdownMenu/Popover/Combobox are out of scope for
  this gap: on `ace/native-overlays` they use the shared anchored transparent-`Modal` layer
  (`_shared/overlay.native.tsx` + `positioning.native.ts`) with flip/clamp/shrink and outside/system
  dismissal; dropdown sub-menus stay inline `View`s inside the modal surface (no nested modal per submenu).
- **G5 (narrowed) — Slider device validation remains pending** (`slider/slider.native.tsx` + math).
  Tap, drag with fixed thumb identity and no-cross clamp, per-thumb adjustable actions,
  direction/inverted handling, and controlled commit semantics are implemented and covered
  by source + mocked-host tests. Drag beyond the track, `ScrollView` negotiation, RTL/vertical/inverted
  axes, range overlap identity, labels/actions under large fonts and disable, ref/controlled behavior,
  and the owned copy require the [device checklist](./native-device-validation.md). See the
  [native slider contract](./native-slider.md).

## Broader device checklist (pending — none run here)

1. iOS VoiceOver + Android TalkBack pass per family: triggers announce role/state
   (button/checkbox/switch/radio/tab/select-item/slider/progress), record dialog focus containment/restoration and close labels,
   toasts announce, charts expose `accessibilityLabel`, OTP slots announce position (see [native OTP](./native-otp.md)).
2. `Modal` families (dialog/sheet/drawer/toast) on real devices: backdrop dismiss, `onRequestClose`
   (Android back), rotation, nested Modal, background-timer toast dismissal.
   Sheet/Drawer limits are unchanged by this stage: sheet `side` variants are positional styles
   inside one Modal with no swipe-to-close; drawer is always bottom-presented (`direction` silently
   ignored), no gesture drag-to-dismiss, no snap points. Shared overlay changes do not alter them.
3. Gesture families: carousel swipe (currently absent — confirm expected UX), slider drag (implemented in source, device pending — see [native slider](./native-slider.md)), resizable drag (implemented in source, device pending — see [native resizable](./native-resizable.md)), drawer swipe-to-close, tooltip press-hold vs hover, context-menu long-press
   timing, marquee `Animated` + `useNativeDriver` under reduced-motion on/off.
4. Anchored overlays (Select/DropdownMenu/Popover/Combobox) on real devices: trigger→content anchoring
   after open, `side/align/offset` + RTL start/end, flip near edges, clamp/shrink of oversized content,
   `ScrollView` scrolling of tall content, outside-press and Android Back dismissal, keyboard-avoidance
   for combobox/popover inputs, rotation, and nested-Modal stacking. Mocked-host + pure-geometry tests
   cover the math; none of the device behavior has been run (see device-validation checklist for IDs).
   Remaining in-flow families (command/context-menu/hover-card/navigation-menu/tooltip) still need
   clipping review inside `ScrollView`, `Modal`, and near screen edges on small phones.
5. Visual: theme `mode` switching, `elevation` vs iOS shadow parity, `lucide-react-native` stroke
   rendering, `Spinner` static-ring acceptability, bar/line/area chart legibility at 320pt widths.
6. Perf: data-table with 100+ rows (no virtualization), synthex `Animated.loop` marquee battery/CPU,
   chart `react-native-svg` mount cost.

## Limits of this audit

- Static reading, mocked host tests (including the overlay host/escape/scroll contracts),
  pure geometry tests, typechecks, and packed Metro bundle generation are separate evidence.
  No iOS/Android simulator, no screen-reader run. Anything about animation timing, gesture physics,
  `Modal` stacking, keyboard behavior, or actual TalkBack/VoiceOver output is unverified.
- Web-side behavior taken from adjacent `*.web.tsx`/`*.shared.*` as reference; web runtime not re-tested here.
- The listed gaps are not exhaustive; absence from this list is not a clean bill of health.

## Reproduce checks

```sh
bun --filter synthex-ui typecheck
bun --filter synthex-ui test
bun --filter synthex-ui build
bun --filter '@luseefor/synthex-cli' build
bun run native:check
```

Source fixes on `ace/native-overlays` (unreleased source in this checkout, OPEN PR #125) implement the shared
anchored overlay layer (`_shared/overlay.native.tsx`, `_shared/positioning.native.ts`,
`_shared/direction-context.native.ts`) and adopt it in Select, DropdownMenu, Popover, and Combobox,
including `SelectTrigger asChild` support (former gap G2 is resolved and removed) and a narrowed gap G4
covering only the remaining in-flow families. Earlier stages covered Button/Checkbox/Switch/Input/Textarea,
Tabs, Dialog, and chart geometry. The OTP stage (`ace/native-otp`, stacked on PR #125, not published/merged)
adds native OTP focus, paste and Backspace handling; full contract
in [native OTP](./native-otp.md). The slider stage (`ace/native-slider`, stacked on OPEN PR #126,
not published/merged) adds native slider tap/drag with fixed thumb identity, no-cross clamp,
per-thumb adjustable actions, and controlled commit semantics; full contract
in [native slider](./native-slider.md). This stage (`ace/native-resizable`, stacked on
OPEN PR #127, not published/merged) adds native resizable pair-conserved drag with feasible
clamping, per-handle adjustable actions, and controlled commit semantics; full contract
in [native resizable](./native-resizable.md). The fixture and pending manual checks are
in [native device validation](./native-device-validation.md). Shared native
Dialog/overlay changes do not automatically fix the separate Sheet/Drawer implementations, whose limits
above are unchanged.
