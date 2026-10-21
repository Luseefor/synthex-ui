# Component contracts

This reference describes `ace/component-contracts`, an upcoming UI patch.
The checks below are regression coverage for specific components and behaviors.
They do not certify every component, browser, assistive technology, or custom theme.

## Controls and forms

Button, Input, Textarea, Checkbox, Switch, and directional widget tests check
forwarded DOM refs and focus. A Button defaults to `type="button"`; use an
explicit `type="submit"` or `type="reset"` inside forms. With `asChild`, its ref
points to the child element. Disabled slotted links expose `aria-disabled`,
leave the tab order, and block click and Enter/Space activation, including
child handlers. Enabled children retain their handlers and classes.

Controlled inputs follow their supplied value and notify the parent; default
values initialize uncontrolled inputs. Uncontrolled Checkbox and Switch
participate in native form submission and reset. An indeterminate Checkbox
returns to its initial mixed state on reset. Controlled state remains the
parent's responsibility, including during reset.

FormLabel and FormControl share a generated ID. Caller-supplied description
IDs are merged with the field's description and error IDs. Missing descriptions
do not produce a default dangling reference. Children-only FormDescription and
FormMessage content registers after mounting and unregisters when removed.
Supply `FormField description`/`error` metadata when those links must appear in
server-rendered HTML, and render the corresponding description/message parts.

Explicit IDs and `required`/ARIA overrides remain supported. If you give
FormControl a custom ID, supply the same `htmlFor` to FormLabel. React Hook
Form validation errors continue through FormMessage and the control's ARIA
attributes. Explicit ARIA overrides are the application's responsibility.

## Keyboard and direction

DirectionProvider supplies both DOM direction and Radix's direction context.
Horizontal Tabs, RadioGroup, and Accordion tests check RTL arrows and disabled
item skipping; vertical navigation retains its vertical keys. Tabs manual
activation keeps selection unchanged until activation. Controlled direction
changes take effect when the parent updates `dir`.

Chromium checks send real keyboard events for RTL navigation and dialog focus
containment. Tab and Shift+Tab wrap inside the tested dialog; Escape restores
focus to its trigger. Radio checks hold the arrow until Radix's deferred focus
move completes before releasing it. See [Radix's direction guidance](https://www.radix-ui.com/primitives/docs/utilities/direction-provider).

## Themes and server rendering

Built-in theme tests measure all nine accents in light and dark mode. Normal
and muted foreground pairs, primary/hover text, and destructive/hover text
meet the tested 4.5:1 normal-text threshold. Browser checks also measure the
computed colors on Button and destructive Badge at rest and hover, so a
cascade override cannot pass solely through token tests. The method follows
[WCAG's contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum).

Primary and destructive fills have separate foreground tokens. Light violet,
rose, and destructive fills use darker shades; pale accents and bright dark-mode
fills use dark text where appropriate. Button and Badge hover use the opaque
hover tokens. Base resets sit in Tailwind's base layer so utility colors win.
Explicit custom foregrounds are preserved. CSS functions/variables and arbitrary
custom color combinations need application contrast checks; automatic text
selection only measures supported hex colors.

Node tests render controls without `window` or `document`. A dev-only fixture
renders HTML in Node and hydrates it in Chromium, checking ID/label associations,
interactive controls, and recovery errors against [React's hydration contract](https://react.dev/reference/react-dom/client/hydrateRoot).

ThemeProvider still synchronizes document-root tokens for portals using the
existing last-effect behavior. Simultaneously mounted nested providers and
outer updates can change the tokens used by body portals. Use a single global
provider for a shared portal theme; independent nested portal themes remain a
limitation. See [native capabilities](./native-capabilities.md) and the
[device validation checklist](./native-device-validation.md) for native source
contracts and pending device checks. Native screen-reader behavior and
non-text/focus contrast across all components remain unverified.

## Run the checks

```sh
bun run check-types
bun run test
cd packages/web-preview
bunx playwright test --project=chromium
```

The browser fixture is `/e2e/fixtures/contracts.html` on the Vite development
server. It is not a production application route.
