/**
 * Client-side CSV template generators for bulk import (students, teachers).
 * Columns mirror the respective backend *ImportService::validateRow() exactly —
 * keep these in sync if the backend's expected columns ever change.
 */
const STUDENT_HEADERS = [
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

const STUDENT_EXAMPLE_ROW = [
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

/** يوازي TeacherImportService::validateRow() — teacher_type: school | university | training_center */
const TEACHER_HEADERS = ['name', 'email', 'phone', 'teacher_type'];

const TEACHER_EXAMPLE_ROW = ['أحمد المعلم', 'ahmad.teacher@example.com', '0500000001', 'school'];

function downloadCsv(headers, exampleRow, filename) {
  const csv = [headers.join(','), exampleRow.join(',')].join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadStudentImportTemplate() {
  downloadCsv(STUDENT_HEADERS, STUDENT_EXAMPLE_ROW, 'student_import_template.csv');
}

export function downloadTeacherImportTemplate() {
  downloadCsv(TEACHER_HEADERS, TEACHER_EXAMPLE_ROW, 'teacher_import_template.csv');
}
