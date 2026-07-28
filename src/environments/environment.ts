export const environment = {
  production: true,
  apiBaseUrl: 'https://localhost:7084',
  enablePlanGating: true,
  /** When true, a demo HTTP interceptor serves every API call from LocalStorage instead of the real backend. */
  demoMode: false
} as const;
