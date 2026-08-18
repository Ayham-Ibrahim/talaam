export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_PATTERN = /^\+?\d{7,24}$/;

const NAME_ALLOWED_INPUT_PATTERN = /^[\p{L}\p{M}\s'-]*$/u;
const NAME_VALIDATION_PATTERN = /^[\p{L}\p{M}]+(?:[\s'-][\p{L}\p{M}]+)*$/u;
const NAME_ALLOWED_CHARACTER_PATTERN = /[\p{L}\p{M}\s'-]/u;
const ARABIC_INDIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';
const EASTERN_ARABIC_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

const EDITING_KEYS = new Set(['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Tab']);

export function isEditingKey(event) {
  return event.ctrlKey || event.metaKey || event.altKey || EDITING_KEYS.has(event.key) || event.key.length > 1;
}

export function normalizePhoneDigits(value) {
  return value
    .replace(/[٠-٩]/g, (digit) => String(ARABIC_INDIC_DIGITS.indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String(EASTERN_ARABIC_DIGITS.indexOf(digit)));
}

export function sanitizePhone(value) {
  const normalizedValue = normalizePhoneDigits(value);
  const hasLeadingPlus = normalizedValue.startsWith('+');
  const digitsOnly = normalizedValue.replace(/\D/g, '');
  return `${hasLeadingPlus ? '+' : ''}${digitsOnly}`;
}

export function isPhoneInputCharacterValid(value) {
  return /^\+?[\d٠-٩۰-۹]*$/.test(value) && value.indexOf('+') <= 0;
}

export function sanitizeName(value) {
  return Array.from(value)
    .filter((char) => NAME_ALLOWED_CHARACTER_PATTERN.test(char))
    .join('')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s+/, '');
}

export function isNameInputCharacterValid(value) {
  return NAME_ALLOWED_INPUT_PATTERN.test(value);
}

export function normalizeNameForValidation(value) {
  return value.replace(/\s{2,}/g, ' ').trim();
}

export function validateName(value) {
  const trimmedValue = normalizeNameForValidation(value);

  if (trimmedValue === '') return 'required';
  if (trimmedValue.length > 150) return 'tooLong';
  if (!NAME_VALIDATION_PATTERN.test(trimmedValue)) return 'invalid';

  return null;
}

export function validateEmail(value) {
  const trimmedValue = value.trim();

  if (trimmedValue === '') return 'required';
  if (trimmedValue.length > 150) return 'tooLong';
  if (!EMAIL_PATTERN.test(trimmedValue)) return 'invalid';

  return null;
}

export function validatePhone(value) {
  if (value === '') return null;
  if (value.length > 25) return 'tooLong';
  if (!PHONE_PATTERN.test(value)) return 'invalid';

  return null;
}

export function validatePassword(value) {
  if (value === '') return 'required';
  if (value.length < 8) return 'min';
  if (value.length > 255) return 'tooLong';

  return null;
}