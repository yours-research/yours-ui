# Architecture — `@yours/ui`

## Design Principles

1. **Tactile Localism × Rare UI Minimalism**
   - Light mode renders on **Cotton Paper** (`#FFFFFF` outer bezel, `#F2EFE9` recessed stage, `#FFFFFF` elevated capsules, `#141413` ink).
   - Dark mode renders on **Anodized Obsidian** (`#09090B` outer bezel, `#111113` recessed stage, `#18181B` capsules, `#F4F3EF` ink).
   - Theme switching works automatically via `prefers-color-scheme: dark` and explicitly via `<SidePanelShell theme="light" | "dark" | "system">` (`[data-theme="dark"]`).

2. **Top-Center Dynamic Island Notch (`TopNotch`)**
   - Nested inside `SidePanelShell` using two `14x14` concave `NotchEar` SVGs overlapping by `-0.5px` so high-DPR spring animations never produce subpixel gaps.
   - CSS state transitions:
     - **Resting:** `144px × 36px` bar showing 4 pure `14.5px` Aperture icons.
     - **Hover / Focus-Within:** Fluid spring (`cubic-bezier(0.22, 1.15, 0.36, 1)`) widens to `272px × 52px` and reveals 1-word labels.
     - **Click-Expanded Drawer:** Smooth CSS Grid row reveal (`grid-template-rows: 0fr -> 1fr`) drops down into a `272px` unified overlay housing (`HookSidebarList`, `NotchDrawerSearch`, or Model/Speed/OPFS controls) over a click-dismissable `.yui-veil` scrim.

3. **Zero Unsafe DOM & Strict MV3 CSP Compliance**
   - `scripts/generate-icons.mjs` parses all 48 `src/icons/*.svg` files into typed React SVG element descriptors (`src/icons/iconData.ts`) — zero `dangerouslySetInnerHTML`, zero inline `style=` injection, zero external font/script runtime dependencies.
   - Works out of the box inside strict Chromium Extension Manifest V3 CSPs (`script-src 'self'; style-src 'self'`).

4. **Directory Structure**
   - `src/icons/` — Aperture 48-icon React bindings + `MatrixOrb`, `NotchEar`, `YoursMark`.
   - `src/layout/` — `SidePanelShell`, `TopNotch`, `HookSidebarList`, `NotchDrawerSearch`, `NotchStatusPill`.
   - `src/components/` — Conversation stream, composer, voice, tool steps, guard approval, model download gate.
   - `src/genui/` — 8 structured side-panel-native Generative UI cards (`CompareTable` through `PageActionCard`).
   - `src/styles/` — Design tokens (`tokens.css`) and scoped component stylesheet (`components.css`).
