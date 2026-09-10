# Teacher Profile Page — Static / Non‑Dynamic Data

**Scope:** `src/pages/TeacherProfilePage.jsx` and its child components.
**Assumes** `VITE_USE_MOCKS=false` (real backend). With mocks on, *everything* is static (`src/mocks/teachers.mock.js`).

Legend:

| Tag | Meaning |
|-----|---------|
| 🟥 **HARDCODED** | Literal value in the code. No backend field exists or is consulted. |
| 🟧 **PROXY** | Rendered from a *different* real field than the label implies. No dedicated backend field. |
| 🟨 **CLIENT‑COMPUTED** | Derived in the browser, not returned as a backend aggregate. |
| 🟦 **LABEL MAP** | Static translation of a **real** enum value coming from the DB. Low risk. |
| 🟩 **DYNAMIC** | Live from the API. Listed at the bottom for completeness. |

---

## 1. 🟥 HARDCODED

### 1.1 Availability calendar — time slots
- **File:** `src/components/teacher/AvailabilityCalendar.jsx:7`
  ```js
  const SLOT_HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
  ```
- **Rendered at:** line 151 (`SLOT_HOURS.map(...)`), used by `BookingWidget` (`:350`).
- **Why static:** There is **no bookable time‑slot data** in the backend. `AvailabilitySlot`
  (`app/Models/AvailabilitySlot.php`) stores **only** `teacher_id` + `day_of_week` — no times.
  So the hourly chips `9:00 صباحاً … 9:00 مساءً` are invented for every teacher.
- **What IS real here:** `slotStatus(time)` (`BookingWidget.jsx:109`) filters each chip against
  the teacher's `busySlots` (real query) + the student's own calendar conflicts + past times.
- **To make dynamic:** add `start_time` / `end_time` (or a slot table) to the teacher's
  availability, expose a public endpoint, and generate the chips from real windows.

### 1.2 Availability calendar — weekday header
- **File:** `src/components/teacher/AvailabilityCalendar.jsx:9`
  ```js
  const WEEKDAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  ```
- **Why static:** design copy from the Figma date‑picker. English initials, never localised.
- **To fix:** swap for `t('booking.weekdays')` (already exists: `["أحد","إثنين",…]`) or Intl.

### 1.3 Teaching‑scope — subject dot colours
- **File:** `src/components/teacher/TeacherTeachingScopeSection.jsx:6`
  ```js
  const SUBJECT_DOTS = ["#B00852", "#6BCEEE", "#F5A623", "#7E57C2", "#2E9E6B", "#2F80ED"];
  ```
- **Rendered at:** line 50 — `dot={SUBJECT_DOTS[i % SUBJECT_DOTS.length]}`.
- **Why static:** the coloured dot next to each subject is assigned **by array index**, not by
  any backend attribute. "رياضيات" is magenta only because it's first in the list.
- **To make dynamic:** add a `color` column to the `subjects` taxonomy table and return it in
  `PublicTeacherResource` → `subjects[]`.

### 1.4 Teaching‑scope — neutral dot colour
- **File:** `TeacherTeachingScopeSection.jsx:4` — `const NEUTRAL_DOT = "#C7D0DF";`
  (stages / exam‑prep / curricula). Pure styling, matches Figma. Fine to leave.

### 1.5 Language flag images
- **File:** `TeacherTeachingScopeSection.jsx:3`
  ```js
  const LANGUAGE_FLAGS = { ar: "/ar.png", en: "/en.png" };
  ```
- **Why static:** flags are picked by language `code` from two bundled PNGs in `/public`.
  `ar.png` is a generic flag — it does **not** reflect the teacher's country
  (the Figma shows a Jordan flag; the asset is not that).
- **To fix:** ship a proper flag set (or use emoji) keyed by language, or add a country to the
  language record.

### 1.6 Header — decorative gradients & shapes
- **File:** `src/components/teacher/TeacherProfileHeader.jsx:6‑7`
  ```js
  const HERO_GRADIENT  = "linear-gradient(89.95deg, #9E074A 3.11%, #243757 98.69%)";
  const SHAPE_GRADIENT = "linear-gradient(180deg, #C962B3 0%, #8C74C5 100%)";
  ```
  Plus the rotated shape (`:76`) and white blur glow. **Pure decoration** — intentionally static.

### 1.7 Header — rating star colour
- **File:** `TeacherProfileHeader.jsx:44` — `fill-[#FF8D28] text-[#FF8D28]`. Styling only.

### 1.8 Reviews — palette
- **File:** `src/components/teacher/RatingReviews.jsx:5` — `const ORANGE = '#F74E28';`
  Also track `#D9D9D9` (`:33`), number `#333333` (`:53`). Styling only, matches Figma.

