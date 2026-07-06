import axios from 'axios';
import { config } from '@/config/env';

/**
 * Central Axios instance.
 * Auth token injection + global error normalization live here,
 * so services and components never deal with raw HTTP concerns.
 */
export const client = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor — attach auth token when available
client.interceptors.request.use(
  (req) => {
    const token = getAuthToken();
    if (token) req.headers.Authorization = `Bearer ${token}`;
    return req;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — normalize errors into a predictable shape
client.interceptors.response.use(
  (res) => res,
  (error) => {
    const normalized = {
      status: error.response?.status ?? 0,
      message:
        error.response?.data?.message ||
        error.message ||
        'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى',
      errors: error.response?.data?.errors ?? null,
    };
    return Promise.reject(normalized);
  }
);

// Auth token accessor — swap for your auth store when ready
function getAuthToken() {
  try {
    return null; // e.g. useAuthStore.getState().token
  } catch {
    return null;
  }
}

/** Simulated network delay for mock services */
export const mockDelay = (ms = config.mockDelayMs) =>
  new Promise((resolve) => setTimeout(resolve, ms));
