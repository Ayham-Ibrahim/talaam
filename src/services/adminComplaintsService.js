import { config } from '@/config/env';
import { client, mockDelay } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import {
  filterMockComplaints,
  findMockComplaint,
  updateMockComplaint,
  filterMockRescheduleRequests,
  findMockRescheduleRequest,
  updateMockRescheduleRequest,
} from '@/mocks/adminComplaints.mock';

/**
 * Admin service for the two SLA/decision queues: complaints (24h SLA,
 * resolution has no refund options per platform policy) and reschedule
 * requests (always require admin approval, never automatic).
 */
export const adminComplaintsService = {
  async getComplaints(filters = {}) {
    if (config.useMocks) {
      await mockDelay(300);
      const data = filterMockComplaints(filters);
      return { data, total: data.length };
    }
    const { data } = await client.get(endpoints.admin.complaints, { params: filters });
    return data;
  },

  async getComplaintDetail(id) {
    if (config.useMocks) {
      await mockDelay(250);
      return findMockComplaint(id);
    }
    const { data } = await client.get(endpoints.admin.complaintDetail(id));
    return data;
  },

  async resolveComplaint(id, resolutionType, note) {
    if (config.useMocks) {
      await mockDelay(400);
      return updateMockComplaint(id, { status: 'resolved', resolutionType, resolutionNote: note });
    }
    const { data } = await client.post(endpoints.admin.resolveComplaint(id), {
      resolution_type: resolutionType,
      note,
    });
    return data;
  },

  async escalateComplaint(id, note) {
    if (config.useMocks) {
      await mockDelay(300);
      return updateMockComplaint(id, { status: 'escalated', resolutionNote: note });
    }
    const { data } = await client.post(endpoints.admin.escalateComplaint(id), { note });
    return data;
  },

  async getRescheduleRequests(filters = {}) {
    if (config.useMocks) {
      await mockDelay(300);
      const data = filterMockRescheduleRequests(filters);
      return { data, total: data.length };
    }
    const { data } = await client.get(endpoints.admin.rescheduleRequests, { params: filters });
    return data;
  },

  async approveReschedule(id, alternativeScheduledAt) {
    if (config.useMocks) {
      await mockDelay(400);
      return updateMockRescheduleRequest(id, {
        status: alternativeScheduledAt ? 'approved_with_alternative' : 'approved',
        alternativeScheduledAt: alternativeScheduledAt ?? null,
      });
    }
    const { data } = await client.post(endpoints.admin.approveReschedule(id), {
      alternative_scheduled_at: alternativeScheduledAt ?? undefined,
    });
    return data;
  },

  async rejectReschedule(id, reason) {
    if (config.useMocks) {
      await mockDelay(400);
      return updateMockRescheduleRequest(id, { status: 'rejected', rejectionReason: reason });
    }
    const { data } = await client.post(endpoints.admin.rejectReschedule(id), { reason });
    return data;
  },
};
