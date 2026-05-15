import { environment } from './environment';

const base = environment.apiBaseUrl;

export const API_ENDPOINTS = {
  auth: {
    login: `${base}/Auth/login`,
    refresh: `${base}/Auth/refresh`,
    selectContext: `${base}/Auth/select-context`,
    registerAdmin: `${base}/Auth/register-admin`
  },
  countries: {
    list: `${base}/countries`
  },
  plans: {
    list: `${base}/plans`
  },
  stripe: {
    checkout: `${base}/Stripe/ChcekOut`
  },
  signalR: {
    hub: `${base}/hubs/connect`
  }
} as const;
