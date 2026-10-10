import { config } from '@/config/env';

/** يبني رابطاً مطلقاً كاملاً من مسار نسبي، باستخدام نطاق المنصة النهائي (config.siteUrl) */
export function absoluteUrl(path = '/') {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${config.siteUrl}${clean}`;
}

/**
 * EducationalOrganization — بيانات المنصة نفسها، حقيقية بالكامل (فوتر الموقع
 * + صفحة تواصل معنا). العنوان من contact.info بـ ar.json ("الأردن / عمان /
 * حي الجميلية") — المصدر الحقيقي الوحيد الموجود بالكود لعنوان فعلي.
 */
export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'TAALAM',
    alternateName: 'تعلّم',
    url: config.siteUrl,
    logo: absoluteUrl('/logo.png'),
    image: absoluteUrl('/logo.png'),
    telephone: '+971529426077',
    email: 'TAALAM@gmail.com',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'JO',
      addressRegion: 'عمان',
      addressLocality: 'حي الجميلية',
    },
    areaServed: {
      '@type': 'Country',
      name: 'United Arab Emirates',
    },
    sameAs: [
      'https://www.facebook.com/profile.php?id=61562033186054',
      'https://www.instagram.com/taalam.2024/',
      'https://www.tiktok.com/@t3allem.edu',
      'https://youtube.com/@t3allemedu',
    ],
  };
}

/** WebSite — يفعّل صندوق بحث Google داخل نتائج البحث (Sitelinks Search Box) إن قبِلته Google لاحقاً */
export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'TAALAM',
    url: config.siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${absoluteUrl('/search')}?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

/** BreadcrumbList عام — items: [{ name, path }] بالترتيب من الجذر */
export function breadcrumbJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/**
 * Person + AggregateRating لملف معلم عام — كل حقل هنا من بيانات حقيقية
 * (mapPublicProfile/PublicTeacherResource)، لا رقم هاتف إطلاقاً عمداً (راجع
 * التوثيق: الهاتف محجوب عن كل سطح عام بالتصميم في الفرونت والباك معاً).
 */
export function teacherJsonLd(teacher) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: teacher.name,
    url: absoluteUrl(`/teacher/${teacher.id}`),
    image: teacher.avatar || undefined,
    description: teacher.bio || undefined,
    jobTitle: teacher.typeLabel || 'معلم',
    worksFor: {
      '@type': 'EducationalOrganization',
      name: 'TAALAM',
      url: config.siteUrl,
    },
    knowsLanguage: (teacher.languages ?? []).map((l) => l.label).filter(Boolean),
    knowsAbout: [...(teacher.subjects ?? []), ...(teacher.curricula ?? [])].filter(Boolean),
    address: teacher.city
      ? { '@type': 'PostalAddress', addressLocality: teacher.city, addressCountry: 'AE' }
      : undefined,
  };

  if (teacher.reviewsCount > 0) {
    data.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: teacher.rating,
      reviewCount: teacher.reviewsCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  // يحذف المفاتيح undefined كي لا تظهر "null"/"undefined" حرفياً بالـ JSON-LD المنشور
  return JSON.parse(JSON.stringify(data));
}

/** FAQPage — من الأسئلة الشائعة الحقيقية التي يديرها المعلم (أو الأدمن نيابةً عنه) بنفسه */
export function faqJsonLd(faqs) {
  if (!faqs?.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs
      .filter((f) => f.question && f.answer)
      .map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
  };
}

/** ItemList — نتائج صفحة البحث، لكل معلم رابطه الحقيقي وترتيبه بالنتيجة */
export function teacherListJsonLd(teachers) {
  if (!teachers?.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: teachers.map((teacher, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: absoluteUrl(`/teacher/${teacher.id}`),
      name: teacher.name,
    })),
  };
}
