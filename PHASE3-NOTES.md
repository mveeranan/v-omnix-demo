# Phase 3 — Server-Side Shop Search/Filter/Sort (Applied)

## The problem this fixes

The shop page UI (search box, price range, category/brand filters, sort) already existed,
but `ProductApiService.listByStore` did ALL filtering **client-side on one server page**:

- Search only searched within the 12 products of the current page
- Totals and pagination were wrong whenever filters were active
- Price/sort never reached the backend

## What changed

### 1. Catalog filters go server-side
- `CatalogProductListFilters` extended with `q`, `minPrice`, `maxPrice`, `sort` (types match the Phase 1 backend params)
- `CatalogStorefrontApiService.listProducts` sends them as query params

### 2. `ProductApiService.listByStore` rewritten
- Loads categories + brands first, translates the UI's display-name filters into slugs
- Sends search / price / category / brand / sort to `GET /catalog/{slug}/products`
- Fetches a 200-product window and paginates client-side within it — totals stay accurate for small-store catalogs while the backend still lacks a total-count response (full server paging comes later)
- `onSale` stays client-side (needs compareAtPrice which the server doesn't filter on yet)
- `searchSuggestions` now uses server `q` search instead of downloading 50 products
- Sort mapping: `popular`/`rating`/`reviews` fall back to `newest` until review data lands

### 3. New sort option
"Name A → Z" added to the shop page sort dropdown (server-side).

## Files touched
- src/features/catalog/models/catalog-storefront.model.ts
- src/features/catalog/data-access/catalog-storefront-api.service.ts
- src/features/store/data-access/product-api.service.ts (rewritten)
- src/features/store/models/product.model.ts
- src/features/store/pages/product-list-page.component.ts

## ▶️ Your steps

```powershell
cd C:\WorkSpace-Item\Work-orbit\work-orbit-front-end
ng build --configuration=development
```

Verify with backend running, on `/store/<slug>/products`:
1. Type in the search box → results come from the whole catalog, not just page 1
2. Set a min/max price → server-filtered results
3. Sort by price / name → correct order across pages
4. Category + brand dropdowns still work (now translated to slugs server-side)
5. "Showing X–Y of Z" counts are correct with filters active

## Next (Phase 4 preview)
- Proper paged response from the backend ({ items, totalCount }) and true server pagination
- Minishop product-card + category-showcase visual polish (uses the theme tokens from Phase 2)
- Store nav search box wiring to `searchSuggestions`
