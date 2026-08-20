import { config } from '@/config/env';
import { client, mockDelay } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { formatDate } from '@/lib/formatters';
import { useAuthStore } from '@/store';
import { TEACHER_TYPE_LABELS } from '@/services/teacherService';
import {
  mockPackages,
  mockReviews,
  mockRatingSummary,
  mockFilters,
  mockStats,
} from '@/mocks/data.mock';
import {
  mockDashboardStats,
  mockUpcomingSessions,
  mockCurrentPackage,
  mockActivities,
  mockCalendarSessions,
  mockAllSessions,
  mockPackagesList,
  mockPackageSessions,
  mockInvoices,
} from '@/mocks/dashboard.mock';
import {
  mockTeacherStats,
  mockTeacherUpcomingSessions,
  mockTeacherActivePackages,
  mockTeacherPackageStats,
  mockTeacherPackagesList,
  createMockTeacherPackage,
  updateMockTeacherPackage,
  submitMockTeacherPackage,
  mockTeacherSessions,
  mockTeacherStudentStats,
  mockTeacherStudents,
} from '@/mocks/teacherDashboard.mock';
import { mockTeacherCoursesList, createMockTeacherCourse, submitMockTeacherCourse } from '@/mocks/teacherCourses.mock';

/** "H:i" or "H:i:s" pair → whole minutes. No fixed duration field exists anymore — every package's session length is derived from its own schedule. */
function minutesBetween(startTime, endTime) {
  if (!startTime || !endTime) return null;
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

/** GET /teachers/{id}/packages row → mirrors StudentPackageResource */
function mapStudentPackage(raw) {
  const schedules = raw.schedules ?? [];
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    sessionFormat: raw.session_format,
    capacity: raw.capacity,
    enrolledCount: raw.enrolled_count,
    sessionsCount: raw.sessions_count,
    durationPerSession: minutesBetween(schedules[0]?.start_time, schedules[0]?.end_time),
    price: raw.student_price,
    currency: raw.currency,
    discountPercent: raw.discount_percent,
    subject: raw.subject,
    schedules,
  };
}

export const packageService = {
  async getByTeacher(teacherId) {
    if (config.useMocks) {
      await mockDelay();
      return mockPackages.filter((p) => p.teacherId === Number(teacherId));
    }
    const { data } = await client.get(endpoints.teachers.packages(teacherId));
    return data.data.map(mapStudentPackage);
  },
};

/** GET /teachers/{id}/courses row → mirrors StudentCourseResource */
function mapStudentCourse(raw) {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    level: raw.level,
    deliveryMode: raw.delivery_mode,
    location: raw.location,
    startDate: raw.start_date,
    endDate: raw.end_date,
    totalSessions: raw.total_sessions,
    sessionDurationMinutes: raw.session_duration_min,
    totalHours: raw.total_hours,
    maxSeats: raw.max_seats,
    enrolledCount: raw.enrolled_count,
    price: raw.student_price,
    currency: raw.currency,
    hasCertificate: raw.has_certificate,
    certificateType: raw.certificate_type,
    certificateIssuer: raw.certificate_issuer,
    certificateRequirements: raw.certificate_requirements,
    requiresLaptop: raw.requires_laptop,
    materialsIncluded: raw.materials_included,
    hasPracticalExercises: raw.has_practical_exercises,
    sessionsRecorded: raw.sessions_recorded,
    prerequisites: raw.prerequisites,
    cancellationPolicy: raw.cancellation_policy,
    schedules: raw.schedules ?? [],
  };
}

export const courseService = {
  async getByTeacher(teacherId) {
    if (config.useMocks) {
      await mockDelay();
      return [];
    }
    const { data } = await client.get(endpoints.teachers.courses(teacherId));
    return data.data.map(mapStudentCourse);
  },
};

/** Teacher's own weekly available days (no hours) — the pool an individual package's days are picked from */
export const availabilityService = {
  async getByTeacher(teacherId) {
    if (config.useMocks) {
      await mockDelay();
      return [];
    }
    const { data } = await client.get(endpoints.teachers.availabilitySlots(teacherId));
    return data.data.map((slot) => ({ id: slot.id, dayOfWeek: slot.day_of_week }));
  },

  async addDay(teacherId, dayOfWeek) {
    if (config.useMocks) {
      await mockDelay();
      return { id: Math.floor(Math.random() * 100000), dayOfWeek };
    }
    const { data } = await client.post(endpoints.teachers.availabilitySlots(teacherId), { day_of_week: dayOfWeek });
    return { id: data.data.id, dayOfWeek: data.data.day_of_week };
  },

  async removeDay(teacherId, slotId) {
    if (config.useMocks) {
      await mockDelay();
      return true;
    }
    await client.delete(endpoints.teachers.availabilitySlot(teacherId, slotId));
    return true;
  },
};

