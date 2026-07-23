import { config } from '@/config/env';
import { client, mockDelay } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { calculateStudentPrice } from '@/lib/pricing';
import {
  mockAdminListings,
  filterMockListings,
  findMockListing,
  updateMockListing,
} from '@/mocks/adminListings.mock';

/**
 * Admin listings service — packages and courses share one review workflow.
 * The real branch routes to /packages/{id} or /courses/{id} based on `kind`,
 * since the backend models them as two separate resources.
 */
export const adminListingsService = {
  async getListings(filters = {}) {
    if (config.useMocks) {
      await mockDelay(300);
      const data = filterMockListings(filters);
      return { data, total: data.length };
    }
    const { data } = await client.get(
      filters.kind === 'course' ? endpoints.admin.courses : endpoints.admin.packages,
      { params: filters }
    );
    return data;
  },

  async getListingDetail(id) {
    if (config.useMocks) {
      await mockDelay(300);
      return findMockListing(id);
    }
    const listing = findMockListing(id);
    const url = listing?.kind === 'course' ? endpoints.admin.courseDetail(id) : endpoints.admin.packageDetail(id);
    const { data } = await client.get(url);
    return data;
  },

  async approveListing(id, marginPercent) {
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
    const listing = mockAdminListings.find((l) => l.id === Number(id));
    const url = listing?.kind === 'course' ? endpoints.admin.approveCourse(id) : endpoints.admin.approvePackage(id);
    const { data } = await client.post(url, { platform_margin_percent: marginPercent });
    return data;
  },

  async rejectListing(id, reason) {
    if (config.useMocks) {
      await mockDelay(400);
      return updateMockListing(id, { status: 'rejected', rejectionReason: reason });
    }
    const listing = mockAdminListings.find((l) => l.id === Number(id));
    const url = listing?.kind === 'course' ? endpoints.admin.rejectCourse(id) : endpoints.admin.rejectPackage(id);
    const { data } = await client.post(url, { reason });
    return data;
  },

  async disableListing(id, reason) {
    if (config.useMocks) {
      await mockDelay(400);
      return updateMockListing(id, { status: 'disabled', disabledReason: reason });
    }
    const listing = mockAdminListings.find((l) => l.id === Number(id));
    const url = listing?.kind === 'course' ? endpoints.admin.disableCourse(id) : endpoints.admin.disablePackage(id);
    const { data } = await client.post(url, { reason });
    return data;
  },
};
