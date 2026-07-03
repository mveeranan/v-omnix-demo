# Phase 4 (part 1) — Minishop Visual Restyle: Product Card + Store Nav

This is the phase where the storefront starts LOOKING like the Minishop template,
not just wearing its colors.

## What changed

### 1. Product card — full Minishop rebuild (`product-card.component.ts`)
- Image-dominant square media area on a clean white card with subtle border
- Coral **"-X%" sale badge** top-left (uses `--mox-sale`/`--mox-accent`)
- **Hover reveal "Add to Cart"** bar sliding up over the image (always visible on touch devices)
- "Added!" confirmation state with check icon
- Centered body: uppercase brand line, 2-line clamped title, accent-colored price + strikethrough compare price
- Qty stepper redesigned (bordered minimal buttons); quantity now only applies when you click Add to Cart (previously "+" silently added to cart)
- All colors/radii from theme CSS variables → every tenant theme applies automatically
- Styles are component-scoped (`msp-*` classes) — no global SCSS was touched, old `mox-product-card` styles remain for anything else using them

### 2. Store nav — Minishop header (`store-nav.component.ts`)
- Sticky white header with bottom border
- Brand left (heading font), **uppercase nav links** with accent underline on hover/active
- **Search box** (desktop ≥1024px; also inside the mobile menu) — submits to the shop page with `?q=` and results are server-filtered across the whole catalog
- Cart button with coral count badge, theme toggle, mobile drawer kept

### 3. Shop page reads `?q=` (`product-list-page.component.ts`)
- Now subscribes to query params — nav search works on first load AND while already on the shop page; category links keep working

## Files touched
- src/features/store/commerce/product-card.component.ts (rewritten)
- src/features/store/layout/store-nav.component.ts (rewritten)
- src/features/store/pages/product-list-page.component.ts (query param subscription)

## ▶️ Your steps

```powershell
cd C:\WorkSpace-Item\Work-orbit\work-orbit-front-end
ng build --configuration=development
ng serve
```

Verify on `/store/<slug>` and `/store/<slug>/products`:
1. Header: sticky, uppercase links, search box on the right (desktop)
2. Product cards: square images, hover → coral "Add to Cart" slides up, sale badge on discounted items
3. Type in the header search → lands on Shop with results filtered
4. Add to cart → badge count increments, "Added!" flashes
5. Switch theme preset in admin → cards and header recolor instantly

## Phase 4 remaining (say "continue" for the next batch)
- Store home hero + category showcase + new-arrivals sections re-proportioned to Minishop
- Footer restyle
- Product detail page (gallery left / info right / related products row)
