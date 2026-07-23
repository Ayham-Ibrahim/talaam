/**
 * Taxonomy mocks — mirrors GET/POST/PUT/DELETE /taxonomy/{type} on the
 * backend, which is a single generic controller over 7 lookup tables.
 * We mirror that here with one config array instead of 7 near-identical files.
 */

export const TAXONOMY_TYPES = [
  { key: 'curricula', label: 'المناهج', hasCode: true, hasEducationType: false },
  { key: 'stages', label: 'المراحل الدراسية', hasCode: true, hasEducationType: true },
  { key: 'subjects', label: 'المواد', hasCode: true, hasEducationType: false },
  { key: 'universities', label: 'الجامعات', hasCode: false, hasEducationType: false },
  { key: 'majors', label: 'التخصصات', hasCode: false, hasEducationType: false },
  { key: 'course_fields', label: 'مجالات الدورات', hasCode: true, hasEducationType: false },
  { key: 'languages', label: 'اللغات', hasCode: true, hasEducationType: false },
];

export const EDUCATION_TYPE_LABELS = {
  school: 'مدرسي',
  university: 'جامعي',
  training: 'تدريبي',
};

let mockTaxonomyData = {
  curricula: [
    { id: 1, code: 'national', name_ar: 'وطني' },
    { id: 2, code: 'ib', name_ar: 'البكالوريا الدولية IB' },
    { id: 3, code: 'american', name_ar: 'أمريكي' },
    { id: 4, code: 'british', name_ar: 'بريطاني' },
  ],
  stages: [
    { id: 1, code: 'primary', name_ar: 'ابتدائي', education_type: 'school' },
    { id: 2, code: 'middle', name_ar: 'متوسط', education_type: 'school' },
    { id: 3, code: 'secondary', name_ar: 'ثانوي', education_type: 'school' },
    { id: 4, code: 'bachelor', name_ar: 'بكالوريوس', education_type: 'university' },
    { id: 5, code: 'master', name_ar: 'ماجستير', education_type: 'university' },
  ],
  subjects: [
    { id: 1, code: 'math', name_ar: 'رياضيات' },
    { id: 2, code: 'physics', name_ar: 'فيزياء' },
    { id: 3, code: 'chemistry', name_ar: 'كيمياء' },
    { id: 4, code: 'english', name_ar: 'اللغة الانكليزية' },
    { id: 5, code: 'arabic', name_ar: 'اللغة العربية' },
  ],
  universities: [
    { id: 1, name_ar: 'الجامعة الأردنية' },
    { id: 2, name_ar: 'جامعة الملك سعود' },
    { id: 3, name_ar: 'الجامعة الأمريكية في الشارقة' },
  ],
  majors: [
    { id: 1, name_ar: 'هندسة حاسوب' },
    { id: 2, name_ar: 'إدارة أعمال' },
    { id: 3, name_ar: 'طب بشري' },
  ],
  course_fields: [
    { id: 1, code: 'pm', name_ar: 'إدارة مشاريع' },
    { id: 2, code: 'marketing', name_ar: 'تسويق رقمي' },
    { id: 3, code: 'data', name_ar: 'تحليل بيانات' },
    { id: 4, code: 'programming', name_ar: 'برمجة' },
  ],
  languages: [
    { id: 1, code: 'ar', name_ar: 'العربية' },
    { id: 2, code: 'en', name_ar: 'الانكليزية' },
    { id: 3, code: 'fr', name_ar: 'الفرنسية' },
  ],
};

let nextId = 1000;

export function getMockTaxonomyItems(type) {
  return mockTaxonomyData[type] ?? [];
}

export function createMockTaxonomyItem(type, payload) {
  const created = { id: nextId++, ...payload };
  mockTaxonomyData = { ...mockTaxonomyData, [type]: [...(mockTaxonomyData[type] ?? []), created] };
  return created;
}

export function updateMockTaxonomyItem(type, id, payload) {
  mockTaxonomyData = {
    ...mockTaxonomyData,
    [type]: (mockTaxonomyData[type] ?? []).map((item) => (item.id === Number(id) ? { ...item, ...payload } : item)),
  };
  return mockTaxonomyData[type].find((item) => item.id === Number(id)) ?? null;
}

export function deleteMockTaxonomyItem(type, id) {
  mockTaxonomyData = {
    ...mockTaxonomyData,
    [type]: (mockTaxonomyData[type] ?? []).filter((item) => item.id !== Number(id)),
  };
}
