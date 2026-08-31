// أحرف متشابهة الشكل مستبعدة عمداً (I/l/1، O/0) لتقليل خطأ نسخ يدوي عند مشاركة كلمة المرور المولَّدة
const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const LOWER = 'abcdefghijkmnpqrstuvwxyz';
const DIGITS = '23456789';
const SYMBOLS = '!@#$%^&*';
const ALL = UPPER + LOWER + DIGITS + SYMBOLS;

function randomChar(charset) {
  return charset[Math.floor(Math.random() * charset.length)];
}

/**
 * تحقق دائماً الحد الأدنى لسياسة كلمات المرور في الباك اند (Password::min(8)
 * ->mixedCase()->numbers() — راجع AppServiceProvider::boot): حرف كبير وصغير
 * ورقم مضمونون دوماً، مع رمز لقوة إضافية لا يشترطها الباك اند لكنه لا يضر.
 */
export function generateStrongPassword(length = 14) {
  const required = [randomChar(UPPER), randomChar(LOWER), randomChar(DIGITS), randomChar(SYMBOLS)];
  const rest = Array.from({ length: Math.max(0, length - required.length) }, () => randomChar(ALL));
  const chars = [...required, ...rest];

  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
}
