/**
 * Utilities for turning Laravel's 422 validation error shape into UI-friendly output.
 *
 * The API client (`src/api/client.js`) normalizes every failed request into
 * `{status, message, errors}`, where `errors` is Laravel's raw validation-errors
 * object verbatim: `{ field: [msg, ...], "field.0": [msg], "field.2.sub": [msg] }`
 * — dot-notation keys for array items / nested fields. These helpers work on
 * that `errors` object (or on the whole normalized error) so every form can
 * show *all* field errors, correctly attributed, instead of picking one at random.
 */

/** All {path, message} pairs, one per field — message is the first validation message for that field. */
export function flattenErrors(errors) {
  if (!errors || typeof errors !== 'object') return [];
  return Object.entries(errors).map(([path, messages]) => ({
    path,
    message: Array.isArray(messages) ? messages[0] : String(messages),
  }));
}

/** The message for one exact field path (e.g. "email" or "schedules.2.start_time"), or undefined. */
export function getFieldError(errors, path) {
  const messages = errors?.[path];
  return Array.isArray(messages) ? messages[0] : messages;
}

/**
 * A readable "label: message" list for every error — the safe default for
 * surfacing validation failures the UI doesn't (or can't, e.g. a wizard step
 * that isn't currently mounted) attach inline next to a specific input.
 *
 * `labelFor(path)` maps a raw Laravel path to a human label; it receives the
 * full path (e.g. "schedules.2.start_time") so it can resolve array indices
 * to something like "الجدولة #3". Returning a falsy value falls back to the
 * raw path so nothing is ever silently dropped.
 */
export function formatErrorList(errors, labelFor = (path) => path) {
  return flattenErrors(errors).map(({ path, message }) => {
    const label = labelFor(path);
    return label ? `${label}: ${message}` : message;
  });
}

/** First error message overall, falling back to the top-level message, then to `fallback`. */
export function firstErrorMessage(error, fallback = null) {
  if (!error) return null;
  const flat = flattenErrors(error.errors);
  return flat[0]?.message ?? error.message ?? fallback;
}