export const reviewService = {
  async getByTeacher(teacherId) {
    if (config.useMocks) {
      await mockDelay();
      return mockReviews.filter((r) => r.teacherId === Number(teacherId));
    }
    const { data } = await client.get(endpoints.teachers.reviews(teacherId));
    return data.data.map((review) => ({
      id: review.id,
      studentName: review.student?.user?.name,
      studentAvatar: review.student?.user?.avatar_path,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.created_at,
    }));
  },

  /**
   * No dedicated rating-summary endpoint exists — the distribution (%/star) isn't
   * derivable from teacher.stats alone, so it's computed here from the same
   * reviews-for-teacher page (capped at the latest 100). average/total prefer the
   * DB-exact teacher.stats values when the caller has them; this is a fallback.
   */
  async getRatingSummary(teacherId) {
    if (config.useMocks) {
      await mockDelay(250);
      return mockRatingSummary;
    }
    const { data } = await client.get(endpoints.teachers.reviews(teacherId), { params: { per_page: 100 } });
    const reviews = data.data;
    const total = reviews.length;
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => { counts[r.rating] = (counts[r.rating] ?? 0) + 1; });
    const distribution = {};
    [1, 2, 3, 4, 5].forEach((star) => { distribution[star] = total ? Math.round((counts[star] / total) * 100) : 0; });
    const average = total ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0;
    return { average: Math.round(average * 10) / 10, total, distribution };
  },

  /** تقييمات الطالب الحالي لنفسه — MyReviewResource (ReviewController::myReviews) */
  async getMine() {
    if (config.useMocks) {
      await mockDelay();
      return [];
    }
    const { data } = await client.get(endpoints.reviews.mine, { params: { per_page: 100 } });
    return data.data.map((review) => ({
      id: review.id,
      classSessionId: review.class_session_id,
      teacherId: review.teacher_id,
      teacherName: review.teacher_name,
      teacherAvatar: review.teacher_avatar,
      rating: review.rating,
      comment: review.comment,
      response: review.response,
      respondedAt: review.responded_at,
      canEdit: review.can_edit,
      createdAt: review.created_at,
    }));
  },

  async create(sessionId, { rating, comment }) {
    if (config.useMocks) {
      await mockDelay();
      return { id: Date.now(), rating, comment };
    }
    const { data } = await client.post(endpoints.reviews.create(sessionId), { rating, comment: comment || null });
    return data.data;
  },

  async update(reviewId, { rating, comment }) {
    if (config.useMocks) {
      await mockDelay();
      return { id: reviewId, rating, comment };
    }
    const { data } = await client.put(endpoints.reviews.update(reviewId), { rating, comment: comment || null });
    return data.data;
  },
};

export const bookingService = {
  /**
   * Individual package — student picks a date (must match one of the package's
   * available weekdays) + a free time and submits a REQUEST. No payment yet —
   * status comes back pending_teacher_confirmation; the teacher must approve
   * before checkout() can be called.
   */
  async requestIndividualBooking(packageId, { date, start_time }) {
    if (config.useMocks) {
      await mockDelay(500);
      return { id: Math.floor(Math.random() * 100000), status: 'pending_teacher_confirmation' };
    }
    const { data } = await client.post(endpoints.bookings.createIndividual(packageId), { date, start_time });
    return data.data;
  },

  /** Teacher approves a pending individual booking request — generates sessions + pending payment */
  async approveBookingRequest(bookingId) {
    if (config.useMocks) {
      await mockDelay(400);
      return { id: bookingId, status: 'pending_payment' };
    }
    const { data } = await client.post(endpoints.bookings.approve(bookingId));
    return data.data;
  },

  /** Teacher rejects a pending individual booking request — nothing to refund, nothing was charged */
  async rejectBookingRequest(bookingId, reason) {
    if (config.useMocks) {
      await mockDelay(400);
      return { id: bookingId, status: 'cancelled' };
    }
    const { data } = await client.post(endpoints.bookings.reject(bookingId), { reason });
    return data.data;
  },

  /** Student fetches the Stripe checkout link once the teacher has approved */
  async checkoutBooking(bookingId) {
    if (config.useMocks) {
      await mockDelay(500);
      return { checkout_url: null };
    }
    const { data } = await client.post(endpoints.bookings.checkout(bookingId));
    return data.data;
  },

  /** Teacher's own pending individual-booking requests awaiting approve/reject */
  async getPendingRequests() {
    if (config.useMocks) {
      await mockDelay(300);
      return [];
    }
    const { data } = await client.get(endpoints.bookings.list, { params: { status: 'pending_teacher_confirmation', per_page: 50 } });
    return data.data.map((booking) => ({
      id: booking.id,
      studentName: booking.student?.user?.name ?? null,
      studentAvatar: booking.student?.user?.avatar_path ?? null,
      packageTitle: booking.package?.title ?? null,
      requestedDate: booking.requested_date,
      requestedStartTime: booking.requested_start_time,
      createdAt: booking.created_at,
    }));
  },

  /** Group package — joins the package's existing fixed schedule, no body */
  async createGroupBooking(packageId) {
    if (config.useMocks) {
      await mockDelay(500);
      return { booking: { id: Math.floor(Math.random() * 100000), status: 'pending_payment' }, checkout_url: null };
    }
    const { data } = await client.post(endpoints.bookings.createGroup(packageId));
    return data.data;
  },

  /** Admin-only — mirrors CreateManualBookingRequest (student_id, reason required) */
  async createManualBooking(packageId, payload) {
    if (config.useMocks) {
      await mockDelay(500);
      return {
        id: Math.floor(Math.random() * 100000),
        status: 'confirmed',
        is_manual: true,
        ...payload,
      };
    }
    const { data } = await client.post(endpoints.bookings.createManual(packageId), payload);
    return data.data;
  },

  /** PDF invoice for a paid booking — backend rejects with 422 while pending_payment */
  async downloadInvoice(bookingId) {
    if (config.useMocks) {
      await mockDelay(400);
      return new Blob(['Demo mode — no real invoice available.'], { type: 'application/pdf' });
    }
    const { data } = await client.get(endpoints.bookings.invoice(bookingId), { responseType: 'blob' });
    return data;
  },
};

export const enrollmentService = {
  /** Student self-serve — joins the course's own fixed schedule, no body → { enrollment, checkout_url } */
  async createEnrollment(courseId) {
    if (config.useMocks) {
      await mockDelay(500);
      return { enrollment: { id: Math.floor(Math.random() * 100000), status: 'pending_payment' }, checkout_url: null };
    }
    const { data } = await client.post(endpoints.enrollments.create(courseId));
    return data.data;
  },

  /** Admin-only — mirrors CreateManualEnrollmentRequest (student_id, reason required) */
  async createManualEnrollment(courseId, payload) {
    if (config.useMocks) {
      await mockDelay(500);
      return {
        id: Math.floor(Math.random() * 100000),
        status: 'confirmed',
        is_manual: true,
        ...payload,
      };
    }
    const { data } = await client.post(endpoints.enrollments.createManual(courseId), payload);
    return data.data;
  },

  /** إعادة محاولة الدفع لتسجيل ما زال pending_payment (أغلق الطالب نافذة Stripe الأولى بلا إكمال الدفع) */
  async checkoutEnrollment(enrollmentId) {
    if (config.useMocks) {
      await mockDelay(500);
      return { checkout_url: null };
    }
    const { data } = await client.post(endpoints.enrollments.checkout(enrollmentId));
    return data.data;
  },

  /** PDF invoice for a paid enrollment — backend rejects with 422 while pending_payment */
  async downloadInvoice(enrollmentId) {
    if (config.useMocks) {
      await mockDelay(400);
      return new Blob(['Demo mode — no real invoice available.'], { type: 'application/pdf' });
    }
    const { data } = await client.get(endpoints.enrollments.invoice(enrollmentId), { responseType: 'blob' });
    return data;
  },
};

