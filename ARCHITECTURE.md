# Architecture — `@yours/ui`

## Design Principles

1. **Tactile Localism × Rare UI Minimalism**
   - Light mode renders on **Cotton Paper** (`#FFFFFF` outer bezel, `#F2EFE9` recessed stage, `#FFFFFF` elevated capsules, `#141413` ink, `#5C5B57` secondary, `#6F6D68` WCAG-verified muted ink).
   - Dark mode renders on **Anodized Obsidian** (`#08080A` outer bezel, `#121215` recessed stage, `#1A1A1E` capsules, `#F4F3EF` ink, `#A1A09A` secondary, `#8C8A84` WCAG-verified muted ink).
   - Theme switching works automatically via `prefers-color-scheme: dark` and explicitly via `<SidePanelShell theme="light" | "dark" | "system">` (`[data-theme="light" | "dark"]`).

2. **Top-Center Dynamic Island Notch & Shell Layering (`SidePanelShell` + `TopNotch`)**
   - `TopNotch` nests inside `SidePanelShell` using two `14x14` concave `NotchEar` SVGs overlapping by `-0.5px` so high-DPR spring animations never produce subpixel gaps.
   - CSS state transitions:
     - **Resting:** `144px × 36px` bar showing 4 pure `14.5px` Aperture icons.
     - **Hover / Focus-Within:** Fluid spring (`cubic-bezier(0.22, 1.15, 0.36, 1)`) widens to `272px × 52px` and reveals 1-word labels.
     - **Click-Expanded Drawer:** Smooth CSS Grid row reveal (`grid-template-rows: 0fr -> 1fr`) drops down into a `272px` unified overlay housing (`HookSidebarList`, `NotchDrawerSearch`, or Model/Speed/OPFS controls) over a click-dismissable `.yui-veil` scrim.
   - `SidePanelShell` exposes `overlay`, `sheet`, and elevated `toast` (`z-index: 45`, hit-testable above `.yui-veil`) regions plus `ResizeObserver`-backed scroll-edge fades topped by an `84px` two-stop (`52%` solid) top cap protecting content scrolling beneath `TopNotch`.

3. **Zero Unsafe DOM, Focus Containment & Strict MV3 CSP Compliance**
   - `scripts/generate-icons.mjs` parses all 48 `src/icons/*.svg` files into typed React SVG element descriptors (`src/icons/iconData.ts`) — zero `dangerouslySetInnerHTML`, zero JSX `style=` attributes, zero external font/script runtime dependencies.
   - [`src/utils/focus.ts`](src/utils/focus.ts) provides lightweight keyboard focus containment (`Tab`/`Shift+Tab`) and cleanup focus restoration (`Escape` / backdrop `.yui-veil` click / unmount) across `CommandPalette`, `ShortcutSheet` (modal mode), `FloatingContextSheet`, and `TopNotch`.
   - [`src/utils/clipboard.ts`](src/utils/clipboard.ts) shares timer-safe copy confirmation (`useCopyFeedback`) across copyable cards without duplicating state boilerplate.
   - Build output removes stale `dist/` artifacts (`prebuild`), compacts emitted `.js` ASTs (`esbuild` `es2022` minification with TS printer fallback), minifies `dist/styles/*.css` while preserving full `.d.ts` documentation, and enforces Chrome MV3 bundle budgets via `npm run check:size` (`<= 80.00 KB` JS gzip and `<= 19.00 KB` CSS gzip).
   - Verified under strict CSP (`script-src 'self'; style-src 'self'`) with full Light & Dark WCAG AA contrast assertions (including `--yui-cobalt` `:focus-visible` rings), `320px`/`340px`/`380px`/`400px` overflow/geometry audits, `dir="rtl"`, `@media (forced-colors: active)`, `@media (prefers-reduced-motion: reduce)` layout-shift/animation checks, and Playwright keyboard navigation (`Tab`/`Shift+Tab`, `Escape` focus restoration, `SegmentedControl` roving arrows) in `scripts/visual-specimen.mjs`.

4. **Directory Structure**
   - `src/icons/` — Compact encoded Aperture 48-icon React bindings (`generate-icons.mjs` -> `iconData.ts`) + `MatrixOrb`, `NotchEar`, `YoursMark`.
   - `src/layout/` — `SidePanelShell`, `TopNotch`, `HookSidebarList`, `NotchPrimitives` (`NotchDrawerSearch`, `NotchOptionRow`, `NotchStatusPill`, `GreenLed`).
   - `src/components/` — Composer, streaming markdown/GFM pipe-table responses, consolidated `VoicePrimitives` (`AudioLevelMeter`, `VoiceDictationPill`, `VoiceSessionBar`, `VoiceSessionCard`), `CardChrome` shared helpers, guardrail & handoff cards (`SitePermissionsList`, `AgentHandoffCard`, `ConfirmActionCard`), selection & WebGPU preflight (`PageSelectionCard`, `DeviceCapabilityCard`), tool traces, context/storage/parameter/audit cards, command overlays, drawers, and data/settings controls.
   - `src/genui/` — 10 structured side-panel-native Generative UI cards (`CompareTable`, `ChecklistCard`, `PageBriefCard`, `DraftCard`, `EntitySummaryCard`, `ChoicePromptCard`, `MetricStripCard`, `PageActionCard`, `TimelineCard`, `QuoteExcerptCard`).
   - `src/utils/` — Zero-dependency `focus.ts` (`useFocusTrap`) and `clipboard.ts` (`useCopyFeedback`) hooks.
   - `src/styles/` — Design tokens (`tokens.css`) and scoped component stylesheet (`components.css`).
