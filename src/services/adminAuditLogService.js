import { config } from '@/config/env';
import { client, mockDelay } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { filterMockAuditLog } from '@/mocks/adminAuditLog.mock';

export const adminAuditLogService = {
  async getAuditLog(filters = {}) {
    if (config.useMocks) {
      await mockDelay(300);
      const data = filterMockAuditLog(filters);
      return { data, total: data.length };
    }
    const { data } = await client.get(endpoints.admin.auditLog, { params: filters });
    return data;
  },
};