### 1.9 About — video card
- **File:** `src/components/teacher/TeacherAboutSection.jsx`
  - `:6` `CARD` shadow/radius, `:67` `bg-[#272727]`, `:79` `#272727/50` overlay — styling.
  - `:46` YouTube poster URL is built as `…/hqdefault.jpg` — **derived**, not a stored thumbnail.
  - `:81` play icon (`CirclePlay`) — static asset.

### 1.10 Credentials — experience bullet colour
- **File:** `src/components/teacher/TeacherCredentialsSection.jsx:29` — `bg-primary` dot,
  `:45` `dot="#C7D0DF"` for qualification pills. Styling only.

### 1.11 Currency conversion rates
- **File:** `src/lib/currency.js:6` (`CURRENCIES` array) + `:23` `convertPrice`.
- **File header comment:** *"Static, illustrative exchange rates … there's no live rates API
  wired up yet, so these are mock figures for the demo only."*
- **Impact:** every non‑USD price on the page (packages, booking total) is a fake conversion.
- **To fix:** wire a real FX source and cache it server‑side.

### 1.12 All UI copy
- **Files:** `src/locales/ar.json` / `en.json`.
- Section titles ("نبذة عن المعلم", "التقييم", "الباقات", "التوفر"…), the breadcrumb
  (`TeacherProfilePage.jsx:87‑92`), stat labels, button text. Expected to be static.

---

## 2. 🟧 PROXY — shown under a label that has no matching backend field

### 2.1 Header stat "نوع التدريس" (design value: *اونلاين / حضوري*)
- **File:** `TeacherProfileHeader.jsx:16`
  ```js
  const teachingType = teacher.teachingMethods?.slice(0, 2).join(" / ") || teacher.typeLabel;
  ```
- **Reality:** there is **no online/in‑person field**. The value shown is the first two entries
  of `teaching_methods` (e.g. "شرح مباشر / حل واجبات"), or the type label as a fallback.
- **To make real:** add `delivery_mode` (`online` / `onsite` / `both`) to the `teachers` table
  + request validation + `PublicTeacherResource` + a profile‑editor field.

### 2.2 Header stat "معدل الطلاب الدائمين" (retention %)
- **File (frontend):** `TeacherProfileHeader.jsx:34‑38` → `teacher.satisfactionRate`
  → `teacherService.js:84` → `raw.stats.satisfaction_rate`.
- **File (backend):** `app/Services/TeacherService.php` → `getStats()`:
  ```php
  'satisfaction_rate' => match (true) {
      (float) $teacher->completion_rate > 0 => (int) round((float) $teacher->completion_rate),
      (float) $teacher->rating_avg > 0      => (int) round(($teacher->rating_avg / 5) * 100),
      default => null,
  },
  ```
- **Reality:** `completion_rate` is a column that **nothing currently populates** (stays 0), so
  the number shown is really **`rating_avg / 5 × 100`** — the average rating expressed as a
  percentage, mislabelled as a retention rate.
- **To make real:** compute an actual returning‑student ratio (students with ≥2 bookings /
  total students) in `getStats`, or populate `completion_rate` from completed‑vs‑booked sessions.

### 2.3 المراحل الدراسية / الصفوف الدراسية (stages / grades)
- **File:** `teacherService.js:75‑76` — comment: *"مُشتقّة من باقاته الفعلية القابلة للحجز …
  ليست حقلاً في ملفه الشخصي مباشرة"*.
- **Reality:** the teacher has no "stages I teach" field. These are **collected from the
  stages/grades attached to the teacher's active bookable packages**. Remove all packages →
  these cards disappear even though the teacher still teaches those levels.
- **To make real:** add a stages/grades relation directly on the teacher profile.

### 2.4 التحضير للامتحانات (exam prep)
- **Field exists** (`teachers.exam_prep` JSON, added in
  `2026_01_01_000026_add_exam_prep_to_teachers.php`) and flows through the API — **but there is
  no editor UI**. A real teacher can't set it; it only has data via `DemoAccountsSeeder`.
- Same gap applies to `teaching_methods` and `age_groups`.

### 2.5 المؤهلات العلمية (qualifications)
- **File:** `teacherService.js:67` — `qualifications: raw.qualification ? [ … ] : []`.
- **Reality:** the backend stores a **single** `qualification` enum, so this card can only ever
  show **one** pill. The Figma shows several ("بكالوريوس رياضيات", "ماجستير",
  "شهادات تدريس معتمدة"). Needs a `teacher_qualifications` table for multiple.

