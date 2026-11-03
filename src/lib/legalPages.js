import { FileText, GraduationCap, ShieldCheck, UserCheck } from 'lucide-react';

/**
 * كل صفحات legal_pages بالباك (LegalPageController) — مصدر واحد لمسارها العام وعنوانها
 * وأيقونتها، تستخدمه صفحة العرض العامة وقائمة الأدمن ومحرّرها والراوتر والفوتر.
 */
export const LEGAL_PAGES = {
  privacy: { path: '/privacy-policy', icon: ShieldCheck, titleKey: 'legal.privacyTitle', subtitleKey: 'legal.privacySubtitle' },
  terms: { path: '/terms-conditions', icon: FileText, titleKey: 'legal.termsTitle', subtitleKey: 'legal.termsSubtitle' },
  'student-policy': {
    path: '/student-policy',
    icon: GraduationCap,
    titleKey: 'legal.studentPolicyTitle',
    subtitleKey: 'legal.studentPolicySubtitle',
  },
  'teacher-policy': {
    path: '/teacher-policy',
    icon: UserCheck,
    titleKey: 'legal.teacherPolicyTitle',
    subtitleKey: 'legal.teacherPolicySubtitle',
  },
};

export const LEGAL_PAGE_SLUGS = Object.keys(LEGAL_PAGES);

/** سياسة دور المستخدم الحالي — المعلم لسياسة المعلم، وأي دور آخر لسياسة الطالب */
export function rolePolicyPath(role) {
  return role === 'teacher' ? LEGAL_PAGES['teacher-policy'].path : LEGAL_PAGES['student-policy'].path;
}
