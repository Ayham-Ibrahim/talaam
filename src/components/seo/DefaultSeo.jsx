import { Helmet } from 'react-helmet-async';
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo';

/**
 * قيم افتراضية على مستوى التطبيق كله — تُركَّب أول عنصر بالشجرة (قبل
 * AppRouter)، فأي صفحة لم تضف <Seo> خاصاً بها بعد تبقى محمية بعنوان/وصف
 * معقولين بدل ترك الصفحة بلا وصف إطلاقاً. أي <Seo> داخل صفحة أعمق بالشجرة
 * يستبدل هذه القيم تلقائياً (سلوك react-helmet-async القياسي: الأعمق/الأحدث
 * بالعرض يفوز لكل وسم فريد مثل title).
 */
export function DefaultSeo() {
  return (
    <Helmet>
      <title>TAALAM | منصة تعليمية تربط الطلاب بأفضل المعلمين المعتمدين في الإمارات</title>
      <meta
        name="description"
        content="منصة تعليمية إماراتية تربط الطلاب بأفضل المعلمين المعتمدين في مختلف المواد والمراحل الدراسية والمناهج (وطني، بريطاني، أمريكي، IGCSE) — احجز حصتك الآن."
      />
      <meta property="og:site_name" content="TAALAM" />
      <meta property="og:locale" content="ar_AE" />
      <script type="application/ld+json">{JSON.stringify(organizationJsonLd())}</script>
      <script type="application/ld+json">{JSON.stringify(websiteJsonLd())}</script>
    </Helmet>
  );
}
