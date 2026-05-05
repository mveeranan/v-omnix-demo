import { environment } from './environment';

const base = environment.apiBaseUrl;

export const API_ENDPOINTS = {
  auth: {
    login: `${base}/Auth/login`,
    refresh: `${base}/Auth/refresh`
  },
  signalR: {
    hub: `${base}/hubs/connect`
  }
} as const;
