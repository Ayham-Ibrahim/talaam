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

function mapRescheduleRequest(request) {
  const attendees = request.session?.attendees ?? [];
  const attendeeCount = attendees.length;
  const firstAttendeeName = attendees[0]?.student?.user?.name ?? null;
  const teacherName =
    request.teacherName ??
    request.teacher_name ??
    request.session?.teacher?.user?.name ??
    (request.requester_role === 'teacher' ? request.requester?.name : null) ??
    '';

  const studentName =
    request.studentName ??
    request.student_name ??
    (request.requester_role === 'student'
      ? request.requester?.name ?? request.booking?.student?.user?.name ?? firstAttendeeName
      : request.booking?.student?.user?.name ?? (attendeeCount > 1 ? `مجموعة (${attendeeCount} طلاب)` : firstAttendeeName)) ??
    '';

  return {
    ...request,
    teacherName,
    studentName,
    originalScheduledAt:
      request.originalScheduledAt ?? request.original_scheduled_at ?? request.currentScheduledAt ?? request.current_scheduled_at ?? null,
    proposedScheduledAt: request.proposedScheduledAt ?? request.proposed_scheduled_at ?? null,
    alternativeScheduledAt:
      request.alternativeScheduledAt ?? request.alternative_scheduled_at ?? request.adminAlternativeAt ?? request.admin_alternative_at ?? null,
    // الوقت هنا يعني جدول الطالب هو تحديداً (بصرف النظر عمّن أرسل الطلب فعلياً) —
    // يُستخدَم لعرض كل تواريخ هذا الطلب بتوقيت الطالب لا بتوقيت متصفح من يشاهد
    // الجدول (كان هذا الخطأ سابقاً: يظهر بتوقيت الأدمن المحلي).
    studentTimezone: request.studentTimezone ?? request.student_timezone ?? null,
    withinFreeWindow: request.withinFreeWindow ?? request.within_free_window ?? false,
    createdAt: request.createdAt ?? request.created_at ?? null,
    rejectionReason: request.rejectionReason ?? request.rejection_reason ?? null,
    reviewedAt: request.reviewedAt ?? request.reviewed_at ?? null,
    slaDueAt: request.slaDueAt ?? request.sla_due_at ?? null,
  };
}

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
    return { data: data.data, total: data.meta?.total ?? data.data.length };
  },

  async getComplaintDetail(id) {
    if (config.useMocks) {
      await mockDelay(250);
      return findMockComplaint(id);
    }
    const { data } = await client.get(endpoints.admin.complaintDetail(id));
    return data.data;
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
    return data.data;
  },

  async escalateComplaint(id, note) {
    if (config.useMocks) {
      await mockDelay(300);
      return updateMockComplaint(id, { status: 'escalated', resolutionNote: note });
    }
    const { data } = await client.post(endpoints.admin.escalateComplaint(id), { note });
    return data.data;
  },

  async getRescheduleRequests(filters = {}) {
    if (config.useMocks) {
      await mockDelay(300);
      const data = filterMockRescheduleRequests(filters).map(mapRescheduleRequest);
      return { data, total: data.length };
    }
    const { data } = await client.get(endpoints.admin.rescheduleRequests, { params: filters });
    return { data: data.data.map(mapRescheduleRequest), total: data.meta?.total ?? data.data.length };
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
    return data.data;
  },

  async rejectReschedule(id, reason) {
    if (config.useMocks) {
      await mockDelay(400);
      return updateMockRescheduleRequest(id, { status: 'rejected', rejectionReason: reason });
    }
    const { data } = await client.post(endpoints.admin.rejectReschedule(id), { reason });
    return data.data;
  },
};
