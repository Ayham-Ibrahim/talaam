import axios from 'axios';
import { config } from '@/config/env';
import { useAuthStore } from '@/store';

/**
 * Central Axios instance.
 * Auth token injection + global error normalization live here,
 * so services and components never deal with raw HTTP concerns.
 */
export const client = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 120000,
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
  async (error) => {
    let data = error.response?.data;

    // طلبات التنزيل (الفواتير مثلاً) تُرسَل بـ responseType:'blob' — فأي خطأ
    // JSON حقيقي يُرجعه السيرفر (422 "لم يُدفع بعد"، 403، 500 ...) يصل هنا
    // كـ Blob خام لا ككائن JSON مُفكَّك تلقائياً، فتُفقَد رسالة الخطأ الفعلية
    // القادمة من الباك اند ويظهر للمستخدم نص عام دائماً بصرف النظر عن السبب
    // الحقيقي. نقرأها كنص JSON هنا أولاً قبل التطبيع.
    if (data instanceof Blob && data.type?.includes('json')) {
      try {
        data = JSON.parse(await data.text());
      } catch {
        // ليست JSON فعلاً (خطأ شبكة خام مثلاً) — تُترك كما هي وتؤول لرسالة عامة أدناه
      }
    }

    const normalized = {
      status: error.response?.status ?? 0,
      message: data?.message || error.message || 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى',
      errors: data?.errors ?? null,
    };
    return Promise.reject(normalized);
  }
);

// Auth token accessor
function getAuthToken() {
  try {
    return useAuthStore.getState().token;
  } catch {
    return null;
  }
}

/** Simulated network delay for mock services */
export const mockDelay = (ms = config.mockDelayMs) =>
  new Promise((resolve) => setTimeout(resolve, ms));
