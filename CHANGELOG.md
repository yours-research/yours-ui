# Changelog

All notable milestones for **`@yours/ui`** are documented here.
The library targets Chrome MV3 side panels (`340px–440px`), maintains zero runtime dependencies, zero JSX inline `style` attributes, and zero `dangerouslySetInnerHTML`.

## Unreleased / Milestone 19 (PR #22)

- Added **`FindInThreadBar`** (`src/components/FindInThreadBar.tsx`) and **`StorageQuotaCard`** (`src/components/StorageQuotaCard.tsx`) exported from `@yours/ui/components` and `@yours/ui`, featuring `tabular-nums` match readouts, `Aa` case-sensitivity toggle, zero-inline-style SVG segmented capacity bars, `Verify SHA-256`/`Clear` controls, `100% local browser storage` privacy footers, and `@media (forced-colors: active)` + `340px` support.
- Consolidated overlay focus management into **`src/utils/focus.ts`** (`< 0.5 KB` gzip) across `CommandPalette`, `ShortcutSheet` (optional `open`/`onClose` dialog mode), `FloatingContextSheet`, and `TopNotch` with `Tab`/`Shift+Tab` containment and trigger focus restoration on `Escape` or veil click.
- Expanded Light & Dark WCAG AA contrast assertions across all specimen panels (`voice`, `templates`, `recovery`, `onboarding`, `budget`, `drawers`, `trace`, `diff`, `palette`, `data`, `shortcuts`, `welcome`, `storage`, and all 10 GenUI cards), upgrading `--yui-muted`/`--text-muted` tokens (`#6F6D68` Light / `#8C8A84` Dark) and green ink pills (`--yui-green-ink`) to clear `>= 4.5:1`.

## Milestone History (`v0.1.0`)

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
