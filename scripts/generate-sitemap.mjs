/**
 * يولّد public/sitemap.xml من بيانات حقيقية — كل معلم موثّق (verified) فعلياً
 * عبر GET /teachers/search العام نفسه الذي تستخدمه صفحة البحث، بلا أي بيانات
 * وهمية أو ثابتة. يُشغَّل يدوياً (npm run generate-sitemap) وليس تلقائياً ضمن
 * npm run build عمداً — لأنه يعتمد على اتصال فعلي بالباك اند وقت التوليد، وقد
 * لا يكون متاحاً أثناء كل بناء (مثلاً CI/CD بلا شبكة للباك اند). شغّله يدوياً
 * بعد أي دفعة معلمين جدد، أو اربطه بـ cron دوري على السيرفر لاحقاً.
 *
 * الاستخدام: VITE_API_BASE_URL=... node scripts/generate-sitemap.mjs
 * (أو اترك الافتراضي أدناه إن كنت تولّده محلياً مقابل باك اند محلي)
 */
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SITE_URL = (process.env.VITE_SITE_URL || 'https://t3allem.com').replace(/\/$/, '');
const API_BASE_URL = (process.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api').replace(/\/$/, '');

const STATIC_PAGES = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/search', priority: '0.9', changefreq: 'daily' },
  { path: '/teaching/school', priority: '0.8', changefreq: 'daily' },
  { path: '/teaching/university', priority: '0.8', changefreq: 'daily' },
  { path: '/teaching/training', priority: '0.8', changefreq: 'daily' },
  { path: '/about', priority: '0.5', changefreq: 'monthly' },
  { path: '/how-it-works', priority: '0.5', changefreq: 'monthly' },
  { path: '/contact', priority: '0.4', changefreq: 'monthly' },
];

/** يسحب كل صفحات نتائج البحث العام (نفس endpoint صفحة /search) ويجمع هويات المعلمين الموثَّقين فقط */
async function fetchAllVerifiedTeacherIds() {
  const ids = [];
  let page = 1;
  let lastPage = 1;

  do {
    const res = await fetch(`${API_BASE_URL}/teachers/search?per_page=100&page=${page}`);
    if (!res.ok) {
      throw new Error(`فشل طلب ${API_BASE_URL}/teachers/search (صفحة ${page}): HTTP ${res.status}`);
    }
    const json = await res.json();
    for (const teacher of json.data ?? []) {
      ids.push(teacher.id);
    }
    lastPage = json.meta?.last_page ?? 1;
    page++;
  } while (page <= lastPage);

  return ids;
}

function buildXml(staticPages, teacherIds) {
  const today = new Date().toISOString().slice(0, 10);

  const urlEntries = [
    ...staticPages.map(
      (p) => `  <url>
    <loc>${SITE_URL}${p.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
    ),
    ...teacherIds.map(
      (id) => `  <url>
    <loc>${SITE_URL}/teacher/${id}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
    ),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join('\n')}
</urlset>
`;
}

async function main() {
  console.log(`جاري سحب المعلمين الموثَّقين من ${API_BASE_URL}/teachers/search ...`);
  const teacherIds = await fetchAllVerifiedTeacherIds();
  console.log(`تم العثور على ${teacherIds.length} معلم موثّق.`);

  const xml = buildXml(STATIC_PAGES, teacherIds);
  const outPath = resolve(__dirname, '../public/sitemap.xml');
  writeFileSync(outPath, xml, 'utf8');

  console.log(`✓ تم إنشاء ${outPath} — ${STATIC_PAGES.length + teacherIds.length} رابط.`);
}

main().catch((err) => {
  console.error('فشل توليد sitemap.xml:', err.message);
  process.exit(1);
});
