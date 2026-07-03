# Phase 4b + 4c — Minishop Home Sections, Footer (Final Restyle Batch)

This completes the Minishop visual rebuild. Combined with Phase 4a (product cards + header),
your published store home + shop pages now follow the Minishop template structure.

## What changed

### 1. Hero slider — Minishop style (`hero-section.component.ts/.html`)
- Full-width image slider with a **left-aligned content block** (Minishop layout):
  accent-colored uppercase eyebrow → big heading → subtitle → **coral "Shop Now" CTA button**
- Left-to-right dark scrim keeps text readable over any photo (auto-removed on no-image gradient slides, where text switches to dark)
- Slide dots bottom-center; active dot stretches into an accent pill
- CTA links to the shop page; per-slide CTA label is used when set in the editor

### 2. Category showcase (`category-showcase-section.component.ts`)
- Minishop **section header**: centered title + short accent underline + subtitle
- Category cards: 4/3 image with hover zoom, uppercase label band below the image,
  label turns accent on hover — 2 columns mobile / 4 desktop

### 3. New arrivals (`new-arrivals-section.component.ts`)
- Same centered Minishop section header (eyebrow "Just landed" + title + accent rule)
- Grid of the new Phase-4a product cards, 2/4 columns
- Centered outline **"View all products"** button below the grid (fills coral on hover)

### 4. Footer (`footer-section.component.ts/.html`)
- Minishop footer: light band with 4 columns — brand + tagline + social,
  Shop links, Information links, Get in touch (email/phone)
- Slim separate copyright bar at the bottom
- All links hover to accent color

### 5. Product detail page (4c)
Reviewed — it already matches the Minishop structure (breadcrumb, gallery left / info
right, variant buttons, qty stepper, trust tiles, tabs, related products). It inherits
the theme tokens and the new product cards for related items, so no rewrite was needed.

All styles are component-scoped (`msp-*`) and driven by the theme CSS variables —
your Theme & Colors panel recolors every section live, and no global SCSS was modified.

## Files touched
- src/features/portfolio/public/sections/hero-section.component.ts (+ .html)
- src/features/portfolio/public/sections/footer-section.component.ts (+ .html)
- src/features/store/commerce/category-showcase-section.component.ts
- src/features/store/commerce/new-arrivals-section.component.ts

## ▶️ Your steps

```powershell
cd C:\WorkSpace-Item\Work-orbit\work-orbit-front-end
ng build --configuration=development
ng serve
```

Then open your published store `/store/<slug>` and compare against
https://preview.colorlib.com/#minishop:
1. Hero: left-aligned text + coral Shop Now button over the image
2. Category cards with label bands, hover zoom
3. "Just landed" new arrivals with centered header + outline View-all button
4. New product cards everywhere (hover Add to Cart)
5. Footer columns + copyright bar
6. Admin → Theme & Colors → confirm "Minishop Minimal" preset is selected and saved

## Notes / known differences from the template
- Section order on the home page comes from your website editor toggles — enable
  Hero, Category Showcase, and New Arrivals for the closest match
- The Minishop template's "Deal of the week" countdown and blog sections don't exist
  yet — they'd be new WebsiteSectionTypes if you want them later
- Fonts: for the exact template feel, keep the preset's Open Sans / Poppins pairing
  (loaded system-fallback; add Google Fonts <link> in index.html for pixel parity)