export const classSessionService = {
  /**
   * Was previously: open session.join_url_{teacher,student} directly via
   * window.open(). That URL is BigBlueButton's raw `join` API endpoint —
   * when the meeting isn't actually running there yet (not started, already
   * ended, or the room was never created), BBB responds with an unstyled
   * XML error body instead of redirecting, and since navigation already
   * happened, the app has no chance to catch or reformat it. This endpoint
   * checks first and returns either the real join URL or a clean message.
   */
  async join(sessionId) {
    if (config.useMocks) {
      await mockDelay(300);
      return { url: null };
    }
    const { data } = await client.get(endpoints.classSessions.join(sessionId));
    return data.data;
  },
};

export const rescheduleService = {
  /**
   * Student or teacher requests a new time for an existing session — never applied
   * automatically, an admin must approve/reject (see AdminComplaintsPage's reschedule tab).
   * `reason` is required by the backend only when the proposed change is less than
   * reschedule_free_window_hours before the session; sending it always is simplest.
   */
  async createRequest(sessionId, { proposedScheduledAt, reason }) {
    if (config.useMocks) {
      await mockDelay(400);
      return { id: Math.floor(Math.random() * 100000), status: 'pending' };
    }
    const { data } = await client.post(endpoints.classSessions.rescheduleRequests(sessionId), {
      proposed_scheduled_at: proposedScheduledAt,
      reason: reason || null,
    });
    return data.data;
  },
};

/**
 * GET /favorites row → mirrors FavoriteResource's unified {type, teacher|course} shape.
 * `kind` is the outer teacher-vs-course discriminator; for teacher rows, `type` is
 * deliberately the teacher's OWN type (school/university/training_center) so the
 * shape matches what FavoriteTeacherRow (built against the mock teacher shape) expects.
 */
function mapFavorite(raw) {
  if (raw.type === 'teacher' && raw.teacher) {
    return {
      favoriteId: raw.id,
      kind: 'teacher',
      id: raw.teacher.id,
      name: raw.teacher.name,
      avatar: raw.teacher.avatar,
      type: raw.teacher.teacherType,
      typeLabel: TEACHER_TYPE_LABELS[raw.teacher.teacherType] ?? raw.teacher.teacherType,
      city: raw.teacher.city,
      rating: Number(raw.teacher.rating ?? 0),
      reviewsCount: raw.teacher.reviewsCount ?? 0,
      studentsCount: raw.teacher.studentsCount ?? 0,
      subjects: raw.teacher.subjects ?? [],
    };
  }
  if (raw.type === 'course' && raw.course) {
    return {
      favoriteId: raw.id,
      kind: 'course',
      id: raw.course.id,
      // الدورة لا تملك صفحة تفصيل مستقلة — تُعرض ضمن ملف المركز، لذا نحتاج هذا للربط بـ /teacher/:teacherId
      teacherId: raw.course.teacherId,
      title: raw.course.title,
      providerName: raw.course.providerName,
      providerAvatar: raw.course.providerAvatar,
      subject: raw.course.subject,
      price: raw.course.price,
      currency: raw.course.currency,
    };
  }
  // العنصر المفضَّل حُذف من الباك — نُعيد صفاً فارغاً بدل تعطّل الصفحة، ويُستبعد عند العرض
  return { favoriteId: raw.id, kind: null };
}

export const favoriteService = {
  async getFavorites() {
    if (config.useMocks) {
      await mockDelay();
      return [];
    }
    const { data } = await client.get(endpoints.favorites.list, { params: { per_page: 100 } });
    return data.data.map(mapFavorite).filter((f) => f.kind !== null);
  },

  /** Toggles on/off — the backend only ever returns {favorited: bool}, so callers should refetch the list */
  async toggleTeacher(teacherId) {
    if (config.useMocks) {
      await mockDelay();
      return { favorited: true };
    }
    const { data } = await client.post(endpoints.favorites.toggleTeacher(teacherId));
    return data.data;
  },

  async toggleCourse(courseId) {
    if (config.useMocks) {
      await mockDelay();
      return { favorited: true };
    }
    const { data } = await client.post(endpoints.favorites.toggleCourse(courseId));
    return data.data;
  },
};

export const metaService = {
  async getFilters() {
    if (config.useMocks) {
      await mockDelay(200);
      return mockFilters;
    }
    const { data } = await client.get(endpoints.meta.filters);
    return data.data;
  },

  async getStats() {
    if (config.useMocks) {
      await mockDelay(200);
      return mockStats;
    }
    const { data } = await client.get(endpoints.meta.stats);
    return data.data;
  },
};

const SESSION_TYPE_LABELS = { individual: 'جلسة فردية', group: 'جلسة جماعية', training: 'دورة تدريبية' };

function getSessionTiming(scheduledAt, durationMinutes = 0) {
  if (!scheduledAt) return { startsAtMs: NaN, endsAtMs: NaN, nowMs: Date.now() };

  const startsAtMs = new Date(scheduledAt).getTime();
  const safeDurationMinutes = Number.isFinite(Number(durationMinutes)) ? Number(durationMinutes) : 0;
  const endsAtMs = startsAtMs + safeDurationMinutes * 60 * 1000;

  return { startsAtMs, endsAtMs, nowMs: Date.now() };
}

