# Work Orbit Design System (Piloz-inspired)

Reference: [Piloz Vue](https://piloz-vue.vercel.app/?storefront=envato-elements)

Visual-only system: soft flat surfaces, rounded cards, single accent (`#5b6cff`), Inter typography, Lucide icons.

## Tokens

See [`src/styles/design-tokens.scss`](src/styles/design-tokens.scss).

## Structure

[`src/styles.scss`](src/styles.scss) imports tokens → legacy → primitives → layout → features.

## Icons

Lucide only. Sizes in [`src/app/shared/ui/icon.constants.ts`](src/app/shared/ui/icon.constants.ts).

## Shared UI

[`src/app/shared/ui/`](src/app/shared/ui/) — `app-button`, `app-card`, `app-badge`, `app-input`, `app-table`, `app-page-header`, `app-empty-state`.

## Regression checklist

Manual pass after visual overhaul:

- [ ] Login (light/dark)
- [ ] Admin sidebar groups, collapse, mobile drawer
- [ ] Bookings list, wizard (multi-service, pay now + receipt)
- [ ] Branches / services / profile
- [ ] Portfolio editor + public site
- [ ] Home marketing + auth modals

Build: `ng build --configuration=development` (verified). Bootstrap removed from `angular.json`.
