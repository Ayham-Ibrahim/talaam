# TAALAM — Educational Platform (React.js)

منصة تعليمية عربية (RTL) تربط الطلاب بأفضل المعلمين. مبنية بمعمارية احترافية قابلة للتوسع والصيانة، مع طبقة API معزولة تماماً تسمح بالانتقال من البيانات الوهمية إلى الباك الحقيقي **بتبديل متغير واحد فقط**.

---

## ✅ الحالة الحالية (المرحلة الأولى)

هذه المرحلة تحتوي على الأساس الكامل القابل للتشغيل:

- ✅ المعمارية الكاملة + هيكل المجلدات الاحترافي
- ✅ طبقة API معزولة (client + endpoints + services + hooks)
- ✅ البيانات الوهمية بنفس شكل الـ API الحقيقي تماماً
- ✅ مكتبة UI (Button, Card, Badge, Avatar, StarRating, PriceTag, Skeleton, EmptyState…)
- ✅ Navbar + Footer + Layout بنظام RTL كامل
- ✅ **صفحة Home كاملة** (Hero, أفضل المعلمين, الإحصائيات, كيف تعمل المنصة, آراء الطلاب, CTA)
- ⏳ صفحة البحث + صفحة ملف المعلم (placeholders جاهزة معمارياً — تُبنى في المرحلة التالية)

---

## 🚀 التشغيل

```bash
npm install
npm run dev      # يفتح على http://localhost:5173
```

أوامر أخرى:

```bash
npm run build    # بناء الإنتاج
npm run preview  # معاينة نسخة الإنتاج
```

---

## 🔌 التبديل من البيانات الوهمية إلى الباك الحقيقي

**هذا هو جوهر المعمارية.** كل شيء يعمل عبر طبقة خدمات معزولة. للانتقال للباك الحقيقي:

### 1. عدّل ملف `.env`

```env
VITE_API_BASE_URL=https://api.taalam.com/api
VITE_USE_MOCKS=false      # ← المفتاح الوحيد
```

بمجرد ضبط `VITE_USE_MOCKS=false`، يتحول التطبيق بالكامل لاستدعاء الباك الحقيقي. **لا حاجة لتعديل أي مكوّن.**

### 2. اجعل الباك يُرجع نفس الأشكال

الباك يجب أن يُرجع نفس شكل الـ response المُوثّق في:
- `src/mocks/teachers.mock.js` — شكل المعلم
- `src/mocks/data.mock.js` — الباقات، التقييمات، التوفر، الفلاتر، الإحصائيات

### 3. نقاط النهاية

جميع مسارات الـ API معرّفة في مكان واحد: `src/api/endpoints.js`. إن اختلفت مسارات الباك، هذا الملف الوحيد الذي تعدّله.

---

## 🏗️ كيف تتدفق البيانات

```
Component  →  Hook (React Query)  →  Service  →  [ Mock أو Real API ]
```

- **المكوّنات** لا تعرف شيئاً عن الـ API — تستخدم hooks فقط
- **الـ hooks** (`src/hooks/`) تغلّف React Query للـ caching وحالات التحميل والخطأ
- **الـ services** (`src/services/`) هي المكان **الوحيد** الذي يقرر: mock أم API حقيقي
- **الـ mocks** (`src/mocks/`) تحاكي شكل الباك تماماً

مثال — لإضافة حقل جديد للمعلم: عدّل الـ mock ليطابق الباك، والمكوّنات تلتقطه تلقائياً.

---

## 📁 هيكل المشروع

```
src/
├── api/            # client (axios) + endpoints + queryKeys
├── services/       # المكان الوحيد الذي يستدعي الـ API (mock/real switch)
├── mocks/          # بيانات وهمية بشكل الـ API الحقيقي
├── hooks/          # React Query hooks — المكوّنات تستخدم هذه
├── components/
│   ├── ui/         # مكتبة التصميم (primitives)
│   ├── layout/     # Navbar, Footer, PageContainer, Logo
│   ├── teacher/    # TeacherCard (مشترك)
│   └── home/       # أقسام الصفحة الرئيسية
├── pages/          # HomePage + placeholders
├── store/          # Zustand (filters, favorites)
├── config/         # env.js — مفتاح mock/real
├── locales/        # ar.json — كل نصوص الواجهة (i18n-ready)
├── lib/            # formatters (أرقام/أسعار/تواريخ عربية)
├── routes/         # AppRouter
└── theme/          # design tokens
```

---

## 🎨 نظام التصميم

الألوان والهوية مستخرجة من تصاميم TAALAM ومعرّفة في `tailwind.config.js`:

- **primary** `#3B5998` — الأزرق الكحلي (الأزرار، الروابط النشطة)
- **accent-pink → purple** — تدرج الـ hero وبطاقة الملف
- **success** `#2E9E6B` — شارة "معلم معتمد"
- **star** `#F5A623` — التقييمات
- **price** `#2F80ED` — الأسعار

كل النصوص العربية في `src/locales/ar.json` — لا يوجد نص مكتوب مباشرة في المكوّنات، جاهز لإضافة الإنجليزية.

---

## ⏭️ المرحلة التالية

- صفحة البحث الكاملة: FilterSidebar + ResultsGrid + مزامنة الفلاتر مع الـ URL
- صفحة ملف المعلم: BookingPanel + Calendar + TimeSlotPicker + PackageCards + Reviews
- حالات التحميل/الخطأ/الفراغ في كل مكان
- تحسينات الاستجابة على الموبايل + Accessibility pass

كل هذه الصفحات ستُبنى فوق نفس الـ hooks والـ services الجاهزة الآن — دون أي تعديل على طبقة البيانات.

---

**Tech Stack:** React 18 · Vite · React Router v6 · TanStack Query · Axios · Tailwind (RTL) · Zustand · react-hook-form · zod · Lucide
