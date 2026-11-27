# Consumer MV3 Integration Guide — `@yours/ui`

`@yours/ui` is engineered specifically for Chrome Extension **Manifest V3** side panels (`340px–440px`), strict Content Security Policies, tree-shaken ESM bundles, and accessible keyboard/screen-reader/RTL/high-contrast workflows.

---

## 1. Strict MV3 CSP (`script-src 'self'; style-src 'self'`)

- **Zero inline `style=` attributes:** Meters (`AudioLevelMeter`), segmented bars (`StorageQuotaCard`, `ContextBudgetMeter`), diff/code blocks, and icons render pure CSS classes or SVG geometry attributes — never `style={{ ... }}`.
- **Zero `dangerouslySetInnerHTML`:** All 48 Aperture SVG icons render typed React SVG primitives from `dist/icons/iconData.js`, and Markdown rendering in `StreamingResponse` parses purely into React elements.
- **Bundled Stylesheets:** Import `@yours/ui/styles` (or load `@yours/ui/styles/tokens.css` + `@yours/ui/styles/components.css` as static extension assets). No external CDN fonts or style tags are injected at runtime.

```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'; style-src 'self'"
  }
}
```

---

## 2. Subpath Imports & Tree-Shaking Isolation

Import only the subpaths your surface needs (`"sideEffects": ["**/*.css"]` keeps pure JS exports tree-shakeable):

| Subpath | Contents |
| :--- | :--- |
| `@yours/ui/styles` | `tokens.css` (CSS variables) + `components.css` (`.yui-*` classes) |
| `@yours/ui/icons` | `ApertureIcon`, `APERTURE_ICON_NAMES`, 50 `*Icon` bindings (`ThinkIcon`, `TurboIcon`, ...), `MatrixOrb`, `NotchEar`, `YoursMark` |
| `@yours/ui/layout` | `SidePanelShell`, `TopNotch`, `HookSidebarList`, `NotchDrawerSearch`, `NotchOptionRow`, `NotchStatusPill`, `GreenLed` |
| `@yours/ui/components` | Chat stream, composer, `ActionBar` (`leftSlot`), `MessageSourcesPill` (`MessageSources`), `CitationChip`, `SourcePreviewPopover`, `SourceFavicon`, `AgentStepsCard`, `StepTree`, `AgentStepRow`, `SearchModal`, `WebSearch` (`WebSearchActivity`), `FindInThreadBar`, `InlineToolStatus`, `ToolTraceList`, `WebSearchSourcesStrip`, `StorageQuotaCard`, `ModelParametersCard`, `NetworkAuditCard`, `SitePermissionsList`, `AgentHandoffCard`, `ConfirmActionCard`, `PageSelectionCard`, `DeviceCapabilityCard`, `OfflineStatusBanner`, `SessionCheckpointCard`, drawers, overlays |
| `@yours/ui/genui` | All 10 side-panel Generative UI cards (`CompareTable`, `ChecklistCard`, `PageBriefCard`, `DraftCard`, `EntitySummaryCard`, `ChoicePromptCard`, `MetricStripCard`, `PageActionCard`, `TimelineCard`, `QuoteExcerptCard`) |
| `@yours/ui` | Convenience root re-export barrel |

---

## 3. Theme Tokens (`light` / `dark` / `system`)

- Pass `theme="system" | "light" | "dark"` on `<SidePanelShell />`, or set `data-theme="light"` / `data-theme="dark"` on a container.
- Without `data-theme`, `tokens.css` automatically tracks `@media (prefers-color-scheme: dark)`.
- Light mode uses Cotton Paper (`#FFFFFF` / `#F2EFE9` / `#141413` ink / `#6F6D68` muted); Dark mode uses Anodized Obsidian (`#08080A` / `#121215` / `#F4F3EF` ink / `#8C8A84` muted).

---

## 4. Guardrails, Preflight & Selection Primitives (Milestones #22–#24)

