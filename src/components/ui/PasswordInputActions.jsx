import { Eye, EyeOff, Wand2 } from 'lucide-react';
import { generateStrongPassword } from '@/lib/generatePassword';
import { useT } from '@/hooks/useT';

/**
 * زرّا "توليد كلمة مرور" و"إظهار/إخفاء" — يُستخدمان كشقيقَين فعليَّين للحقل
 * ضمن حاوية flex (لا موضعة مطلقة فوق الحقل) لتجنّب أي تعقيد padding/اتجاه
 * نص (الحقول هنا dir="ltr" دوماً ضمن صفحة rtl عامة).
 */
export function PasswordInputActions({ visible, onToggleVisible, onGenerate }) {
  const t = useT();

  return (
    <div className="flex shrink-0 items-center gap-1">
      <button
        type="button"
        onClick={() => onGenerate(generateStrongPassword())}
        title={t('common.generatePassword')}
        aria-label={t('common.generatePassword')}
        className="flex h-9 w-9 items-center justify-center rounded-btn border border-line text-ink-soft hover:bg-line/40 hover:text-primary"
      >
        <Wand2 size={16} />
      </button>
      <button
        type="button"
        onClick={onToggleVisible}
        title={visible ? t('common.hidePassword') : t('common.showPassword')}
        aria-label={visible ? t('common.hidePassword') : t('common.showPassword')}
        className="flex h-9 w-9 items-center justify-center rounded-btn border border-line text-ink-soft hover:bg-line/40 hover:text-primary"
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}
