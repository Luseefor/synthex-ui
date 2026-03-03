export const BUILDER_CSS = `
.bld {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: flex;
  width: 100vw;
  min-width: 0;
  height: 100dvh;
  overflow: hidden;
  flex-direction: column;
  isolation: isolate;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--sx-color-background-subtle) 92%, transparent) 0%,
    var(--sx-color-background) 18rem
  );
  font-family: var(--sx-font-family-sans);
}

.bld-tb {
  display: flex;
  min-height: 52px;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 0 14px;
  border-bottom: 1px solid color-mix(in srgb, var(--sx-color-border) 82%, transparent);
  background: color-mix(in srgb, var(--sx-color-surface) 90%, transparent);
  backdrop-filter: blur(16px);
  flex-shrink: 0;
}

.bld-tb-l,
.bld-tb-r {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bld-tb-brand {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 10px;
  padding: 0 4px;
}

.bld-tb-logo {
  width: 30px;
  height: 30px;
  flex: 0 0 auto;
  border-radius: 10px;
  object-fit: cover;
}

.bld-tb-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  line-height: 1;
}

.bld-tb-t {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.bld-tb-sub {
  margin-top: 3px;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--sx-color-foreground-muted);
}

.bld-tb-c {
  padding-left: 8px;
  border-left: 1px solid var(--sx-color-border);
  font-size: 11px;
  color: var(--sx-color-foreground-muted);
}

.bld-b {
  display: inline-flex;
  height: 30px;
  align-items: center;
  gap: 5px;
  padding: 0 11px;
  border: 1px solid color-mix(in srgb, var(--sx-color-border) 86%, transparent);
  border-radius: var(--sx-radius-md);
  background: color-mix(in srgb, var(--sx-color-surface) 94%, transparent);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  color: var(--sx-color-foreground);
  cursor: pointer;
  font-size: 11px;
  font-weight: 600;
  transition: all 120ms;
  white-space: nowrap;
}

.bld-b:hover {
  border-color: var(--sx-color-border-strong);
  background: var(--sx-color-surface-raised);
}

.bld-b:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.bld-b-on {
  border-color: var(--sx-color-primary);
  background: var(--sx-color-primary-muted);
  color: var(--sx-color-primary);
}

.bld-b-pri {
  border-color: var(--sx-color-primary);
  background: var(--sx-color-primary);
  color: var(--sx-color-foreground-on-brand);
}

.bld-b-red {
  color: var(--sx-color-destructive);
}

.bld-bd {
  display: flex;
  min-height: 0;
  flex: 1;
  overflow: hidden;
}

.bld-s {
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  overflow: hidden;
  background: color-mix(in srgb, var(--sx-color-surface) 94%, transparent);
  backdrop-filter: blur(14px);
}

.bld-sl {
  width: 220px;
  border-right: 1px solid color-mix(in srgb, var(--sx-color-border) 84%, transparent);
}

.bld-sr {
  width: 272px;
  border-left: 1px solid color-mix(in srgb, var(--sx-color-border) 84%, transparent);
}

.bld-sh {
  display: flex;
  min-height: 36px;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  border-bottom: 1px solid color-mix(in srgb, var(--sx-color-border) 84%, transparent);
  color: var(--sx-color-foreground-muted);
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.bld-ss {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.bld-search {
  width: 100%;
  height: 32px;
  margin-bottom: 8px;
  padding: 0 10px;
  border: 1px solid color-mix(in srgb, var(--sx-color-border) 88%, transparent);
  border-radius: var(--sx-radius-md);
  background: color-mix(in srgb, var(--sx-color-background) 96%, transparent);
  color: var(--sx-color-foreground);
  font-size: 11px;
  outline: none;
}

.bld-cg {
  margin-bottom: 2px;
}

.bld-ch {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 5px;
  padding: 4px 6px;
  border: none;
  border-radius: var(--sx-radius-sm);
  background: none;
  color: var(--sx-color-foreground-muted);
  cursor: pointer;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.bld-ca {
  width: 10px;
  font-size: 9px;
  text-align: center;
}

.bld-cc {
  margin-left: auto;
  font-size: 9px;
  opacity: 0.5;
}

.bld-cl {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 1px 0 4px;
}

.bld-di {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border: 1px solid transparent;
  border-radius: calc(var(--sx-radius-sm) + 2px);
  background: transparent;
  color: var(--sx-color-foreground);
  cursor: grab;
  font-size: 11px;
  text-align: left;
  transition: background 80ms, border-color 80ms, transform 80ms;
}

.bld-dic {
  display: inline-flex;
  width: 20px;
  height: 20px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 3px;
  background: var(--sx-color-background-subtle);
  color: var(--sx-color-foreground-muted);
  font-size: 10px;
}

.bld-cv {
  position: relative;
  flex: 1;
  overflow: hidden;
  background:
    radial-gradient(circle at top, color-mix(in srgb, var(--sx-color-primary) 8%, transparent) 0%, transparent 42%),
    var(--sx-color-background-subtle);
}

.bld-cv-pv {
  background: var(--sx-color-background);
}

.bld-cv-shell {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: stretch;
  justify-content: stretch;
  padding: 24px;
}

.bld-cv-shell-pv {
  padding: 0;
}

.bld-stage {
  position: relative;
  width: 100%;
  min-width: 0;
  min-height: 0;
  height: 100%;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--sx-color-border) 78%, transparent);
  border-radius: calc(var(--sx-radius-xl) + 2px);
  background: color-mix(in srgb, var(--sx-color-surface) 94%, transparent);
  box-shadow:
    0 18px 40px rgba(15, 23, 42, 0.08),
    inset 0 0 0 1px rgba(255, 255, 255, 0.03);
}

.bld-stage-grid {
  background-image:
    linear-gradient(to right, color-mix(in srgb, var(--sx-color-border) 40%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in srgb, var(--sx-color-border) 40%, transparent) 1px, transparent 1px);
  background-position: 0 0;
  background-size: 20px 20px;
}

.bld-stage-pv {
  border: none;
  border-radius: 0;
  background: var(--sx-color-background);
  box-shadow: none;
}

.bld-preview-wrap {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: var(--sx-color-background);
}

.bld-preview-scale {
  flex: none;
  transform-origin: center center;
  will-change: transform;
}

.bld-preview-frame {
  position: relative;
  overflow: hidden;
  width: 100%;
  max-width: 100%;
  max-height: 100%;
  border: none;
  border-radius: 0;
  background: var(--sx-color-background);
  box-shadow: none;
}

.bld-mt {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: var(--sx-color-foreground-muted);
  pointer-events: none;
}

.bld-mt-i {
  margin-bottom: 10px;
  color: var(--sx-color-primary);
  font-size: 32px;
  opacity: 0.2;
}

.bld-mt-t {
  margin-bottom: 4px;
  color: var(--sx-color-foreground);
  font-size: 14px;
  font-weight: 600;
}

.bld-mt-d {
  max-width: 240px;
  font-size: 12px;
  line-height: 1.5;
  text-align: center;
}

.bld-rz {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 12px;
  height: 12px;
  border-radius: 4px 0 var(--sx-radius-md) 0;
  background: var(--sx-color-primary);
  cursor: nwse-resize;
  opacity: 0.72;
}

.bld-mv {
  position: absolute;
  top: -14px;
  left: 0;
  z-index: 2;
  display: inline-flex;
  height: 24px;
  align-items: center;
  padding: 0 9px;
  border: 1px solid color-mix(in srgb, var(--sx-color-border) 72%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--sx-color-surface) 96%, transparent);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.12);
  color: var(--sx-color-foreground-muted);
  cursor: grab;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.bld-ns {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 8px;
  padding-top: 48px;
  color: var(--sx-color-foreground-muted);
  font-size: 11px;
  text-align: center;
}

.bld-ns-i {
  font-size: 22px;
  opacity: 0.2;
}

.bld-p {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.bld-sec {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 0;
  border-top: 1px solid color-mix(in srgb, var(--sx-color-border) 84%, transparent);
}

.bld-sec-t {
  color: var(--sx-color-foreground-muted);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.bld-pg {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
}

.bld-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding-top: 6px;
}

.bld-ps {
  display: inline-flex;
  height: 26px;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
  border: 1px solid color-mix(in srgb, var(--sx-color-border) 86%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--sx-color-surface) 92%, transparent);
  color: var(--sx-color-foreground-muted);
  cursor: pointer;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.bld-ps-on {
  border-color: var(--sx-color-primary);
  background: color-mix(in srgb, var(--sx-color-primary) 10%, var(--sx-color-surface));
  color: var(--sx-color-primary);
}

.bld-pf {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.bld-pf-l {
  color: var(--sx-color-foreground-muted);
  font-size: 10px;
  font-weight: 500;
}

.bld-i {
  height: 28px !important;
  font-size: 11px !important;
}

.bld-panel-backdrop {
  position: absolute;
  inset: 0;
  z-index: 25;
  border: 0;
  background: rgba(15, 23, 42, 0.44);
  backdrop-filter: blur(4px);
}

.bld-panel-shell {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 30;
  display: flex;
  max-height: min(80dvh, 42rem);
  flex-direction: column;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--sx-color-border) 82%, transparent);
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  background: color-mix(in srgb, var(--sx-color-surface) 96%, transparent);
  box-shadow: 0 -18px 48px rgba(15, 23, 42, 0.24);
}

.bld-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-bottom: 1px solid color-mix(in srgb, var(--sx-color-border) 84%, transparent);
}

.bld-panel-copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.bld-panel-eyebrow {
  color: var(--sx-color-foreground-muted);
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.bld-panel-close {
  display: inline-flex;
  height: 32px;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  border: 1px solid color-mix(in srgb, var(--sx-color-border) 84%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--sx-color-surface) 94%, transparent);
  color: var(--sx-color-foreground);
  font-size: 11px;
  font-weight: 700;
}

@media (max-width: 767px) {
  .bld-tb {
    min-height: 0;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 10px;
    padding: calc(env(safe-area-inset-top, 0px) + 10px) 12px 10px;
  }

  .bld-tb-l,
  .bld-tb-r {
    width: 100%;
    flex-wrap: wrap;
  }

  .bld-tb-brand {
    flex: 1;
  }

  .bld-tb-sub {
    display: none;
  }

  .bld-tb-c {
    margin-left: auto;
  }

  .bld-b {
    height: 34px;
    padding: 0 12px;
    font-size: 12px;
  }

  .bld-cv-shell {
    padding: 12px;
  }

  .bld-cv-shell-mobile {
    padding: 10px;
  }

  .bld-stage-mobile {
    border-radius: calc(var(--sx-radius-xl) + 6px);
  }

  .bld-mv {
    top: -16px;
    height: 28px;
    padding: 0 10px;
    font-size: 11px;
  }

  .bld-rz {
    width: 18px;
    height: 18px;
  }

  .bld-s {
    width: 100%;
    border: none;
    background: transparent;
    backdrop-filter: none;
  }

  .bld-sh {
    min-height: 40px;
    padding: 0 14px;
  }

  .bld-ss {
    padding: 10px 14px 14px;
  }

  .bld-search {
    height: 38px;
    font-size: 13px;
  }

  .bld-ch {
    padding: 8px 6px;
    font-size: 11px;
  }

  .bld-di {
    padding: 10px 12px;
    cursor: pointer;
    font-size: 13px;
  }

  .bld-dic {
    width: 24px;
    height: 24px;
    font-size: 12px;
  }

  .bld-pg {
    grid-template-columns: 1fr;
  }

  .bld-pf-l,
  .bld-sec-t {
    font-size: 11px;
  }

  .bld-i {
    height: 38px !important;
    font-size: 13px !important;
  }
}
`;
