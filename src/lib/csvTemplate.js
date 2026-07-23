/**
 * Client-side CSV template generator for bulk student import.
 * Columns mirror StudentImportService::validateRow() on the backend exactly —
 * keep this in sync if the backend's expected columns ever change.
 */
const HEADERS = [
  'name',
  'email',
  'phone',
  'education_type',
  'curriculum_code',
  'stage_code',
  'grade',
  'university_name',
  'major_name',
  'academic_level',
  'course_field_code',
  'level',
  'birth_date',
  'guardian_name',
  'guardian_phone',
];

const EXAMPLE_ROW = [
  'أحمد علي',
  'ahmad.ali@example.com',
  '0500000001',
  'school',
  'national',
  'primary',
  '5',
  '',
  '',
  '',
  '',
  '',
  '2015-03-10',
  'علي محمد',
  '0500000002',
];

export function downloadStudentImportTemplate() {
  const csv = [HEADERS.join(','), EXAMPLE_ROW.join(',')].join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'student_import_template.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
