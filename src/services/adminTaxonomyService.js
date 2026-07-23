import { config } from '@/config/env';
import { client, mockDelay } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import {
  getMockTaxonomyItems,
  createMockTaxonomyItem,
  updateMockTaxonomyItem,
  deleteMockTaxonomyItem,
} from '@/mocks/adminTaxonomy.mock';

/** One generic service for all 7 taxonomy types, mirroring the backend's single TaxonomyController */
export const adminTaxonomyService = {
  async getItems(type) {
    if (config.useMocks) {
      await mockDelay(250);
      return getMockTaxonomyItems(type);
    }
    const { data } = await client.get(endpoints.admin.taxonomy(type));
    return data;
  },

  async createItem(type, payload) {
    if (config.useMocks) {
      await mockDelay(350);
      return createMockTaxonomyItem(type, payload);
    }
    const { data } = await client.post(endpoints.admin.taxonomy(type), payload);
    return data;
  },

  async updateItem(type, id, payload) {
    if (config.useMocks) {
      await mockDelay(350);
      return updateMockTaxonomyItem(type, id, payload);
    }
    const { data } = await client.put(endpoints.admin.taxonomyItem(type, id), payload);
    return data;
  },

  async deleteItem(type, id) {
    if (config.useMocks) {
      await mockDelay(300);
      deleteMockTaxonomyItem(type, id);
      return true;
    }
    const { data } = await client.delete(endpoints.admin.taxonomyItem(type, id));
    return data;
  },
};
