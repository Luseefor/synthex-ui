# Native carousel

Scope: `synthex-ui` 2.0, included in the v1.2 milestone. Web Carousel retains its existing Embla API. Native gesture and screen-reader checks remain pending device validation.

```tsx
import * as React from "react";
import { Text } from "react-native";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "synthex-ui/carousel";

export function Gallery() {
  const [index, setIndex] = React.useState(0);
  return (
    <Carousel index={index} onIndexChange={setIndex}>
      <CarouselContent style={{ height: 180 }}>
        <CarouselItem><Text>One</Text></CarouselItem>
        <CarouselItem><Text>Two</Text></CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
```

Metro selects the native implementation through the package's `react-native` condition. The native pager is a `ScrollView` with paging enabled: horizontal or vertical, one full-viewport slide per page. All slides stay mounted; inactive slides are hidden from accessibility. This replaces the old native placeholder that rendered only `items[index]` with a dead `api`.

## Props and options

Props from `CarouselSharedProps` (`carousel.types.native.ts`):

`children`, `orientation` (`horizontal` | `vertical`, default `horizontal`), `opts`, `plugins`, `setApi`, `dir` (`ltr` | `rtl`), `disabled`, `index` (controlled), `defaultIndex` (uncontrolled), `onIndexChange`, `animated`.

`NativeCarouselOptions` accepts only `startIndex` and `loop: false`. A non-empty `plugins` array, an unknown `opts` key, and `loop: true` are explicitly rejected. `startIndex` selects the initial page only.

Direction defaults to the inherited native direction context; an explicit `dir` overrides it. Horizontal paging under RTL uses reversed physical order with a positive LTR scroll coordinate (device pending). Vertical paging stays physical. Page spacing, snap offsets and content insets are managed by the pager; put spacing inside each `CarouselItem` rather than on `contentContainerStyle`. `disabled` blocks pager and button input. `animated` gates programmatic animation (see below).

## Native API

`CarouselApi`, `CarouselOptions`, and `CarouselPlugin` are native aliases, not the Embla engine. Web Embla types are unchanged; the native `react-native` condition corrects the previous alias that re-exported the shared (Embla) types, which is a breaking type change recorded in a major-version changeset.

The stable `NativeCarouselApi` provides:

`scrollTo(index, jump?)`, `scrollNext(jump?)`, `scrollPrev(jump?)`, `selectedScrollSnap()`, `scrollSnapList()`, `canScrollNext()`, `canScrollPrev()`, `on(event, listener)`, `off(event, listener)`.

`selectedScrollSnap()` is normalized; `scrollSnapList()` returns normalized snap ratios (for three slides: `[0, 0.5, 1]`). Events are `select` and `reInit`. `setApi` publishes the stable instance after mount. Callback replacement cleans up the old callback with `undefined` before notifying the new one; unmount also sends `undefined`.

## Controlled index and count

Use `defaultIndex` for uncontrolled use, or `index` with `onIndexChange` for controlled use. Controlled pagers render props with no optimistic index: a controlled correction that differs from the proposed index wins, and rejected programmatic requests realign to the rendered index.

When slides are removed, the index clamps to the remaining valid range. An empty carousel has index 0 and no visible page. Count normalization does not emit `onIndexChange`; once content is ready, count, keyed order, direction, orientation, viewport extent and control-mode changes emit `reInit`. Uncontrolled index clamps persist when slides return; controlled index continues to follow props. Drag release settles early only at an exact page with explicit zero velocity and no differing target offset. Otherwise the native momentum-end event commits selection. Events without velocity information also wait for momentum-end; custom native adapters must supply a zero velocity for stationary releases. Observers and scroll callbacks never cancel the native OS scroll.

`CarouselPrevious` / `CarouselNext` run the caller's `onPress` first; `defaultPrevented` guards the built-in step. `disabled` (pager or button) blocks the step.

## Animation and gestures

Programmatic `scrollTo` / `scrollNext` / `scrollPrev` animation honors `animated` and the shared `useReducedMotion` hook; reduced motion jumps without animating. User-drag physics are OS `ScrollView` behavior and are not claimed here.

No looping, no partial slides, no plugins, no DOM/Embla engine, and no hardware-keyboard contract are promised.

## Keyboard and accessibility

Previous/next controls are buttons. Only the selected slide is exposed to accessibility; horizontal RTL reverses physical page order. All slides are mounted; inactive slides are hidden from the accessibility tree. Native announcements, VoiceOver/TalkBack output, and gesture behavior require device validation (all pending).

## Verification

Source contract tests use mocked native hosts, and the pure helpers test index/offset mapping. The packed-consumer gate checks native types and exports iOS and Android bundles with packaged and copied components. These checks do not establish device gesture or screen-reader behavior.

```sh
bun --filter synthex-ui typecheck
bun --filter synthex-ui test
bun --filter synthex-ui build
bun --filter '@luseefor/synthex-cli' build
bun run native:check
```

Packaged fixture IDs: `carousel-horizontal`, `carousel-horizontal-content`, `carousel-horizontal-prev`, `carousel-horizontal-next`, `carousel-horizontal-index`, `carousel-remove-slide`, `carousel-restore-slides`, `carousel-disabled-toggle`, plus vertical counterparts (`carousel-vertical`, `carousel-vertical-content`, `carousel-vertical-prev`, `carousel-vertical-next`, `carousel-vertical-index`, vertical extent `height: 240`). Owned fixture IDs: `owned-carousel`, `owned-carousel-content`, `owned-carousel-prev`, `owned-carousel-next`, `owned-carousel-index`. See [device validation](./native-device-validation.md) for the pending checks. Paging frames and `ScrollView` negotiation still require device validation, and no device gesture or announcement pass is claimed.
