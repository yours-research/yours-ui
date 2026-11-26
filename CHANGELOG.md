# Changelog

All notable milestones for **`@yours/ui`** are documented here.
The library targets Chrome MV3 side panels (`340px–440px`), maintains zero runtime dependencies, zero JSX inline `style` attributes, and zero `dangerouslySetInnerHTML`.

## Unreleased / Milestone 25 (PR #28)

- Added automated Playwright `prefers-reduced-motion: reduce` audit in `scripts/visual-specimen.mjs` verifying disabled animations/pulses across `AudioLevelMeter`, `AgentHandoffCard`, `ConfirmActionCard`, `VoiceSessionBar`, `StreamingResponse`, and `StatusBadge`, plus zero layout shift during `ConfirmActionCard` static countdown hold. Enforced `animation: none !important; transition: none !important; scroll-behavior: auto !important;` across `.yui-*` selectors under `@media (prefers-reduced-motion: reduce)` so multi-class pulse/meter selectors cannot override reduced motion.
- Added automated Playwright & Vitest keyboard-only focus and ARIA contract verification (`CommandPalette`, modal `ShortcutSheet`, `TopNotch` drawer `Tab`/`Shift+Tab` trap + `Escape` focus restoration, `FindInThreadBar`, `PageSelectionCard`, `DeviceCapabilityCard`, `ConfirmActionCard` & `SitePermissionsList` `confirmRevokeAll` `Cancel` focus). Fixed `SegmentedControl` `stepSelection` to move active DOM focus alongside roving `tabIndex` (including `Home`/`End`), added `aria-busy` to `DeviceCapabilityCard` `Re-check`, and upgraded `:focus-visible` outline color from 20%-alpha `--focus-ring` to `--yui-cobalt` (`>= 5.5:1` Light / Dark focus contrast).
- Reclaimed MV3 bundle headroom (`185.93 KB` raw / `75.05 KB` gzip JS across `79` ESM modules; `116.89 KB` raw / `18.00 KB` gzip CSS) via compact internal `generate-icons.mjs` primitive helpers (`src/icons/iconData.ts`), shared `cn`/`CardCopyButton`/`CardScrollWrap` in `src/utils/clipboard.ts` & `src/components/CardChrome.tsx`, `StreamingResponse` deduplication, and clean family consolidation (`VoicePrimitives.tsx`, `CodeBlocks.tsx`, `EmptyStates.tsx`, `PermissionPrompts.tsx`, `PromptSuggestions.tsx`, `NotchPrimitives.tsx`) with zero public API changes.
- Refreshed [`docs/CONSUMERS.md`](docs/CONSUMERS.md) and [`ARCHITECTURE.md`](ARCHITECTURE.md) documenting Milestones #22–#24 primitives and the `320px`, `dir="rtl"`, `forced-colors`, keyboard-navigation, and `prefers-reduced-motion` contracts.

## Milestone History (`v0.1.0`)

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