/** ClassSession.status → the 3-state vocabulary the student dashboard UI understands */
function mapSessionStatus(status, scheduledAt = null, durationMinutes = 0) {
  if (status === 'completed') return 'attended';
  if (['cancelled', 'no_show_student', 'no_show_teacher'].includes(status)) return 'cancelled';
  if (scheduledAt) {
    const { endsAtMs, nowMs } = getSessionTiming(scheduledAt, durationMinutes);
    if (Number.isFinite(endsAtMs) && nowMs > endsAtMs) {
      return 'attended';
    }
  }
  return 'upcoming'; // scheduled, reschedule_pending, rescheduled, active, suspended
}

function canJoinSession(session, joinUrl) {
  if (!joinUrl) return false;
  if (['completed', 'cancelled', 'no_show_student', 'no_show_teacher'].includes(session.status)) {
    return false;
  }

  const { startsAtMs, endsAtMs, nowMs } = getSessionTiming(session.scheduled_at, session.duration_min);
  if (!Number.isFinite(startsAtMs) || !Number.isFinite(endsAtMs)) return false;

  return nowMs >= startsAtMs && nowMs <= endsAtMs;
}

function hasPendingRescheduleRequest(session) {
  if (session.has_pending_reschedule_request != null) {
    return Boolean(session.has_pending_reschedule_request);
  }

  const requests = session.reschedule_requests ?? session.rescheduleRequests ?? [];
  return requests.some((request) => request.status === 'pending');
}

function pendingRescheduleRequestCreatedAt(session) {
  if (session.pending_reschedule_request_created_at) {
    return session.pending_reschedule_request_created_at;
  }

  const requests = session.reschedule_requests ?? session.rescheduleRequests ?? [];
  return requests.find((request) => request.status === 'pending')?.created_at ?? null;
}

/** Booking/Enrollment.status → the 3-state vocabulary the invoices UI understands */
function mapPaymentStatus(status) {
  if (['confirmed', 'in_progress', 'completed'].includes(status)) return 'paid';
  if (status === 'pending_payment') return 'pending';
  return 'cancelled'; // cancelled, withdrawn
}

/** course_id present → training course; otherwise the owning package's own format */
function sessionCategory(session) {
  if (session.course_id) return 'training';
  return session.booking?.package?.session_format ?? 'individual';
}

function sessionTeacherName(session) {
  return session.teacher?.user?.name ?? null;
}

function sessionTeacherAvatar(session) {
  return session.teacher?.user?.avatar_path ?? null;
}

function sessionSubject(session) {
  return session.booking?.package?.subject?.name_ar ?? session.course?.subject?.name_ar ?? null;
}

function sessionPackageTitle(session) {
  return session.booking?.package?.title ?? session.course?.title ?? null;
}

