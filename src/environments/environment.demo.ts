export const environment = {
  production: true,
  // Unused in demo mode — the demo HTTP interceptor short-circuits every request before it
  // reaches HttpClient's backend, so no real network call to this host is ever made.
  apiBaseUrl: 'https://demo.local',
  enablePlanGating: true,
  /** When true, a demo HTTP interceptor serves every API call from LocalStorage instead of the real backend. */
  demoMode: true
} as const;