### 2.6 Header location text
- **File:** `TeacherProfileHeader.jsx` info row → `teacher.city` → `teacherService.js:66`.
- The Figma "الأردن - عمّان - حي الطويل" is a single `city` string. There is no
  country / district breakdown; the demo value was seeded as one string.

---

## 3. 🟨 CLIENT‑COMPUTED (not a backend aggregate)

### 3.1 Rating distribution bars (5→1 %)
- **File:** `src/services/index.js:189‑207` (`getRatingSummary`).
- **Comment in code:** *"No dedicated rating‑summary endpoint exists — the distribution (%/star)
  isn't derivable from teacher.stats alone, so it's computed here from the same
  reviews‑for‑teacher page (capped at the latest 100)."*
- **Impact:** with >100 reviews the bars are based on a **sample**, not the full history.
  `average` and `total` are DB‑exact; only the per‑star split is approximate.
- **To fix:** add `GET /teachers/{id}/rating-summary` returning `COUNT(*) GROUP BY rating`.

### 3.2 Intro‑video duration
- **File:** `teacherService.js:35‑38, 86` — `formatDuration(intro_video_seconds)`.
  Real seconds from the DB, formatted client‑side. Fine.

---

## 4. 🟦 LABEL MAPS (static text, real enum key)

All in `src/services/teacherService.js`. The **value** shown is a hardcoded Arabic string, but
it is chosen by a **real** enum returned from the DB — so it's correct, just not translatable
per‑request without touching these maps.

| Const | Line | Maps | Used for |
|-------|------|------|----------|
| `TEACHER_TYPE_LABELS` | `:6` | `teacher_type` → `مدرسي` / `مدرس جامعي` / `مدرب` | header specialty (`typeLabel`) |
| `EXPERIENCE_LABELS` | `:12` | `experience_years` → `أكثر من 5 سنوات خبرة` … | header info row |
| `EXPERIENCE_LABELS_SHORT` | `:20` | `experience_years` → `+5 سنوات` … | header stat "الخبرة" |
| `QUALIFICATION_LABELS` | `:27` | `qualification` → `بكالوريوس` … | credentials card |

Session‑format labels: `src/locales/ar.json` → `teacher.sessionFormatShort` (`فردية` / `جماعية`)
— keyed off the real `session_format` on packages.

---

## 5. 🟩 DYNAMIC (live from the API — for reference)

`GET /teachers/{id}` (`PublicTeacherResource`):
`name`, `avatar`, `status`/verified, `teacher_type`, **`bio`**, **`city`**, **`experiences[]`**
(title, period), **`qualification`**, **`subjects[]`**, **`curricula[]`**, **`languages[]`**,
**`exam_prep[]`**, **`badges[]`** (name + icon), `intro_youtube_id` / `intro_video_path` /
`intro_video_seconds`, **`videos[]`**, and **`stats`** → `rating_avg`, `reviews_count`,
`completed_sessions`, `total_students`, `teaching_hours` (all real DB / computed values).

`GET /teachers/{id}/packages` (`StudentPackageResource`): full package data — title, description,
`session_format`, `capacity`, `enrolled_count`, `sessions_count`, `student_price`, `currency`,
`discount_percent`, `curricula`, `stages`, `grades`, `schedules[]`.

`GET /teachers/{id}/reviews`: review cards — student name, avatar, `rating`, `comment`.

Favourite state: `GET /favorites`.

---

## 6. Recommended backend work (priority order)

1. **Rating‑summary endpoint** — exact per‑star distribution (removes §3.1).
2. **Teacher `delivery_mode`** field — real "نوع التدريس" (removes §2.1).
3. **Availability windows with times** — real slot chips (removes §1.1).
4. **Real retention metric** in `getStats` (removes §2.2).
5. **Stages/grades relation on the teacher** — independent of packages (removes §2.3).
6. **Profile‑editor fields** for `exam_prep` / `teaching_methods` / `age_groups` (removes §2.4).
7. **`teacher_qualifications` table** — multiple qualifications (removes §2.5).
8. **Subject `color` column** — real subject dots (removes §1.3).
9. **Live FX rates** (removes §1.11).

---

## 7. ⚠️ Demo seed data (real in the API now, but authored for the demo)

`database/seeders/DemoAccountsSeeder.php` populates the demo teacher (`teacher@taalam.test`,
teacher id 1) with: the Jordan `city` string, 48 completed `ClassSession` rows, `exam_prep`
`[SAT, ACT, IB, IGCSE]`, 5 curricula, English + Arabic languages, 3 `TeacherExperience` rows,
3 badges, an active group package + schedule, and 6 reviews (avg 4.5).

A freshly‑created teacher would show **none** of this until they fill their profile.