/** "H:MM"/"م" pair from an ISO datetime, matching the Arabic 12-hour display used across the dashboard */
function formatSessionTime(scheduledAt) {
  if (!scheduledAt) return { time: null, period: null };
  const d = new Date(scheduledAt);
  const hours24 = d.getHours();
  const period = hours24 < 12 ? 'ص' : 'م';
  const hours12 = ((hours24 + 11) % 12) + 1;
  const time = `${String(hours12).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return { time, period };
}

function formatSessionDay(scheduledAt) {
  if (!scheduledAt) return null;
  return new Intl.DateTimeFormat('ar', { weekday: 'long' }).format(new Date(scheduledAt));
}

function formatSessionDate(scheduledAt) {
  if (!scheduledAt) return null;
  return new Intl.DateTimeFormat('ar', { day: 'numeric', month: 'long' }).format(new Date(scheduledAt));
}

/** null once the moment has passed — countdown widgets only make sense for the future */
function computeCountdown(scheduledAt) {
  if (!scheduledAt) return null;
  const diffMs = new Date(scheduledAt) - new Date();
  if (diffMs <= 0) return null;
  const totalMinutes = Math.floor(diffMs / 60000);
  return {
    days: Math.floor(totalMinutes / (60 * 24)),
    hours: Math.floor((totalMinutes % (60 * 24)) / 60),
    minutes: totalMinutes % 60,
  };
}

/** GET /class-sessions row → "دورتي/جلساتي" list row (dashboard widget + PackageSessionsList) */
function mapSessionListRow(session) {
  const category = sessionCategory(session);
  const { time, period } = formatSessionTime(session.scheduled_at);
  const hasPendingReschedule = hasPendingRescheduleRequest(session);
  const status = hasPendingReschedule ? 'reschedule_pending' : mapSessionStatus(session.status, session.scheduled_at, session.duration_min);
  const isUpcoming = status === 'upcoming';
  const canJoin = canJoinSession(session, session.join_url_student ?? null);
  return {
    id: session.id,
    scheduledAt: session.scheduled_at,
    category,
    status,
    sessionType: SESSION_TYPE_LABELS[category],
    teacherName: sessionTeacherName(session),
    teacherAvatar: sessionTeacherAvatar(session),
    subject: sessionSubject(session),
    day: formatSessionDay(session.scheduled_at),
    date: formatSessionDate(session.scheduled_at),
    time,
    period,
    durationMinutes: session.duration_min,
    countdown: isUpcoming ? computeCountdown(session.scheduled_at) : null,
    joinUrl: session.join_url_student ?? null,
    canJoin,
    canReschedule: isUpcoming && !hasPendingReschedule,
    canCancel: isUpcoming,
    hasPendingRescheduleRequest: hasPendingReschedule,
    pendingRescheduleRequestCreatedAt: pendingRescheduleRequestCreatedAt(session),
  };
}

/** GET /class-sessions row → dashboard "upcoming sessions" widget row */
function mapUpcomingSessionRow(session) {
  const { time, period } = formatSessionTime(session.scheduled_at);
  return {
    id: session.id,
    teacherName: sessionTeacherName(session),
    teacherAvatar: sessionTeacherAvatar(session),
    subject: sessionSubject(session),
    sessionType: SESSION_TYPE_LABELS[sessionCategory(session)],
    date: formatSessionDate(session.scheduled_at),
    day: formatSessionDay(session.scheduled_at),
    time,
    period,
    durationMinutes: session.duration_min,
    countdown: computeCountdown(session.scheduled_at),
    joinUrl: canJoinSession(session, session.join_url_student ?? null) ? session.join_url_student : null,
  };
}

/** GET /class-sessions row → calendar day-cell row */
function mapCalendarSessionRow(session) {
  const hasPendingReschedule = hasPendingRescheduleRequest(session);
  const status = hasPendingReschedule ? 'reschedule_pending' : mapSessionStatus(session.status, session.scheduled_at, session.duration_min);
  const { time, period } = formatSessionTime(session.scheduled_at);
  return {
    id: session.id,
    date: session.scheduled_at ? session.scheduled_at.slice(0, 10) : null,
    type: sessionCategory(session),
    packageTitle: sessionPackageTitle(session),
    status,
    teacherName: sessionTeacherName(session),
    teacherAvatar: sessionTeacherAvatar(session),
    subject: sessionSubject(session),
    time,
    period,
    durationMinutes: session.duration_min,
    countdown: status === 'upcoming' ? computeCountdown(session.scheduled_at) : null,
    canReschedule: status === 'upcoming' && !hasPendingReschedule,
    joinUrl: canJoinSession(session, session.join_url_student ?? null) ? session.join_url_student : null,
    hasPendingRescheduleRequest: hasPendingReschedule,
    pendingRescheduleRequestCreatedAt: pendingRescheduleRequestCreatedAt(session),
  };
}

/** Same as mapCalendarSessionRow but for the teacher's own calendar (join_url_teacher, no teacherName/Avatar — it's their own session) */
function mapTeacherCalendarSessionRow(session) {
  const hasPendingReschedule = hasPendingRescheduleRequest(session);
  const status = hasPendingReschedule ? 'reschedule_pending' : mapSessionStatus(session.status, session.scheduled_at, session.duration_min);
  const { time, period } = formatSessionTime(session.scheduled_at);
  return {
    id: session.id,
    date: session.scheduled_at ? session.scheduled_at.slice(0, 10) : null,
    type: sessionCategory(session),
    packageTitle: sessionPackageTitle(session),
    status,
    subject: sessionSubject(session),
    time,
    period,
    durationMinutes: session.duration_min,
    countdown: status === 'upcoming' ? computeCountdown(session.scheduled_at) : null,
    canReschedule: status === 'upcoming' && !hasPendingReschedule,
    joinUrl: canJoinSession(session, session.join_url_teacher ?? null) ? session.join_url_teacher : null,
    hasPendingRescheduleRequest: hasPendingReschedule,
    pendingRescheduleRequestCreatedAt: pendingRescheduleRequestCreatedAt(session),
  };
}

function joinCurricula(curricula) {
  const names = (curricula ?? []).map((c) => c.name_ar).filter(Boolean);
  return names.length ? names.join('-') : null;
}

/** GET /bookings row → "باقاتي" card/details shape (individual/group packages) */
function mapBookingToPackageCard(booking) {
  const pkg = booking.package;
  const schedules = pkg?.schedules ?? [];
  const total = booking.sessions_total ?? 0;
  const used = booking.sessions_used ?? 0;
  return {
    id: `booking-${booking.id}`,
    status: booking.status,
    type: pkg?.session_format ?? 'individual',
    teacherName: booking.teacher?.user?.name ?? null,
    teacherAvatar: booking.teacher?.user?.avatar_path ?? null,
    subject: pkg?.subject?.name_ar ?? null,
    packageTitle: pkg?.title ?? null,
    description: pkg?.description ?? null,
    curriculum: joinCurricula(pkg?.curricula),
    durationMinutes: minutesBetween(schedules[0]?.start_time, schedules[0]?.end_time),
    totalSessions: total,
    usedSessions: used,
    remainingSessions: booking.sessions_remaining ?? Math.max(total - used, 0),
    usagePercent: total > 0 ? Math.round((used / total) * 100) : 0,
    purchaseDate: formatDate(booking.created_at),
    expiryDate: booking.expires_at ? formatDate(booking.expires_at) : null,
    price: Number(booking.amount_paid ?? 0),
    cancellationReason: booking.cancellation_reason ?? null,
  };
}

/**
 * GET /enrollments row → "باقاتي" card/details shape (training courses). Unlike
 * bookings, enrollments carry no sessions_used counter of their own — usage is
 * derived from the caller-supplied list of this course's own class sessions.
 */
function mapEnrollmentToPackageCard(enrollment, courseSessions = []) {
  const course = enrollment.course;
  const total = course?.total_sessions ?? 0;
  const used = courseSessions.filter((s) => s.status === 'completed').length;
  return {
    id: `enrollment-${enrollment.id}`,
    status: enrollment.status,
    type: 'course',
    teacherName: enrollment.teacher?.user?.name ?? null,
    teacherAvatar: enrollment.teacher?.user?.avatar_path ?? null,
    subject: course?.subject?.name_ar ?? null,
    packageTitle: course?.title ?? null,
    description: course?.description ?? null,
    curriculum: joinCurricula(course?.curricula),
    durationMinutes: course?.session_duration_min ?? null,
    totalSessions: total,
    usedSessions: used,
    remainingSessions: Math.max(total - used, 0),
    usagePercent: total > 0 ? Math.round((used / total) * 100) : 0,
    purchaseDate: formatDate(enrollment.created_at),
    expiryDate: null,
    price: Number(enrollment.amount_paid ?? 0),
  };
}

function mapBookingToInvoice(booking) {
  const pkg = booking.package;
  return {
    id: booking.reference ?? booking.id,
    recordId: booking.id,
    kind: 'booking',
    issueDate: formatDate(booking.created_at),
    teacherName: booking.teacher?.user?.name ?? null,
    teacherAvatar: booking.teacher?.user?.avatar_path ?? null,
    subject: pkg?.subject?.name_ar ?? null,
    paymentMethod: booking.is_manual ? 'يدوي' : 'Stripe',
    amount: Number(booking.amount_paid ?? 0),
    price: Number(booking.amount_paid ?? 0),
    packageTitle: pkg?.title ?? null,
    packageType: pkg?.session_format ?? 'individual',
    sessionsCount: booking.sessions_total ?? null,
    paymentStatus: mapPaymentStatus(booking.status),
  };
}

function mapEnrollmentToInvoice(enrollment) {
  const course = enrollment.course;
  return {
    id: enrollment.reference ?? enrollment.id,
    recordId: enrollment.id,
    kind: 'enrollment',
    issueDate: formatDate(enrollment.created_at),
    teacherName: enrollment.teacher?.user?.name ?? null,
    teacherAvatar: enrollment.teacher?.user?.avatar_path ?? null,
    subject: course?.subject?.name_ar ?? null,
    paymentMethod: enrollment.is_manual ? 'يدوي' : 'Stripe',
    amount: Number(enrollment.amount_paid ?? 0),
    price: Number(enrollment.amount_paid ?? 0),
    packageTitle: course?.title ?? null,
    packageType: 'course',
    sessionsCount: course?.total_sessions ?? null,
    paymentStatus: mapPaymentStatus(enrollment.status),
  };
}

/** Dashboard "current package" widget row — record is a raw booking or enrollment */
function mapCurrentPackage(record, sessions) {
  const isCourse = 'course_id' in record;
  if (isCourse) {
    const course = record.course;
    const total = course?.total_sessions ?? 0;
    const used = sessions.filter((s) => s.course_id === record.course_id && s.status === 'completed').length;
    return {
      teacherName: record.teacher?.user?.name ?? null,
      teacherAvatar: record.teacher?.user?.avatar_path ?? null,
      subject: course?.subject?.name_ar ?? null,
      packageTitle: course?.title ?? null,
      durationMinutes: course?.session_duration_min ?? null,
      usagePercent: total > 0 ? Math.round((used / total) * 100) : 0,
    };
  }
  const pkg = record.package;
  const total = record.sessions_total ?? 0;
  const used = record.sessions_used ?? 0;
  const ownSession = sessions.find((s) => s.booking_id === record.id);
  return {
    teacherName: record.teacher?.user?.name ?? null,
    teacherAvatar: record.teacher?.user?.avatar_path ?? null,
    subject: pkg?.subject?.name_ar ?? null,
    packageTitle: pkg?.title ?? null,
    durationMinutes: ownSession?.duration_min ?? null,
    usagePercent: total > 0 ? Math.round((used / total) * 100) : 0,
  };
}

export const dashboardService = {
  /**
   * No dedicated "student dashboard" endpoint exists on the backend (by design —
   * أ-3: no invented /dashboard/* aggregate routes) — composed client-side from
   * the student's own bookings/enrollments/class-sessions, mirroring the same
   * treatment already done for the teacher dashboard. No student-visible
   * activity-log endpoint exists, so `activities` is left empty rather than faked.
   */
  async getStudentDashboard() {
    if (config.useMocks) {
      await mockDelay(300);
      return {
        stats: mockDashboardStats,
        upcomingSessions: mockUpcomingSessions,
        currentPackage: mockCurrentPackage,
        activities: mockActivities,
      };
    }
    const [sessionsRes, bookingsRes, enrollmentsRes] = await Promise.all([
      client.get(endpoints.classSessions.list, { params: { per_page: 200 } }),
      client.get(endpoints.bookings.list, { params: { per_page: 100 } }),
      client.get(endpoints.enrollments.list, { params: { per_page: 100 } }),
    ]);
    const sessions = sessionsRes.data.data;
    const bookings = bookingsRes.data.data;
    const enrollments = enrollmentsRes.data.data;

    const now = new Date();
    const upcoming = sessions
      .filter((s) => mapSessionStatus(s.status) === 'upcoming' && new Date(s.scheduled_at) > now)
      .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
    const completedMinutes = sessions
      .filter((s) => s.status === 'completed')
      .reduce((sum, s) => sum + (s.duration_min ?? 0), 0);

    const records = [...bookings, ...enrollments];
    const paidCount = records.filter((r) => mapPaymentStatus(r.status) === 'paid').length;
    const current = records
      .filter((r) => ['confirmed', 'in_progress'].includes(r.status))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

    return {
      stats: {
        totalPaid: paidCount,
        totalPackages: records.length,
        learningHours: Math.round((completedMinutes / 60) * 10) / 10,
        upcomingSessionsCount: upcoming.length,
      },
      upcomingSessions: upcoming.slice(0, 5).map(mapUpcomingSessionRow),
      currentPackage: current ? mapCurrentPackage(current, sessions) : null,
      activities: [],
    };
  },

  /**
   * No dedicated "teacher dashboard" endpoint exists on the backend (by design —
   * see أ-3: no invented /dashboard/teacher/* routes). Composed client-side from
   * the real resources, plus GET /teachers/{id} which now returns a computed
   * `stats` block (rating_avg, reviews_count, teaching_hours, total_students).
   */
  async getTeacherDashboard() {
    if (config.useMocks) {
      await mockDelay(300);
      return {
        stats: mockTeacherStats,
        upcomingSessions: mockTeacherUpcomingSessions,
        activePackages: mockTeacherActivePackages,
      };
    }
    const teacherId = useAuthStore.getState().user?.teacher?.id;
    const [sessionsRes, packagesRes, teacherRes] = await Promise.all([
      client.get(endpoints.classSessions.list, { params: { status: 'scheduled', per_page: 5 } }),
      client.get(endpoints.packages.list),
      teacherId ? client.get(endpoints.teachers.detail(teacherId)) : Promise.resolve(null),
    ]);
    const packages = packagesRes.data.data;
    const teacherStats = teacherRes?.data.data.stats;

    return {
      stats: {
        averageRating: teacherStats?.rating_avg ?? null,
        teachingHours: teacherStats?.teaching_hours ?? null,
        activePackagesCount: packages.filter((p) => p.status === 'active').length,
        totalStudents: teacherStats?.total_students ?? null,
      },
      upcomingSessions: sessionsRes.data.data,
      activePackages: packages.filter((p) => p.status === 'active'),
    };
  },

  async getTeacherPackagesList() {
    if (config.useMocks) {
      await mockDelay(300);
      return { stats: mockTeacherPackageStats, packages: mockTeacherPackagesList };
    }
    const { data } = await client.get(endpoints.packages.list);
    const packages = data.data;

    return {
      stats: {
        sessionsCount: null,
        pendingReview: packages.filter((p) => p.status === 'pending_approval').length,
        activePackagesCount: packages.filter((p) => p.status === 'active').length,
        totalPackages: packages.length,
      },
      packages,
    };
  },

  async createTeacherPackage(payload) {
    if (config.useMocks) {
      await mockDelay(500);
      return createMockTeacherPackage(payload);
    }
    const { data } = await client.post(endpoints.packages.create, payload);
    return data;
  },

  /** جلب باقة واحدة كاملة (بما فيها curricula/stages/schedules) — للتعديل أو العرض التفصيلي */
  async getTeacherPackage(id) {
    if (config.useMocks) {
      await mockDelay(300);
      return mockTeacherPackagesList.find((p) => p.id === Number(id)) ?? null;
    }
    const { data } = await client.get(endpoints.packages.detail(id));
    return data.data;
  },

  async updateTeacherPackage(id, payload) {
    if (config.useMocks) {
      await mockDelay(500);
      return updateMockTeacherPackage(id, payload);
    }
    const { data } = await client.put(endpoints.packages.update(id), payload);
    return data;
  },

  /** draft → pending_approval — a deliberate separate call from creation (see ب-4) */
  async submitTeacherPackage(id) {
    if (config.useMocks) {
      await mockDelay(400);
      return submitMockTeacherPackage(id);
    }
    const { data } = await client.post(endpoints.packages.submit(id));
    return data;
  },

  async getTeacherCoursesList() {
    if (config.useMocks) {
      await mockDelay(300);
      return mockTeacherCoursesList;
    }
    const { data } = await client.get(endpoints.courses.list);
    return data.data;
  },

  async createTeacherCourse(payload) {
    if (config.useMocks) {
      await mockDelay(500);
      return createMockTeacherCourse(payload);
    }
    const { data } = await client.post(endpoints.courses.create, payload);
    return data;
  },

  async submitTeacherCourse(id) {
    if (config.useMocks) {
      await mockDelay(400);
      return submitMockTeacherCourse(id);
    }
    const { data } = await client.post(endpoints.courses.submit(id));
    return data;
  },

  async getTeacherSessions() {
    if (config.useMocks) {
      await mockDelay(300);
      return mockTeacherSessions;
    }
    const { data } = await client.get(endpoints.classSessions.list);
    return data.data;
  },

  async getTeacherSessionDetails(id) {
    if (config.useMocks) {
      await mockDelay(300);
      return mockTeacherSessions.find((s) => s.id === Number(id)) ?? null;
    }
    const { data } = await client.get(endpoints.classSessions.detail(id));
    return data.data;
  },

  /**
   * No dedicated "my students" endpoint exists (by design — أ-3). Derived
   * client-side as the distinct set of students across the teacher's own
   * bookings (individual/group packages) and enrollments (courses).
   */
  async getTeacherStudents() {
    if (config.useMocks) {
      await mockDelay(300);
      return { stats: mockTeacherStudentStats, students: mockTeacherStudents };
    }
    const [bookingsRes, enrollmentsRes] = await Promise.all([
      client.get(endpoints.bookings.list),
      client.get(endpoints.enrollments.list),
    ]);
    const bookingStudents = bookingsRes.data.data;
    const enrollmentStudents = enrollmentsRes.data.data;
    const byStudentId = new Map();
    [...bookingStudents, ...enrollmentStudents].forEach((record) => {
      if (!byStudentId.has(record.student_id)) byStudentId.set(record.student_id, record);
    });

    return { stats: null, students: [...byStudentId.values()] };
  },

  /**
   * Composed from GET /students/{id} (profile) + the teacher's own bookings/
   * enrollments/class-sessions filtered by ?student_id= (all scoped to the
   * teacher via visibleTo already — the filter just narrows to this student).
   * A student can have several packages/courses with the same teacher; this
   * picks the most recent booking/enrollment as "the" package shown in the
   * header, matching the single-package-per-row shape the details page
   * expects. No true subject taxonomy is available on booking/enrollment
   * records, so the package/course title stands in for it.
   */
  async getTeacherStudentDetails(id) {
    if (config.useMocks) {
      await mockDelay(300);
      return mockTeacherStudents.find((s) => s.id === Number(id)) ?? null;
    }
    const [studentRes, bookingsRes, enrollmentsRes, sessionsRes] = await Promise.all([
      client.get(endpoints.students.detail(id)),
      client.get(endpoints.bookings.list, { params: { student_id: id } }),
      client.get(endpoints.enrollments.list, { params: { student_id: id } }),
      client.get(endpoints.classSessions.list, { params: { student_id: id, per_page: 100 } }),
    ]);

    const student = studentRes.data.data;
    const bookings = bookingsRes.data.data;
    const enrollments = enrollmentsRes.data.data;
    const sessions = sessionsRes.data.data;

    const records = [...bookings, ...enrollments].sort(
      (a, b) => new Date(b.created_at ?? 0) - new Date(a.created_at ?? 0)
    );
    const latest = records[0] ?? null;
    const isCourse = latest != null && 'course_id' in latest;

    const completedSessions = sessions.filter((s) => s.status === 'completed').length;
    const remainingSessions = bookings.reduce((sum, b) => sum + (b.sessions_remaining ?? 0), 0);

    return {
      id: student.id,
      studentName: student.name,
      subject: latest?.package?.title ?? latest?.course?.title ?? null,
      type: isCourse ? 'training' : (latest?.package?.session_format ?? null),
      level: student.stage ?? student.academic_level ?? student.level ?? null,
      joinDate: latest?.created_at ? formatDate(latest.created_at) : null,
      packageTitle: latest?.package?.title ?? latest?.course?.title ?? null,
      completedSessions,
      remainingSessions,
      sessions: sessions.map((session) => {
        const scheduled = session.scheduled_at ? new Date(session.scheduled_at) : null;
        return {
          id: session.id,
          studentName: student.name,
          studentAvatar: student.avatar_path,
          subject: session.booking?.package?.title ?? session.course?.title ?? null,
          time: scheduled ? new Intl.DateTimeFormat('ar', { hour: 'numeric', minute: '2-digit' }).format(scheduled) : null,
          duration: session.duration_min,
          day: scheduled ? new Intl.DateTimeFormat('ar', { weekday: 'long' }).format(scheduled) : null,
          date: scheduled ? new Intl.DateTimeFormat('ar', { day: 'numeric', month: 'long' }).format(scheduled) : null,
          status: session.status,
        };
      }),
    };
  },

  /** Every class session the student attends, mapped into calendar day-cell rows */
  async getCalendarSessions() {
    if (config.useMocks) {
      await mockDelay(300);
      return mockCalendarSessions;
    }
    const { data } = await client.get(endpoints.classSessions.list, { params: { per_page: 300 } });
    return data.data.map(mapCalendarSessionRow);
  },

  /**
   * Same shape as getCalendarSessions, from the teacher's own side — GET /class-sessions
   * is already scoped server-side to teacher_id (ClassSession::scopeVisibleTo), only the
   * join link differs (join_url_teacher, not _student).
   */
  async getTeacherCalendarSessions() {
    if (config.useMocks) {
      await mockDelay(300);
      return mockCalendarSessions;
    }
    const { data } = await client.get(endpoints.classSessions.list, { params: { per_page: 300 } });
    return data.data.map(mapTeacherCalendarSessionRow);
  },

  /** Every class session the student attends, mapped into the flat "الجلسات" list */
  async getSessions(params = {}) {
    if (config.useMocks) {
      await mockDelay(300);
      const page = Number(params.page ?? 1);
      const perPage = Number(params.per_page ?? 10);
      const sorted = [...mockAllSessions];
      const startIndex = (page - 1) * perPage;
      return {
        data: sorted.slice(startIndex, startIndex + perPage),
        meta: {
          current_page: page,
          per_page: perPage,
          total: sorted.length,
          last_page: Math.max(1, Math.ceil(sorted.length / perPage)),
        },
      };
    }
    const { data } = await client.get(endpoints.classSessions.list, {
      params: {
        page: params.page ?? 1,
        per_page: params.per_page ?? 10,
        ...(params.status ? { status: params.status } : {}),
      },
    });
    return {
      data: data.data.map(mapSessionListRow),
      meta: data.meta,
    };
  },

  /**
   * No dedicated Payment-listing endpoint exists — every booking/enrollment
   * already snapshots its own amount_paid/status/is_manual, which is everything
   * an "invoice" row needs, so this composes from those two resources instead.
   */
  async getInvoices() {
    if (config.useMocks) {
      await mockDelay(300);
      return mockInvoices;
    }
    const [bookingsRes, enrollmentsRes] = await Promise.all([
      client.get(endpoints.bookings.list, { params: { per_page: 100 } }),
      client.get(endpoints.enrollments.list, { params: { per_page: 100 } }),
    ]);
    const records = [
      ...bookingsRes.data.data.map((r) => ({ kind: 'booking', record: r })),
      ...enrollmentsRes.data.data.map((r) => ({ kind: 'enrollment', record: r })),
    ].sort((a, b) => new Date(b.record.created_at) - new Date(a.record.created_at));

    return records.map(({ kind, record }) => (kind === 'booking' ? mapBookingToInvoice(record) : mapEnrollmentToInvoice(record)));
  },

  /**
   * "باقاتي" — the student's individual/group package bookings plus course
   * enrollments, unified into one list. Course usage is derived from the
   * student's own class-sessions (fetched once, grouped by course_id) rather
   * than one request per enrollment.
   */
  async getPackagesList() {
    if (config.useMocks) {
      await mockDelay(300);
      return mockPackagesList;
    }
    const [bookingsRes, enrollmentsRes, sessionsRes] = await Promise.all([
      client.get(endpoints.bookings.list, { params: { per_page: 100 } }),
      client.get(endpoints.enrollments.list, { params: { per_page: 100 } }),
      client.get(endpoints.classSessions.list, { params: { per_page: 300 } }),
    ]);
    const sessions = sessionsRes.data.data;
    const records = [
      ...bookingsRes.data.data.map((r) => ({ kind: 'booking', record: r })),
      ...enrollmentsRes.data.data.map((r) => ({ kind: 'enrollment', record: r })),
    ].sort((a, b) => new Date(b.record.created_at) - new Date(a.record.created_at));

    return records.map(({ kind, record }) =>
      kind === 'booking'
        ? mapBookingToPackageCard(record)
        : mapEnrollmentToPackageCard(record, sessions.filter((s) => s.course_id === record.course_id))
    );
  },

  /** `id` is "booking-{id}" or "enrollment-{id}" — see mapBookingToPackageCard/mapEnrollmentToPackageCard */
  async getPackageDetails(id) {
    if (config.useMocks) {
      await mockDelay(300);
      const pkg = mockPackagesList.find((p) => p.id === Number(id));
      return { package: pkg ?? null, sessions: mockPackageSessions[Number(id)] ?? [] };
    }
    const [kind, rawId] = String(id).split('-');

    if (kind === 'booking') {
      const { data } = await client.get(endpoints.bookings.detail(rawId));
      const booking = data.data;
      return {
        package: mapBookingToPackageCard(booking),
        sessions: (booking.attended_sessions ?? []).map(mapSessionListRow),
      };
    }

    if (kind === 'enrollment') {
      const { data } = await client.get(endpoints.enrollments.detail(rawId));
      const enrollment = data.data;
      const sessionsRes = await client.get(endpoints.classSessions.list, {
        params: { course_id: enrollment.course_id, per_page: 300 },
      });
      const courseSessions = sessionsRes.data.data;
      return {
        package: mapEnrollmentToPackageCard(enrollment, courseSessions),
        sessions: courseSessions.map(mapSessionListRow),
      };
    }

    return { package: null, sessions: [] };
  },
};
