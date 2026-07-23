import { config } from '@/config/env';
import { client, mockDelay } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { getMockSettings, updateMockSetting } from '@/mocks/adminSettings.mock';

export const adminSettingsService = {
  async getSettings() {
    if (config.useMocks) {
      await mockDelay(300);
      return getMockSettings();
    }
    const { data } = await client.get(endpoints.admin.settings);
    return data;
  },

  async updateSetting(key, value) {
    if (config.useMocks) {
      await mockDelay(350);
      return updateMockSetting(key, value);
    }
    const { data } = await client.put(endpoints.admin.updateSetting(key), { value });
    return data;
  },
};
