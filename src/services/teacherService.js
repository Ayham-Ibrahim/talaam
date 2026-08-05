import { config } from '@/config/env';
import { client, mockDelay } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { mockTeachers, filterMockTeachers } from '@/mocks/teachers.mock';

export const TEACHER_TYPE_LABELS = {
  school: 'مدرسي',
  university: 'مدرس جامعي',
  training_center: 'مدرب',
};

export const EXPERIENCE_LABELS = {
  under_1: 'أقل من سنة خبرة',
  '1_3': '1 - 3 سنوات خبرة',
  '3_5': '3 - 5 سنوات خبرة',
  over_5: 'أكثر من 5 سنوات خبرة',
};

export const QUALIFICATION_LABELS = {
  bachelor: 'بكالوريوس',
  master: 'ماجستير',
  phd: 'دكتوراه',
  professional_cert: 'شهادة مهنية',
  diploma: 'دبلوم',
};

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** GET /teachers/search row → mirrors TeacherSearchController's slim, safe field set */
function mapSearchResult(raw) {
  return {
    id: raw.id,
    name: raw.user?.name,
    avatar: raw.user?.avatar_path,
    isVerified: true, // endpoint only ever returns status=verified
    type: raw.teacher_type,
    typeLabel: TEACHER_TYPE_LABELS[raw.teacher_type] ?? raw.teacher_type,
    city: raw.city,
    rating: Number(raw.rating_avg ?? 0),
    reviewsCount: raw.reviews_count ?? 0,
  };
}

/** GET /teachers/{id} public branch → mirrors PublicTeacherResource */
function mapPublicProfile(raw) {
  return {
    id: raw.id,
    name: raw.user?.name,
    avatar: raw.user?.avatar_path,
    isVerified: raw.status === 'verified',
    type: raw.teacher_type,
    typeLabel: TEACHER_TYPE_LABELS[raw.teacher_type] ?? raw.teacher_type,
    bio: raw.bio,
    city: raw.city,
    qualifications: raw.qualification ? [QUALIFICATION_LABELS[raw.qualification] ?? raw.qualification] : [],
    experienceLabel: raw.experience_years ? (EXPERIENCE_LABELS[raw.experience_years] ?? raw.experience_years) : null,
    subjects: (raw.subjects ?? []).map((s) => s.name_ar),
    curricula: (raw.curricula ?? []).map((c) => c.name_ar),
    languages: (raw.languages ?? []).map((l) => ({ code: l.code, label: l.name_ar })),
    teachingMethods: raw.teaching_methods ?? [],
    rating: Number(raw.stats?.rating_avg ?? 0),
    reviewsCount: raw.stats?.reviews_count ?? 0,
    studentsCount: raw.stats?.total_students ?? null,
    introVideoUrl: raw.intro_video_path,
    introVideoDuration: raw.intro_video_seconds ? formatDuration(raw.intro_video_seconds) : null,
  };
}

/**
 * Teacher service — the ONLY module that knows how teacher data is fetched.
 * Real branch hits the public GET /teachers/search + GET /teachers/{id}
 * (the latter now returns a role-branched resource — public/safe fields for
 * non-managers). No `/teachers/featured` or `/teachers` list route exists —
 * "featured" reuses search with a small page size.
 */
export const teacherService = {
  async getTeachers(filters = {}) {
    if (config.useMocks) {
      await mockDelay();
      const data = filterMockTeachers(mockTeachers, filters);
      return { data, total: data.length };
    }
    const params = {
      teacher_type: filters.type === 'training' ? 'training_center' : (filters.type || undefined),
      q: filters.q || undefined,
      min_rating: filters.minRating ?? undefined,
    };
    const { data } = await client.get(endpoints.teachers.search, { params });
    return { data: data.data.map(mapSearchResult), total: data.meta?.total ?? data.data.length };
  },

  async getFeatured() {
    if (config.useMocks) {
      await mockDelay();
      return mockTeachers.slice(0, 5);
    }
    const { data } = await client.get(endpoints.teachers.search, { params: { per_page: 5 } });
    return data.data.map(mapSearchResult);
  },

  async getTeacherById(id) {
    if (config.useMocks) {
      await mockDelay(300);
      return mockTeachers.find((t) => t.id === Number(id)) ?? null;
    }
    const { data } = await client.get(endpoints.teachers.detail(id));
    return mapPublicProfile(data.data);
  },
};
