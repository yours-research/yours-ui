# Changelog

All notable milestones for **`@yours/ui`** are documented here.
The library targets Chrome MV3 side panels (`340px–440px`), maintains zero runtime dependencies, zero JSX inline `style` attributes, and zero `dangerouslySetInnerHTML`.

## Unreleased / Milestone 16 (PR #19)

- Polished `VoiceSessionCard` control hierarchy so `Barge-in | Mute | End` aligns cleanly on a single flush primary strip with a dedicated full-width `Hold [Space] to talk` push-to-talk row across `340px`, `380px`, and `400px`.
- Added **`PromptTemplateList`** (`PromptTemplateItem`, `PromptTemplateListProps`) for local slash-command and prompt template libraries with category pills, search filtering, bookmark pinning, and roving `ArrowUp`/`ArrowDown`/`Home`/`End`/`Enter` keyboard navigation.
- Added **`ExportSessionCard`** (`ExportSessionCardProps`, `ExportSessionFormat`, `ExportSessionOptions`) with `Markdown` / `JSON` / `Plain text` `SegmentedControl`, optional tool-trace & citation switches, compact size/count metadata, and local `Copy` / `Download` actions.
- Consolidated shared Paper Page 9 card surface & privacy footer styles in `src/styles/components.css` to keep CSS gzip well below the MV3 budget.

## Milestone History (`v0.1.0`)

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
