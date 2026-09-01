import { config } from '@/config/env';
import { client, mockDelay } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { calculateStudentPrice } from '@/lib/pricing';
import { filterMockListings, findMockListing, updateMockListing } from '@/mocks/adminListings.mock';

/**
 * Packages and courses are two separate backend resources with their own
 * routes/policies (see أ-3/ب-3) — there is no unified "listings" endpoint.
 * This service composes both into the single review-queue shape the admin UI
 * expects, tagging each item with `kind` so later actions (approve/reject/
 * disable/detail) know which resource to call. `kind` must be threaded
 * through explicitly by the caller — it can't be re-derived from an id alone
 * since package ids and course ids are independent sequences.
 */
function mapListing(raw, kind) {
  return {
    id: raw.id,
    kind,
    title: raw.title,
    description: raw.description,
    status: raw.status,
    providerName: raw.teacher?.name ?? null,
    providerType: raw.teacher?.teacher_type ?? null,
    subjectName: kind === 'course' ? (raw.course_field ?? null) : (raw.subject ?? null),
    sessionsCount: kind === 'course' ? raw.total_sessions : raw.sessions_count,
    sessionFormat: raw.session_format ?? null,
    // فردية فقط تحتاجها فعلياً — لتغذية اختيار مواعيد الحجز اليدوي (ManualBookingModal/AdminSlotPicker)
    schedules: kind === 'course' ? [] : (raw.schedules ?? []),
    capacity: kind === 'course' ? raw.max_seats : raw.capacity,
    submittedAt: raw.submitted_at,
    teacherPrice: kind === 'course' ? raw.provider_price : raw.teacher_price,
    marginPercent: raw.platform_margin_percent,
    studentPrice: raw.student_price,
    rejectionReason: raw.rejection_reason,
    // No disabled_reason column exists on packages/courses — left null rather than fabricated.
    disabledReason: null,
  };
}

function applySearch(items, q) {
  if (!q) return items;
  const needle = q.trim().toLowerCase();
  if (!needle) return items;
  return items.filter((item) =>
    [item.title, item.providerName, item.subjectName].some((v) => v?.toLowerCase().includes(needle))
  );
}

export const adminListingsService = {
  async getListings(filters = {}) {
    if (config.useMocks) {
      await mockDelay(300);
      const data = filterMockListings(filters);
      return { data, total: data.length };
    }

    const params = { status: filters.status || undefined, per_page: 50 };

    if (filters.kind === 'package' || filters.kind === 'course') {
      const endpoint = filters.kind === 'course' ? endpoints.admin.courses : endpoints.admin.packages;
      const { data } = await client.get(endpoint, { params });
      const items = applySearch(data.data.map((raw) => mapListing(raw, filters.kind)), filters.q);
      return { data: items, total: data.meta?.total ?? items.length };
    }

    const [packagesRes, coursesRes] = await Promise.all([
      client.get(endpoints.admin.packages, { params }),
      client.get(endpoints.admin.courses, { params }),
    ]);
    const items = applySearch(
      [
        ...packagesRes.data.data.map((raw) => mapListing(raw, 'package')),
        ...coursesRes.data.data.map((raw) => mapListing(raw, 'course')),
      ],
      filters.q
    );
    return { data: items, total: items.length };
  },

  async getListingDetail(id, kind) {
    if (config.useMocks) {
      await mockDelay(300);
      return findMockListing(id);
    }
    const url = kind === 'course' ? endpoints.admin.courseDetail(id) : endpoints.admin.packageDetail(id);
    const { data } = await client.get(url);
    return mapListing(data.data, kind);
  },

  async approveListing(id, marginPercent, kind) {
    if (config.useMocks) {
      await mockDelay(400);
      const listing = findMockListing(id);
      const { studentPrice, platformRevenue } = calculateStudentPrice(listing.teacherPrice, marginPercent);
      return updateMockListing(id, {
        status: 'active',
        marginPercent,
        studentPrice,
        platformRevenue,
        rejectionReason: null,
        disabledReason: null,
      });
    }
    const url = kind === 'course' ? endpoints.admin.approveCourse(id) : endpoints.admin.approvePackage(id);
    const { data } = await client.post(url, { platform_margin_percent: marginPercent });
    return mapListing(data.data, kind);
  },

  async rejectListing(id, reason, kind) {
    if (config.useMocks) {
      await mockDelay(400);
      return updateMockListing(id, { status: 'rejected', rejectionReason: reason });
    }
    const url = kind === 'course' ? endpoints.admin.rejectCourse(id) : endpoints.admin.rejectPackage(id);
    const { data } = await client.post(url, { reason });
    return mapListing(data.data, kind);
  },

  async disableListing(id, reason, kind) {
    if (config.useMocks) {
      await mockDelay(400);
      return updateMockListing(id, { status: 'disabled', disabledReason: reason });
    }
    const url = kind === 'course' ? endpoints.admin.disableCourse(id) : endpoints.admin.disablePackage(id);
    const { data } = await client.post(url, { reason });
    return mapListing(data.data, kind);
  },
};
