# Phase 2 — Theme Configurator + API Wiring (Applied)

## What changed (frontend)

### 1. New "Theme & Colors" editor section
`Admin → Website → Content` now has a **Theme & Colors** panel (right after Brand):

- Preset dropdown (loads from `GET /theme-presets` — includes the new `minishop` preset)
- 8 color pickers: accent, primary, secondary, background, surface, text, muted text, borders
- Body + heading font inputs
- Corner radius + button style (rounded / square / pill) selectors
- **Live preview** — every change is pushed into the editor draft immediately, so the Preview modal reflects it
- **Save theme** → `PUT /website/theme` (presetId + only the tokens that differ from the preset are stored as overrides)
- **Reset to preset** discards overrides

### 2. Theme pipeline now supports full token set
- `PortfolioTheme` model extended: secondaryColor, backgroundColor, surfaceColor, textColor, mutedTextColor, borderColor, headingFontFamily, buttonStyle, overrides
- `buildPortfolioThemeVars()` honors explicit tokens when present (falls back to the existing computed colors when absent) and emits new CSS vars: `--mox-secondary`, `--pf-font-heading`, `--pf-btn-radius`, `--mox-btn-radius`
- `minishop` added to the local preset catalog (works even before the API loads)
- Store + editor now merge server-saved overrides on top of the resolved preset — so a store's custom colors survive reloads and appear on the public storefront

### 3. Website API service expanded
`WebsiteApiService` gains: `listSections()`, `reorderSections()`, `deleteSection()`, `saveTheme()` — matching the Phase 1 backend endpoints. New API constants under `website.*`.

## Files touched

Modified:
- src/environments/api.constants.ts
- src/features/portfolio/models/portfolio.model.ts
- src/features/portfolio/models/theme-preset.model.ts
- src/features/portfolio/models/portfolio-theme.presets.ts
- src/features/portfolio/models/website-api.model.ts
- src/features/portfolio/shared/utils/portfolio-theme.util.ts
- src/features/portfolio/data-access/website-api.service.ts
- src/features/portfolio/data-access/portfolio-state.service.ts
- src/features/portfolio/editor/portfolio-editor.component.ts
- src/features/portfolio/editor/portfolio-editor.component.html

New:
- src/features/portfolio/editor/sections/theme-editor-section.component.ts

## ▶️ Your steps

```powershell
cd C:\WorkSpace-Item\Work-orbit\work-orbit-front-end
ng build --configuration=development
ng serve
```

Then verify:
1. Backend running → log in → Admin → Website
2. "Theme & Colors" section appears under Brand
3. Pick **Minishop Minimal** preset → open Preview → coral/white minimal look
4. Change accent color → Preview updates live → **Save theme**
5. Reload the page → your custom color persists (server-side overrides)
6. Open the public store `/store/<your-slug>` → same theme applies

## Next (Phase 3 preview)
Storefront product grid upgrade: wire `q`/`minPrice`/`maxPrice`/`sort` catalog params into the shop page (search box, price filter, sort dropdown), Minishop-style product cards, and category showcase using category images.
