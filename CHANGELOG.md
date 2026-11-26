# Changelog

All notable milestones for **`@yours/ui`** are documented here.
The library targets Chrome MV3 side panels (`340px–440px`), maintains zero runtime dependencies, zero JSX inline `style` attributes, and zero `dangerouslySetInnerHTML`.

## Unreleased / Milestone 28 (PR #31)

- **MV3 Bundle Headroom Reclamation:** Consolidated compatible component modules (`GenUiCards`, `ChatMessagePrimitives`, `InlineToolStatus`, `ThreadHistoryList`, `FeedbackPrimitives`, `InlineCitationPopover`) and deduplicated `tokens.css` / `components.css` rules while preserving every public export and token ordering (`dist/` JS `196.28 KB` raw / `75.66 KB` gzip across `62` ESM modules; `dist/` CSS `109.79 KB` raw / `18.20 KB` gzip across `3` files).
- **Clean-Room Inline `WebSearchSourcesStrip` & `SourcesDrawer` (`variant="inline"`):** Added borderless inline web-search source disclosure strip matching `InlineToolStatus` and `ToolTraceList`: overlapping domain favicons with CSS `.is-hidden` broken-image monogram fallback, `"Searched N sites"` disclosure trigger, responsive `@container (max-width: 340px)` single-column reflow, safe `https?:` links (`noopener noreferrer`), `+N more` reveal, zero runtime deps, and zero inline `style=`.
- **Verification:** `typecheck`, `build`, `check:size`, `npm test` (`66/66`), and `verify:visual` (Light/Dark 340px/380px/400px/320px/RTL/forced-colors/contrast) passing.

## Milestone 27 (PR #30)

- Added clean-room animated SVG tool status icons (`ToolStatusIcon`, `ToolStatusKind` across 12 states: `thinking`, `reading`, `searching`, `researching`, `tabs`, `analyzing`, `calculating`, `writing`, `memory`, `done`, `blocked`, `error`) in `src/icons/ToolStatusIcons.tsx` with pure monochrome `currentColor`, semantic `done`/`blocked`/`error` draw-in/shake micro-motion, zero inline `style=` attributes, and static `prefers-reduced-motion: reduce` fallbacks.
- Added `ShimmerText` and `InlineToolStatus` (`src/components/InlineToolStatus.tsx`) plus theme-scoped `--yui-shimmer-ink` / `--yui-shimmer-shine` tokens (`src/styles/tokens.css`), featuring pure-CSS `background-clip: text` glare sweeps, rotating icon entrance, vertical blur-crossfade labels/details, `states` map overrides, CSS-only broken-favicon hiding (`.is-hidden`), continuous `1s` -> `Worked for Xs` / `Failed after Xs` timers, and `forced-colors` / `reduced-motion` static ink fallbacks.
- Upgraded `ToolTraceList` (also exported as `ToolChain` alias in `src/components/ToolTraceList.tsx`) and `ToolStepCard` (`src/components/ToolStepCard.tsx`) to default `variant="inline"` borderless rotating shimmer headers with a `1px` vertical hairline timeline rail (`.yui-trace-rail-list`), auto-collapsing on settled steps unless `defaultCollapsed={false}` while preserving `data-slot="tool-trace-list"`, `.yui-trace-row`, and `variant="card"` compatibility.
- Consolidated `InlineCitationPill` and `SourcesDrawer` into `src/components/InlineCitationPopover.tsx` and grouped shared CSS rules in `src/styles/components.css` to keep MV3 dist bundles cleanly inside budgets (`196.57 KB` raw / `79.59 KB` gzip JS across `81` ESM modules; `120.16 KB` raw / `19.00 KB` gzip CSS).
- Added unit/consumer/tree-shaking tests across `tests/icons.test.tsx`, `tests/components.test.tsx`, and `tests/exports.test.ts` (`65/65` passing) plus Light & Dark Playwright audits (`npm run verify:visual` passing with zero inline styles, WCAG AA contrast, keyboard `Enter`/`Space`, `320px`/`340px` container reflow, `dir="rtl"`, `forced-colors`, and `reducedMotion`).

## Milestone 26 (PR #29)

