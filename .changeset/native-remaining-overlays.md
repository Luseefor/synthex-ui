---
"synthex-ui": minor
"@luseefor/synthex-cli": patch
---

Use anchored native modal surfaces for ContextMenu, HoverCard, Tooltip and NavigationMenu, with collision-aware positioning, outside/system dismissal, and guarded child handler/ref/style composition. NavigationMenu anchors each item independently. Native HoverCard and Tooltip use tap-toggle interaction; ContextMenu opens on long press. Keep Tooltip's Text ref, route accessibility escape through its overlay surface across supported React Native versions, and add containerStyle for surface geometry. Honor native Command filtering and cancellable selection while retaining its inline layout. The CLI includes the corrected owned sources.