- **`SitePermissionsList`:** Local per-origin permission ledger stacking each origin above `Off` / `Once` / `Site` (`SegmentedControl`), with `lockedReason` disabling persistent site-wide access on sensitive checkout/banking origins and optional two-step `confirmRevokeAll` focusing `Cancel` with `Escape` restoration back to `Revoke all`.
- **`AgentHandoffCard`:** Tactile human-in-the-loop pause/takeover card for login walls, CAPTCHAs, or checkout steps (`waiting` pulsing amber badge vs. `user-active` calm status, `onTakeOver`, `onResume`, `onCancel`).
- **`ConfirmActionCard`:** High-stakes local confirmation card (`danger` / `amber`), summary rows, optional typed phrase check (`confirmPhrase`), pointer & `Space`/`Enter` keyboard hold-to-confirm (`holdDurationMs` with idle caption `holdHintLabel` and `prefers-reduced-motion` static countdown `role="status"`), `Escape` cancel, and initial focus on `Cancel`.
- **`PageSelectionCard`:** Minimalist Paper Page 9 pinned tab selection card displaying origin, optional section `locator`, 3-line clamped quote with accessible `Expand`/`Collapse` toggle (`aria-expanded`), `tokenEstimate` badge, `Show on page` (`onLocate`), and `Remove` (`onDismiss`).
- **`DeviceCapabilityCard`:** Local WebGPU readiness & model-fit preflight card displaying adapter/VRAM/RAM/OPFS rows paired with non-color-only status icons + text (`ready` / `tight` / `unsupported`), zero-inline-style SVG headroom bar (`CardSegmentBar`), `aria-pressed` model tier quick-actions (`onSelectTier`), and `aria-busy` `Re-check` action (`onRecheck`).
- **`OfflineStatusBanner`:** Compact monochrome/amber status strip (`online` | `offline-ready` | `offline-degraded` | `sync-paused`) with `role="status"` / `aria-live="polite"` making explicit that `100%` local WebGPU inference stays available offline while web-search tools pause, with optional `Local-only` and `Retry` buttons.
- **`SessionCheckpointCard`:** Compact conversation checkpoint & rewind card showing saved timestamp, turn count, pinned-tab count, and context-budget snapshot, plus `Branch from here` and inline-confirmed `Restore checkpoint` (`Cancel` auto-focus + `Escape` restoration).
- **`ToolStatusIcon`, `ShimmerText`, `InlineToolStatus` & `ToolTraceList` (`ToolChain`) / `ToolStepCard`:** Clean-room, CSS-animated 24x24 Aperture-matched tool status glyphs (`12` states: `thinking`..`error`), pure-CSS `background-clip: text` glare-swept typography (`ShimmerText` via `--yui-shimmer-ink` / `--yui-shimmer-shine`), borderless 32px inline status strips (`InlineToolStatus` with rotating icons, blur-crossfade labels, CSS-class hidden broken favicons, and `1s` -> `Worked for Xs` / `Failed after Xs` timers), and hairline vertical timeline tool chains (`ToolTraceList` / `ToolChain` defaulting to `variant="inline"`, auto-collapsing when settled unless `defaultCollapsed={false}`) alongside inline/card `ToolStepCard`.
- **`MessageSourcesPill` (`MessageSources`), `CitationChip`, `SourcePreviewPopover`, `SourceFavicon` & `ActionBar` (`leftSlot`):** Compact sources capsule (`<= 3` distinct-domain favicons with smooth CSS hover/open fan-out, opening one `< 1 / N >` preview popover with `ArrowLeft`/`ArrowRight` navigation, external `noopener noreferrer` links or `onSelectSource` without `"Show on page"`, truncated URL, 3-line clamped snippet, and CSP-safe explicit `https:` / `data:image/` favicon or monogram fallback), plus `16px` monospace `CitationChip` pills and `ActionBar` `leftSlot` inline footer mounting.
- **`AgentStepsCard`, `StepTree`, `StepTreeItem` & `AgentStepRow`:** Unified collapsible work timeline grouping reasoning and intermediate tool steps above the final answer — staying expanded while active with shimmer header and `1px` `StepTree` elbow connectors, then auto-collapsing cleanly once `hasFinal` transitions to `true` unless manually toggled.
- **`WebSearchSourcesStrip` & `SourcesDrawer` (`variant="inline"`):** Inline borderless web-search source strip matching `InlineToolStatus` and `ToolTraceList`: overlapping `16px` stacked domain favicons with CSS `.is-hidden` broken-image monogram fallback, `Searched N sites` disclosure trigger (`aria-expanded`, `aria-controls`), responsive 2-column -> 1-column (`@container (max-width: 340px)`) source card grid, safe `https?:` link handling (`rel="noopener noreferrer"`), and `+N more` reveal. Pass `variant="inline"` on `SourcesDrawer` to render the same inline strip.
- **Speculative & Quantized Hardware Telemetry (`SpeedMetricsSummary` / `ActionBar` & `HardwareStatusStrip`):** Optional `speedupMultiplier`, `acceptedTokPerStep`, `specModeLabel`, `draftEngineLabel`, and `vramDeltaLabel` on `SpeedMetricsSummary`, plus `speedupLabel`, `acceptedTokLabel`, `specModeLabel`, `draftEngineLabel`, `vramDeltaLabel`, and `telemetryChips` on `HardwareStatusStrip`, render compact `tabular-nums` `.yui-telem-chip` pills with forced-colors high-contrast support and automatic narrow wrapping (`320px`/`340px`).