- Upgraded side-panel narrow reflow in `src/styles/components.css` from viewport `@media` breakpoints to CSS container queries (`@container (max-width: 340px)`, `@container (max-width: 380px)`, `@container (max-width: 420px)`) scoped to `.yui-shell` / `.yui-surface` (`container-type: inline-size`), plus container-relative citation popover bounds (`100cqi`), verified across `320px` and `360px` containers on a `1280px` viewport (Light, Dark, RTL, `forced-colors`, `prefers-reduced-motion`).
- Added `OfflineStatusBanner` (`src/components/OfflineStatusBanner.tsx`) — monochrome/amber connectivity status strip (`online` | `offline-ready` | `offline-degraded` | `sync-paused`) with `role="status"` / `aria-live="polite"`, `100%` local WebGPU active guarantees, and `Local-only` / `Retry` buttons.
- Added `SessionCheckpointCard` (`src/components/SessionCheckpointCard.tsx`) — compact checkpoint & rewind card showing saved timestamp, turn count, pinned-tab count, context-budget snapshot, inline-confirmed `Restore checkpoint` (`Cancel` focus + `Escape` focus restore), and `Branch from here`.
- Kept MV3 bundle budgets well within guardrails (`190.17 KB` raw / `76.93 KB` gzip JS across `81` ESM modules; `117.52 KB` raw / `18.14 KB` gzip CSS) and refreshed [`docs/CONSUMERS.md`](docs/CONSUMERS.md), [`README.md`](README.md), and `tests/components.test.tsx` (`62/62` passing).

## Milestone History (`v0.1.0`)

