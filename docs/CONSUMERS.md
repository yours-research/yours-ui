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
| `@yours/ui/icons` | `ApertureIcon`, `APERTURE_ICON_NAMES`, 48 `*Icon` bindings, `MatrixOrb`, `NotchEar`, `YoursMark` |
| `@yours/ui/layout` | `SidePanelShell`, `TopNotch`, `HookSidebarList`, `NotchDrawerSearch`, `NotchOptionRow`, `NotchStatusPill`, `GreenLed` |
| `@yours/ui/components` | Chat stream, composer, `FindInThreadBar`, `StorageQuotaCard`, `ModelParametersCard`, `NetworkAuditCard`, drawers, overlays |
| `@yours/ui/genui` | All 10 side-panel Generative UI cards (`CompareTable`, `ChecklistCard`, `PageBriefCard`, `DraftCard`, `EntitySummaryCard`, `ChoicePromptCard`, `MetricStripCard`, `PageActionCard`, `TimelineCard`, `QuoteExcerptCard`) |
| `@yours/ui` | Convenience root re-export barrel |

---

## 3. Theme Tokens (`light` / `dark` / `system`)

- Pass `theme="system" | "light" | "dark"` on `<SidePanelShell />`, or set `data-theme="light"` / `data-theme="dark"` on a container.
- Without `data-theme`, `tokens.css` automatically tracks `@media (prefers-color-scheme: dark)`.
- Light mode uses Cotton Paper (`#FFFFFF` / `#F2EFE9` / `#141413` ink / `#6F6D68` muted); Dark mode uses Anodized Obsidian (`#08080A` / `#121215` / `#F4F3EF` ink / `#8C8A84` muted).

---

## 4. Modal Focus Containment & Restoration

`CommandPalette`, `FloatingContextSheet`, `ShortcutSheet` (when `open` is provided), and `TopNotch` share `src/utils/focus.ts` (`useFocusTrap`):

- Opening moves focus cleanly into the overlay (`getFocusableElements`).
- Pressing `Tab` / `Shift+Tab` wraps focus strictly within visible/enabled controls inside the overlay.
- Dismissing via `Escape`, close buttons, or clicking `SidePanelShell`'s `.yui-veil` backdrop restores focus directly to the trigger element that opened the overlay.

---

## 5. Accessibility: `forced-colors`, `prefers-reduced-motion` & `dir="rtl"`

- **Forced Colors (`@media (forced-colors: active)`):** Cards, badges, progress bars, switches, timeline dots, quote rules, and `:focus-visible` outlines map cleanly to CSS system colors (`Canvas`, `CanvasText`, `ButtonFace`, `ButtonText`, `Highlight`, `HighlightText`, `GrayText`).
- **Reduced Motion (`@media (prefers-reduced-motion: reduce)`):** WAAPI spring animations (`HookSidebarList`, `SegmentedControl`, `StreamingResponse`) clamp immediately to target state and CSS transitions/keyframe animations disable cleanly.
- **RTL (`dir="rtl"`):** Directional spacing, alignments, and accent rules use CSS logical properties (`inset-inline`, `margin-inline-start`, `padding-inline-start`/`end`, `border-inline-start`, `text-align: start`/`end`), while geometric SVG notch assemblies (`TopNotch`) and diff/code blocks remain cleanly readable (`direction: ltr`).
