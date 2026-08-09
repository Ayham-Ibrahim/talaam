import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { MessageSquareText, Pencil, Star } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ReviewFormModal } from '@/components/dashboard/ReviewFormModal';
import { Avatar, Card, EmptyState, ErrorState, Skeleton, StarRating } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useSessions } from '@/hooks/useDashboard';
import { useCreateReview, useMyReviews, useUpdateReview } from '@/hooks/useMyReviews';
import { useT } from '@/hooks/useT';

export function StudentReviewsPage() {
  const t = useT();
  const { user } = useAuth();
  const { data: sessions, isLoading: sessionsLoading, isError: sessionsError, refetch: refetchSessions } = useSessions();
  const { data: reviews, isLoading: reviewsLoading, isError: reviewsError, refetch: refetchReviews } = useMyReviews();
  const createReview = useCreateReview();
  const updateReview = useUpdateReview();

  const [modal, setModal] = useState(null); // { mode: 'create', session } | { mode: 'edit', review }

  const reviewedSessionIds = useMemo(() => new Set((reviews ?? []).map((r) => r.classSessionId)), [reviews]);
  const reviewableSessions = useMemo(
    () => (sessions ?? []).filter((s) => s.status === 'attended' && !reviewedSessionIds.has(s.id)),
    [sessions, reviewedSessionIds]
  );

  if (!user) return <Navigate to="/login" replace />;

  const isLoading = sessionsLoading || reviewsLoading;
  const isError = sessionsError || reviewsError;
  const refetch = () => {
    refetchSessions();
    refetchReviews();
  };

  const closeModal = () => setModal(null);

  const activeMutation = modal?.mode === 'edit' ? updateReview : createReview;

  const handleSubmit = ({ rating, comment }) => {
    if (modal?.mode === 'edit') {
      updateReview.mutate({ reviewId: modal.review.id, rating, comment }, { onSuccess: closeModal });
    } else {
      createReview.mutate({ sessionId: modal.session.id, rating, comment }, { onSuccess: closeModal });
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        {/* Sessions awaiting a review */}
        <div>
          <h2 className="mb-3 text-right text-lg font-bold text-ink">{t('studentReviews.pendingTitle')}</h2>
          {isError ? (
            <ErrorState onRetry={refetch} />
          ) : isLoading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-2xl" />
              ))}
            </div>
          ) : reviewableSessions.length === 0 ? (
            <EmptyState
              icon={Star}
              title={t('studentReviews.pendingEmptyTitle')}
              hint={t('studentReviews.pendingEmptyHint')}
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {reviewableSessions.map((session) => (
                <Card key={session.id} className="flex items-center justify-between gap-3 p-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={session.teacherName} src={session.teacherAvatar} size="sm" />
                    <div className="text-start">
                      <div className="text-sm font-bold text-ink">{session.teacherName}</div>
                      <div className="text-xs text-ink-soft">
                        {session.subject} · {session.date}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModal({ mode: 'create', session })}
                    className="shrink-0 rounded-xl border-2 border-primary px-4 py-2 text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-white"
                  >
                    {t('studentReviews.addReview')}
                  </button>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* My submitted reviews */}
        <div>
          <h2 className="mb-3 text-right text-lg font-bold text-ink">{t('studentReviews.mineTitle')}</h2>
          {isError ? null : isLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-2xl" />
              ))}
            </div>
          ) : (reviews ?? []).length === 0 ? (
            <EmptyState icon={MessageSquareText} title={t('studentReviews.mineEmptyTitle')} hint={t('studentReviews.mineEmptyHint')} />
          ) : (
            <div className="flex flex-col gap-3">
              {reviews.map((review) => (
                <Card key={review.id} className="flex flex-col gap-3 p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={review.teacherName} src={review.teacherAvatar} size="sm" />
                      <div className="text-start">
                        <div className="text-sm font-bold text-ink">{review.teacherName}</div>
                        <StarRating value={review.rating} size={13} />
                      </div>
                    </div>
                    {review.canEdit && (
                      <button
                        type="button"
                        onClick={() => setModal({ mode: 'edit', review })}
                        className="flex items-center gap-1.5 rounded-xl border border-line px-3 py-1.5 text-xs font-medium text-ink-soft hover:bg-line/30"
                      >
                        <Pencil size={13} />
                        {t('studentReviews.edit')}
                      </button>
                    )}
                  </div>

                  {review.comment && <p className="text-start text-sm leading-relaxed text-ink">{review.comment}</p>}

                  {review.response && (
                    <div className="rounded-xl bg-canvas p-3 text-start">
                      <div className="text-xs font-bold text-primary">{t('studentReviews.teacherResponse')}</div>
                      <p className="mt-1 text-sm text-ink-soft">{review.response}</p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {modal && (
        <ReviewFormModal
          title={modal.mode === 'edit' ? t('studentReviews.editTitle') : t('studentReviews.addReviewTitle')}
          initialRating={modal.mode === 'edit' ? modal.review.rating : 0}
          initialComment={modal.mode === 'edit' ? (modal.review.comment ?? '') : ''}
          isPending={activeMutation.isPending}
          error={activeMutation.isError ? activeMutation.error : null}
          onSubmit={handleSubmit}
          onClose={closeModal}
        />
      )}
    </DashboardLayout>
  );
}
