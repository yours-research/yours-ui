# Changelog

All notable milestones for **`@yours/ui`** are documented here.
The library targets Chrome MV3 side panels (`340px–440px`), maintains zero runtime dependencies, zero JSX inline `style` attributes, and zero `dangerouslySetInnerHTML`.

## Unreleased / Milestone 24 (PR #27)

- Polished `ConfirmActionCard` (`src/components/ConfirmActionCard.tsx`) with an idle-rail caption row (`holdHintLabel`, defaulting to `"Hold 0.5s or Space to confirm"`, switching to live countdown status under `prefers-reduced-motion: reduce`), zero inline styles.
- Added `PageSelectionCard` (`src/components/PageSelectionCard.tsx`) — Page 9 pinned selection card built on `CardChrome` with origin + optional section `locator`, 3-line clamped quote with accessible `Expand`/`Collapse` toggle when overflowing, optional `tokenEstimate` badge, and `Show on page` / `Remove` actions.
- Added `DeviceCapabilityCard` (`src/components/DeviceCapabilityCard.tsx`) — local WebGPU readiness & model-fit preflight card with numeric adapter/VRAM/RAM/OPFS rows, `ready`/`tight`/`unsupported` icon+text status, optional zero-inline-style SVG headroom bar (`CardSegmentBar`), selectable model tier quick-actions (`onSelectTier`), and `Re-check`.
- Extended `CardChrome.tsx` (`cn`, `CardPrivacyNote`, `CardSegmentBar`) across existing cards, enabled `esbuild` `es2022` compaction in `scripts/copy-assets.mjs` (`192.71 KB` raw / `77.98 KB` gzip JS across `89` ESM modules; `116.89 KB` raw / `17.98 KB` gzip CSS), and passed an expanded `320px` compact-width audit (`permissions`, `storage`, `controls`, `templates`, `voice`, `preflight`) with `scrollWidth <= 320` and 100% Light/Dark WCAG AA contrast.

## Milestone History (`v0.1.0`)

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
