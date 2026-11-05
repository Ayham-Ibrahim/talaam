/**
 * Shared join-click handler for every "انضمام" button in the app. Verifies
 * with the backend that the BBB meeting is actually joinable before opening
 * a tab — see hooks/useSessionJoin.js and services/index.js#classSessionService
 * for why a plain `window.open(session.joinUrl)` used to show BBB's raw,
 * unstyled XML error page whenever the meeting wasn't running yet.
 */

// `disabled={isPending}` only kicks in after React re-renders, so rapid taps
// slip through before it — this synchronous guard drops them immediately.
const inFlight = new Set();

export async function handleSessionJoin(mutateAsync, sessionId) {
  if (inFlight.has(sessionId)) return;
  inFlight.add(sessionId);

  // iOS Safari blocks window.open() once it runs after an await (no longer
  // tied to the tap), so the user saw nothing and kept tapping. Open the tab
  // synchronously within the click, then point it at the URL once we have it.
  // No 'noopener' here: it makes window.open return null; opener is cut below.
  const tab = window.open('', '_blank');
  if (tab) {
    tab.opener = null;
    tab.document.title = 'جارٍ الانضمام…';
    tab.document.body.innerHTML = '<p dir="rtl" style="font-family:sans-serif;text-align:center;margin-top:40vh">جارٍ الانضمام إلى الجلسة…</p>';
  }

  try {
    const { url } = await mutateAsync(sessionId);
    if (!url) {
      tab?.close();
    } else if (tab) {
      tab.location.replace(url);
    } else {
      window.location.assign(url);
    }
  } catch (err) {
    tab?.close();
    window.alert(err?.message ?? 'تعذّر الانضمام إلى الجلسة الآن، حاول مرة أخرى.');
  } finally {
    inFlight.delete(sessionId);
  }
}
