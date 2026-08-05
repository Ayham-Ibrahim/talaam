import { config } from '@/config/env';
import { client, mockDelay } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { getMockTaxonomyItems } from '@/mocks/adminTaxonomy.mock';

/**
 * Read-only taxonomy lookup — mirrors the backend's public GET /taxonomy/{type}
 * (no auth required). Used by any picker that needs subjects/curricula/course
 * fields/etc. Admin CRUD (create/update/delete) stays in adminTaxonomyService —
 * those routes are auth-gated on the backend and conceptually a different concern.
 */
export const taxonomyService = {
  async getItems(type) {
    if (config.useMocks) {
      await mockDelay(200);
      return getMockTaxonomyItems(type);
    }
    const { data } = await client.get(endpoints.taxonomy(type));
    return data.data;
  },
};
