# Frontend Structure (Angular 19)

## Folder layout

- `core/`: cross-cutting services and app-wide concerns (auth, http interceptors, realtime, logging, config).
- `shared/`: reusable utilities that are UI-agnostic (validators, mappers, helper types).
- `features/`: business/domain screens and feature-specific components.

## Backend-aligned patterns used

- Logging pattern: `core/logging/logger.service.ts` (similar to backend logging abstraction).
- Mapping pattern: `shared/mappers/mapper.ts` + feature mappers such as `core/auth/mappers/auth-token.mapper.ts`.
- Validation pattern: shared validators in `shared/forms/validators/`.
- Environment-based API setup: `environments/environment*.ts` + `environments/api.constants.ts`.

## Recommended next steps

- Move `src/components/*` into `app/features/*` gradually.
- Add global error handler and toast/notification service.
- Add typed API clients per feature (`features/*/data-access`).
