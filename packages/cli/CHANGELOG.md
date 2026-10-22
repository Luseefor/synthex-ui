# @luseefor/synthex-cli

## 1.2.0

### Minor Changes

- 9ec0b8d: Add Vite, Next.js App Router, and Expo starters, framework-aware setup for existing apps, workspace and package-manager detection, and configured component destinations. Bundle starter requirements using the UI package release version and verify packed starter builds in CI.
  
  Allow the React and React Native versions used by Expo SDK 58 while retaining React Native 0.81 compatibility.
- 6d9947a: Overhaul: safe-minor dependency updates with security fixes, layout-engine tests and tabs recursion fix, unified theme accents, dialog/modal correctness, WAI-ARIA wiring and overlay positioning, form control keyboard contracts, chart/toast/menu/select extras, CLI add/list/apply/create/migrate commands, component registry pipeline, release automation, and web preview fixes.
- ec8a26b: Copy only referenced shared files in configured web and native projects. Report dependencies and package-manager install commands from the selected source files, including dry runs. Preserve shared files during subset component updates and verify standalone owned Button builds without the UI package installed. Registry versions now follow the public UI package version rather than the private workspace version.
- 12609cc: Track installed component originals and registry versions, preview changes with diff, and merge updates while preserving local edits. Back up applied changes and support explicit manual conflict resolution without writing conflict markers into component files.

### Patch Changes

- 2a6cf6c: Connect direction context to Radix keyboard navigation, prevent disabled slotted Button activation, preserve form accessibility links and indeterminate checkbox resets, and improve built-in text contrast with separate destructive foregrounds and opaque hover colors. Add server-rendering, hydration, ref, form, keyboard, and rendered-color regression checks. Refresh the CLI's bundled component sources and dependency metadata.
- 2bb26bb: Present native Select, DropdownMenu, Popover and Combobox content in anchored modal surfaces with viewport collision handling, RTL alignment, keyboard avoidance and outside/system dismissal. Support native SelectTrigger asChild composition and preserve trigger refs and cancellable press handlers. The CLI bundles the updated source and shared overlay helpers.
  
  Pin the Expo starter to the verified SDK patch so fresh installs do not select an Expo release that depends on an unpublished CLI version.
- fe1172e: Replace native Carousel's static slide view with native paging, reliable navigation, controlled selection, live API events and portable forwarded refs. Native conditional API types now describe the native pager rather than Embla's DOM engine. Migrate native consumers to NativeCarouselApi; unsupported Embla options, looping and plugins are rejected explicitly. Web Carousel remains on Embla with its existing API. The CLI includes the updated owned sources, verified alongside packaged components in Expo.
- ea84182: Correct native control, selection, tab and dialog interaction contracts, and align native chart bars with their labels. Preserve host instance ref types across React Native 0.81 and 0.88. The CLI bundles the updated component sources.
- f9de12c: Support native OTP focus movement, backspace navigation, paste and autofill text delivery, with bounded contiguous values, controlled state and forwarded TextInput refs. The CLI bundles the updated sources, and the Expo consumer gate compiles both packaged and owned OTP implementations.
- d5293c3: Use anchored native modal surfaces for ContextMenu, HoverCard, Tooltip and NavigationMenu, with collision-aware positioning, outside/system dismissal, and guarded child handler/ref/style composition. NavigationMenu anchors each item independently. Native HoverCard and Tooltip use tap-toggle interaction; ContextMenu opens on long press. Keep Tooltip's Text ref, route accessibility escape through its overlay surface across supported React Native versions, and add containerStyle for surface geometry. Honor native Command filtering and cancellable selection while retaining its inline layout. The CLI includes the corrected owned sources.
- abb5341: Support native Resizable handle dragging and adjustable accessibility actions with bounded adjacent panel sizes, controlled layouts, RTL direction and change/commit callbacks. Include the updated source in CLI installs and verify both packaged and owned implementations in the Expo consumer.
- 98160d0: Fix native Sheet and Drawer disabled/cancelled presses, child handler and React 19 ref composition, and accessibility state. Add composed modal callbacks, labeled optional close controls, inherited RTL content direction, and Drawer root direction/dismissal configuration with content overrides. The CLI includes the same corrected owned sources. Native swipe gestures and snap points remain unsupported.
- 45ea0f4: Support native Slider dragging, stable range thumbs, min-relative step snapping, RTL and inverted axes, and per-thumb adjustable accessibility actions. Preserve controlled values and commit changed interactions once. The CLI bundles the updated sources, and the Expo gate compiles both packaged and owned sliders.
- d1d1927: Ship a standalone Node CLI with bundled component sources and a styled starter. Resolve copied component dependencies, skip unchanged files and test artifacts, and validate requests before writing.
  
  Resolve React Native component subpaths to native implementations and declarations, remove the web carousel engine from native runtime imports, improve native dialog accessibility, and connect Tailwind radius utilities to theme tokens.
- 00fb596: Repair web styling and interactions: use semantic border defaults, inherit icon colors from surrounding text, keep destructive toast text and controls legible, and prevent uncontrolled OTP inputs from receiving conflicting value props. Fit charts to their containers, keep inline command lists from scrolling the page on mount, and show closed combobox values before their first open. The CLI includes the corrected owned sources.
  
  Rework the Overview dashboard with compact mobile metric cards, a single page gutter, visible activity bars, and an update feed that wraps long titles without squeezing timestamps. Keep search and repository actions available on phones.
- Updated dependencies [6d9947a]
  - @luseefor/synthex-core@1.2.0