---

## 5. Keyboard Navigation, Modal Focus Containment & High-Contrast Focus

- **Modal Focus Trap & Restoration (`src/utils/focus.ts`):** `CommandPalette`, `FloatingContextSheet`, modal `ShortcutSheet` (when `open` is provided), and `TopNotch` drawer move initial focus inside, trap `Tab`/`Shift+Tab` strictly across enabled visible controls, and restore focus to the trigger element on `Escape`, close buttons, or clicking `.yui-veil`.
- **Roving Focus & Default Safe Actions:** `SegmentedControl` and `ModelRosterList` implement roving `tabIndex` with `ArrowLeft`/`ArrowRight`/`ArrowUp`/`ArrowDown` (plus `Home`/`End` on `SegmentedControl`). `ConfirmActionCard`, `SitePermissionsList` (`confirmRevokeAll`), and `SessionCheckpointCard` (`confirmRestore`) default initial focus cleanly to `Cancel`.
- **WCAG AA Focus Outline Contrast:** Interactive `.yui-*` controls use high-contrast `--yui-cobalt` focus outlines (`2px solid var(--yui-cobalt)`, `#1D4ED8` in Light and `#60A5FA` in Dark, `>= 5.5:1` contrast) and System `Highlight` under `forced-colors: active`.

---

## 6. CSS `@container` Reflow (`320px`–`440px`), `dir="rtl"`, `forced-colors` & `prefers-reduced-motion` Contracts

- **Container-Query Adaptation (`.yui-shell` & `.yui-surface`):** `.yui-shell` and `.yui-surface` set `container-type: inline-size;`, scoping `@container (max-width: 340px)`, `@container (max-width: 380px)`, and `@container (max-width: 420px)` reflow rules to the panel container rather than `window.innerWidth` so embedded `320px`/`360px` side panels inside wide `1280px+` windows adapt cleanly with `0px` overflow.
- **Viewport Range (`320px–440px`):** All primary panels (`permissions`, `storage`, `controls`, `templates`, `voice`, `preflight`, `resilience`) and container-width audits guarantee zero horizontal overflow, zero inline `style=` attributes, and Light & Dark WCAG AA contrast (`>= 4.5:1` body text, `>= 3.0:1` muted labels and UI controls).
- **Forced Colors (`@media (forced-colors: active)`):** Cards, badges, progress bars, switches, timeline dots, quote rules, and `:focus-visible` outlines map cleanly to CSS system colors (`Canvas`, `CanvasText`, `ButtonFace`, `ButtonText`, `Highlight`, `HighlightText`, `GrayText`).
- **Reduced Motion (`@media (prefers-reduced-motion: reduce)`):** WAAPI spring animations (`HookSidebarList`, `SegmentedControl`, `StreamingResponse`) clamp immediately to target state, CSS animations/transitions/scroll-behavior disable globally across `.yui-*` (`animation: none !important; transition: none !important`), and `ConfirmActionCard` announces remaining hold time in a static `role="status"` readout without layout shift.
- **RTL (`dir="rtl"`):** Directional spacing, alignments, and quote accent rules use CSS logical properties (`inset-inline`, `margin-inline-start`, `padding-inline-start`/`end`, `border-inline-start`, `text-align: start`/`end`), while geometric SVG notch assemblies (`TopNotch`) and diff/code blocks preserve structural LTR readability (`direction: ltr`).
