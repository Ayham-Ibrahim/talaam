import { useEffect } from "react";

const SCRIPT_ID = "elfsight-platform";
const SCRIPT_SRC = "https://elfsightcdn.com/platform.js";

/** معرّف الودجة من حساب Elfsight (All-in-One Chat) — يُنسخ كما هو من لوحة تحكّمهم. */
const WIDGET_CLASS = "elfsight-app-7de2a882-3023-4ca0-8b26-bd6aaab7d01a";

/**
 * أيقونة التواصل العائمة (واتساب/تلغرام/بريد… حسب ما هو مفعَّل في حساب
 * Elfsight). الكود الذي تعطيه المنصّة مكتوب لموقع HTML عادي، فوضعه في
 * index.html هنا يعني تحميل سكربتهم قبل أن يقلع React ووقوف الأيقونة فوق
 * شاشة الـ LogoIntro؛ لذلك نغلّفه بمكوّن يُركَّب بعد انتهاء المقدّمة فقط.
 *
 * السكربت يبني الودجة داخل الـ div بنفسه، وReact لا يمسّ محتواه أبداً (لا
 * أبناء له في JSX)، فلا يتصادم الاثنان على نفس العنصر.
 */
export function ElfsightChat() {
  useEffect(() => {
    // platform.js يراقب الـ DOM بنفسه ويلتقط أي عنصر ودجة جديد، فتحميله مرّة
    // واحدة لكل جلسة يكفي مهما تكرّر تركيب المكوّن.
    if (document.getElementById(SCRIPT_ID)) return;

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    document.body.appendChild(script);

    // لا نحذف السكربت عند التفكيك عمداً: إعادة تحميله أبطأ بكثير من تركه،
    // والودجة تختفي أصلاً باختفاء عنصرها أدناه.
  }, []);

  return <div className={WIDGET_CLASS} data-elfsight-app-lazy />;
}
