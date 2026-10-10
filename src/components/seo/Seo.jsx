import { Helmet } from 'react-helmet-async';
import { absoluteUrl } from '@/lib/seo';

// لا توجد صورة مشاركة مُصمَّمة خصيصاً (1200×630) بعد — الشعار الحالي هو
// البديل المتاح الوحيد فعلياً إلى أن تُضاف صورة og-default.png حقيقية بالمقاس
// الصحيح (راجع ملف التوثيق النهائي لتفاصيل هذا القيد).
const DEFAULT_OG_IMAGE = '/logo.png';

/**
 * عنصر SEO قابل لإعادة الاستخدام لكل صفحة عامة — عنوان/وصف/canonical/OG/
 * Twitter، وأي عدد من كائنات JSON-LD (jsonLd: object أو array منها معاً).
 * title/description دائماً من بيانات حقيقية تُمرَّر من الصفحة نفسها، لا نص
 * عام مكرر — كل صفحة لازم توصف محتواها الفعلي بالضبط.
 */
export function Seo({ title, description, path, image, type = 'website', noindex = false, jsonLd }) {
  const url = path ? absoluteUrl(path) : undefined;
  const ogImage = image ? (image.startsWith('http') ? image : absoluteUrl(image)) : absoluteUrl(DEFAULT_OG_IMAGE);
  const ldItems = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      {title && <title>{title}</title>}
      {title && <meta property="og:title" content={title} />}
      {title && <meta name="twitter:title" content={title} />}

      {description && <meta name="description" content={description} />}
      {description && <meta property="og:description" content={description} />}
      {description && <meta name="twitter:description" content={description} />}

      {url && <link rel="canonical" href={url} />}
      {url && <meta property="og:url" content={url} />}

      <meta property="og:type" content={type} />
      <meta property="og:image" content={ogImage} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:card" content="summary_large_image" />

      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />

      {ldItems.map((item, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(item)}
        </script>
      ))}
    </Helmet>
  );
}
