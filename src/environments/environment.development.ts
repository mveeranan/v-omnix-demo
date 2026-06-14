export const environment = {
  production: false,
  apiBaseUrl: 'https://localhost:7084',
  /** When false, all admin nav items are usable (frontend demo). Enable when billing API gates features. */
  enablePlanGating: false
} as const;