- **Milestone 25 (PR #28):** Added Playwright `prefers-reduced-motion: reduce` and keyboard-only focus/ARIA audits; enforced `animation: none !important; transition: none !important` under reduced motion; fixed `SegmentedControl` DOM roving focus + high-contrast `--yui-cobalt` `:focus-visible` outlines; reclaimed JS headroom (`75.05 KB` JS gzip across `79` ESM files); refreshed `docs/CONSUMERS.md` and `ARCHITECTURE.md`.

- **Milestone 24 (PR #27):** Polished `ConfirmActionCard` (`src/components/ConfirmActionCard.tsx`) with idle-rail `holdHintLabel` caption; added `PageSelectionCard` (`src/components/PageSelectionCard.tsx`) and `DeviceCapabilityCard` (`src/components/DeviceCapabilityCard.tsx`); extended `CardChrome.tsx`, enabled `esbuild` `es2022` compaction (`192.71 KB` raw / `77.98 KB` gzip JS; `116.89 KB` raw / `17.98 KB` gzip CSS), and passed the expanded `320px` compact audit.

- **Milestone 23 (PR #26):** Added `ConfirmActionCard` (`src/components/ConfirmActionCard.tsx`) — high-stakes local confirmation primitive with `danger`/`amber` accent tones, compact key-value summary well (`CardMetaScope`), optional typed phrase confirmation (`confirmPhrase`), pointer & `Space`/`Enter` keyboard hold-to-confirm (`holdDurationMs` with `prefers-reduced-motion` static countdown status fallback), `Esc` dismissal, and default focus on `Cancel`; polished `SitePermissionsList` (`src/components/SitePermissionsList.tsx`) so per-origin controls stack uniformly below every origin across `340px–440px` and added inline `Revoke all` confirmation (`confirmRevokeAll`); reclaimed Chrome MV3 CSS and JS bundle headroom (`115.75 KB` raw / `17.79 KB` gzip CSS, `186.96 KB` raw / `75.35 KB` gzip JS across `87` ESM modules).

- **Milestone 22 (PR #25):** Added `SitePermissionsList` (`src/components/SitePermissionsList.tsx`) — local revocable per-origin permission ledger (`Off` · `Once` · `Site` via `SegmentedControl`, optional `lockedReason` disabling persistent site-wide access on banking/sensitive flows, per-origin `Revoke` / `Revoke all`, and empty state `"No sites approved — all requests ask first"`); and added `AgentHandoffCard` (`src/components/AgentHandoffCard.tsx`) — tactile human-in-the-loop pause & takeover card for login walls, CAPTCHAs, checkout steps, or sensitive forms.

- **Milestone 21 (PR #24):** Reclaimed MV3 bundle size headroom via AST whitespace/syntax JS minification + min-gzip CSS output in `scripts/copy-assets.mjs` and duplicate card/selector consolidation in `src/styles/components.css` — cutting total JS to `76.48 KB` gzip (`<= 80.00 KB` budget) and total CSS to `18.81 KB` gzip (`<= 19.00 KB` budget); upgraded directional styles to CSS logical properties with `dir="rtl"` `340px` Playwright verification, `esbuild` subpath tree-shaking checks, and [`docs/CONSUMERS.md`](docs/CONSUMERS.md).

- **Milestone 20 (PR #23):** Polished `StorageQuotaCard` `340px` alignment, added `ModelParametersCard` and `NetworkAuditCard`, extracted shared `useHorizontalFade` & `src/utils/spring.ts`, and refreshed `ARCHITECTURE.md`.

- **Milestone 19 (PR #22):** Added `FindInThreadBar` & `StorageQuotaCard`, consolidated `src/utils/focus.ts` modal focus containment & restoration, upgraded muted/green-ink tokens, and expanded the Light & Dark WCAG AA contrast sweep across all specimen views.

- **Milestone 18 (PR #21):** Fixed `CompareTable` and `.yui-genui-card` dark-mode ink inheritance, compacted published `dist/` JS (`80.77 KB` gzip) and CSS (`17.96 KB` gzip) bundles, tightened `PromptTemplateList` `340px` spacing, and added 10-card GenUI Light/Dark WCAG AA audits.

- **Milestone 17 (PR #20):** Fixed `ExportSessionCard` `340px` header layout, added `TimelineCard` & `QuoteExcerptCard` to `@yours/ui/genui`, extracted shared `useCopyFeedback` hook (`src/utils/clipboard.ts`), and added `400px` & `340px` Light/Dark `genui` checks in `scripts/visual-specimen.mjs`.

- **Milestone 16 (PR #19):** Polished `VoiceSessionCard` primary control row + full-width `Hold [Space] to talk` bar, added `PromptTemplateList` and `ExportSessionCard`, consolidated CSS card/privacy rules, and added `CHANGELOG.md`.

- **Milestone 15 (PR #18):** Added `VoiceSessionCard` and zero-inline-style `AudioLevelMeter`, optional `onOpenCommands` (`/`) trigger & `contextUsageLabel` badge (`--yui-amber-ink`) on `FloatingComposer`, `npm run check:size` MV3 bundle budget guard, and strict `tsc --strict` consumer subpath verification including `@yours/ui/styles`.
- **Milestone 14 (PR #17):** Upgraded `SidePanelShell` top scroll fade to an `84px` two-stop solid cap (`52%`) under `TopNotch`, added `ErrorRecoveryCard` and `InlineNotice`, and completed `@media (forced-colors: active)` and `@media (prefers-reduced-motion: reduce)` support.
- **Milestone 13 (PR #16):** Refined top fade and `TabContextList` single-baseline alignment (`340px`), added `CodeBlockCard` and `OnboardingCard`, upgraded `StreamingResponse` code blocks with horizontal scroll fades, and unified semantic tokens across `tokens.css` & `components.css`.
- **Milestone 12 (PR #15):** Added GFM pipe-table parsing and horizontal scroll fades in `StreamingResponse`, elevated `SidePanelShell` toast overlay layering (`z-index: 45`), and tightened `340px` legibility across drawers and tables.
- **Milestone 11 (PR #14):** Added `ContextBudgetMeter` (`formatCompactTokens`) and `CitationFootnoteList`, aligned drawer wrapping at `340px`, and completed the component inventory in `README.md`.
- **Milestone 10 (PR #13):** Aligned `PermissionCard` Domain/Scope grid and added `ThreadHistoryList`, `ModelRosterList`, and `TabContextList` drawers.
- **Milestone 9 (PR #12):** Elevated `CommandPalette` above the shell veil scrim and added `ToolTraceList` and `PermissionCard` (`@yours/guard`).
- **Milestone 8 (PR #11):** Added `CommandPalette`, `EmptyPanelState`, and `DiffCard` with Playwright WCAG AA contrast and `340px`/`400px` audits.
- **Milestone 7 (PR #10):** Added sorting on `DataTableCard`, header copy & height capping on `ArtifactPreviewCard`, date groups in `MemoryInspectorList`, `ShortcutSheet`, `StatusToast`, and built ESM/CSS export smoke tests.
- **Milestone 6 (PR #9):** Added `DataTableCard`, `ArtifactPreviewCard`, `LocalVaultExportCard` dropzone polish, and `ResizeObserver` inner-content tracking on `SidePanelShell`.
- **Milestone 5 (PR #8):** Added dynamic scroll-edge fades, `TopNotch` focus traps, `SettingsSection` / `SettingsToggleRow` / `LocalVaultExportCard`, and interactive WAAPI verification.
- **Milestone 4 (PR #7):** Added `MemoryInspectorList` / `MemoryRecordCard`, `HardwareStatusStrip`, `ModelDownloadProgressBar`, and `VoiceSessionBar`.
- **Milestone 3 (PR #6):** Added `FloatingContextSheet`, `InlineCitationPill`, `InlineCitationPopover`, and spring-physics `SegmentedControl`.
- **Milestone 2 (PR #4–#5):** Applied minimalist Paper Page 9 design polish, `EmptyState`, `StatusBadge`, `KbdHint`, disclosure primitives, and Playwright visual specimen harness (`340px` & hover states).
- **Early Foundation (PR #1–#3):** Initialized `@yours/ui` MIT design kit with 48 Aperture SVG icons, `TopNotch` + `HookSidebarList` dual spring rails, MV3-CSP `StreamingResponse`, Cotton Paper & Obsidian theme cascade, and `prepare` build script.
