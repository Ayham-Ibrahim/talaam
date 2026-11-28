import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { config } from '@/config/env';
import { client } from '@/api/client';

/**
 * اتصال WebSocket واحد (Laravel Reverb) لكل جلسة دخول. مصادقة القنوات عبر
 * /api/broadcasting/auth بنفس عميل axios، فيُرفَق توكن Sanctum تلقائياً.
 * بلا VITE_REVERB_APP_KEY يُرجع null — المحادثة تعمل حينها بالاستطلاع الدوري.
 */
let echo = null;
let echoToken = null;

/**
 * حالة اتصال WebSocket الفعلية (حالات pusher-js: connecting/connected/unavailable/failed...) —
 * المحادثة تستطلع عبر HTTP ما دام غير "connected"، لا فقط حين لا يوجد مفتاح Reverb: مفتاح
 * مضبوط مع خادم متوقف كان يوقف كل تحديث حتى إعادة تحميل الصفحة.
 */
let connectionState = 'disconnected';
// منذ متى انقطع الاتصال — لإبطاء الاستطلاع تدريجياً إن طال العطل (pollIntervalMs)
let disconnectedSince = Date.now();
const connectionListeners = new Set();

function setConnectionState(state) {
  if (state === connectionState) return;
  if (state === 'connected') disconnectedSince = null;
  else if (connectionState === 'connected' || disconnectedSince === null) disconnectedSince = Date.now();
  connectionState = state;
  connectionListeners.forEach((listener) => listener());
}

/**
 * فترة الاستطلاع أثناء الانقطاع، تتباطأ إن طال: الفترة الأساسية أول دقيقتين، ثم 30 ثانية
 * حتى 10 دقائق، ثم دقيقة — عطل طويل في Reverb لا يتحول لضغط دائم على الـ API. بلا مفتاح
 * Reverb أصلاً (الاستطلاع هو الوضع الدائم لا عطلاً) تبقى الفترة الأساسية.
 */
export function pollIntervalMs(baseMs) {
  if (!isRealtimeEnabled) return baseMs;
  const elapsed = Date.now() - (disconnectedSince ?? Date.now());
  if (elapsed < 2 * 60_000) return baseMs;
  if (elapsed < 10 * 60_000) return Math.max(baseMs, 30_000);
  return Math.max(baseMs, 60_000);
}

export function subscribeConnectionState(listener) {
  connectionListeners.add(listener);
  return () => connectionListeners.delete(listener);
}

export function getConnectionState() {
  return connectionState;
}

export const isRealtimeEnabled = Boolean(config.reverb.key);

export function connectEcho(token) {
  if (!isRealtimeEnabled || !token) return null;
  if (echo && echoToken === token) return echo;

  disconnectEcho();
  window.Pusher = Pusher;

  echo = new Echo({
    broadcaster: 'reverb',
    key: config.reverb.key,
    wsHost: config.reverb.host,
    wsPort: config.reverb.port,
    wssPort: config.reverb.port,
    forceTLS: config.reverb.scheme === 'https',
    enabledTransports: ['ws', 'wss'],
    authorizer: (channel) => ({
      authorize: (socketId, callback) => {
        client
          .post('/broadcasting/auth', { socket_id: socketId, channel_name: channel.name })
          .then((response) => callback(null, response.data))
          .catch((error) => callback(error, null));
      },
    }),
  });
  echoToken = token;
  echo.connector.pusher.connection.bind('state_change', ({ current }) => setConnectionState(current));

  return echo;
}

export function getEcho() {
  return echo;
}

export function disconnectEcho() {
  echo?.disconnect();
  echo = null;
  echoToken = null;
  setConnectionState('disconnected');
}

/** يُرسَل كـ X-Socket-ID مع طلبات المحادثة كي لا يعود حدث المرسل إليه نفسه (toOthers) */
export function currentSocketId() {
  return echo?.socketId() ?? null;
}
