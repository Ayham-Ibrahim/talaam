/**
 * Shared join-click handler for every "انضمام" button in the app. Verifies
 * with the backend that the BBB meeting is actually joinable before opening
 * a tab — see hooks/useSessionJoin.js and services/index.js#classSessionService
 * for why a plain `window.open(session.joinUrl)` used to show BBB's raw,
 * unstyled XML error page whenever the meeting wasn't running yet.
 */
export async function handleSessionJoin(mutateAsync, sessionId) {
  try {
    const { url } = await mutateAsync(sessionId);
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  } catch (err) {
    window.alert(err?.message ?? 'تعذّر الانضمام إلى الجلسة الآن، حاول مرة أخرى.');
  }
}
