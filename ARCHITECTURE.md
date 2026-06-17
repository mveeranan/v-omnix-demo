# Frontend Structure (Angular 19)

## Folder layout

```
src/
├── app/           # Bootstrap shell (routes, config, root component)
├── core/          # Cross-cutting services (auth, logging, theme, realtime)
├── features/      # Domain features (admin, auth, portfolio, store, marketing, dev)
├── shared/        # Reusable UI, models, validators, mappers
├── environments/  # API URLs and environment config
└── styles/        # Global SCSS design system
```

## Import aliases

| Alias | Path |
|-------|------|
| `@app/*` | `src/app/*` |
| `@core/*` | `src/core/*` |
| `@features/*` | `src/features/*` |
| `@shared/*` | `src/shared/*` |
| `@env/*` | `src/environments/*` |

## Feature conventions

Each feature under `features/` follows:

- `data-access/` — services, stores, API clients
- `models/` — domain models, `dto/`, `enums/`
- `pages/` or route components
- `<feature>.routes.ts` — feature route definitions (composed in `app/app.routes.ts`)
- `shared/` — feature-local reusable UI (not global `@shared`)

## Backend-aligned patterns

- Logging: `@core/logging/logger.service.ts`
- Mapping: `@shared/mappers/mapper.ts` + feature mappers
- Validation: `@shared/forms/validators/`
- API setup: `@env/environment*.ts` + `@env/api.constants.ts`

## Data sources

- **Real API**: auth, business profile, user, portfolio/website, theme presets, document upload
- **In-memory stores** (until backend ready): products, orders, customers, coupons, brands, categories, tax, returns, reviews, newsletter, subscription settings
