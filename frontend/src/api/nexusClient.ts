import axios, { AxiosError } from 'axios';

export const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export interface NexusApiError extends Error {
  status?: number;
  payload?: unknown;
}

function toErrorMessage(value: unknown, fallback: string): string {
  if (typeof value === 'string') return value;
  if (value instanceof Error) return value.message || fallback;
  if (value == null) return fallback;
  try { return JSON.stringify(value); } catch { return String(value); }
}

export const nexusClient = axios.create({
  baseURL: API_BASE,
  timeout: 180_000,  // 3 minutes for long-running operations (resume improvement, salary expectations, etc.)
});

// Inject JWT token on every request
nexusClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexus_token');
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, unknown>)['Authorization'] = `Bearer ${token}`;
  }
  if (!(config.data instanceof FormData)) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, unknown>)['Content-Type'] = 'application/json';
  }
  return config;
});

// On 401, broadcast event so App can redirect to login
nexusClient.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ detail?: string; message?: string }>) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new Event('nexus:unauthorized'));
    }
    const message = toErrorMessage(
      error.response?.data?.detail ?? error.response?.data?.message ?? error.message,
      'NEXUS connection failed'
    );
    const enriched = new Error(message) as NexusApiError;
    enriched.status = error.response?.status;
    enriched.payload = error.response?.data;
    throw enriched;
  }
);