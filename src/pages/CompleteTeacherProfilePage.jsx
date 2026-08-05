import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { GraduationCap, UploadCloud, FileText, Check, Camera, Clock, XCircle, Ban } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { SmoothSelect } from '@/components/dashboard/SmoothSelect';
import { MultiSelectChips } from '@/components/dashboard/MultiSelectChips';
import { Avatar } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import {
  useMyTeacher,
  useUpdateMyTeacherProfile,
  useUploadVerificationDocument,
  useSubmitForVerification,
} from '@/hooks/useTeacherAccount';
import { useUploadAvatar } from '@/hooks/useProfile';
import { useTaxonomyList } from '@/hooks/useTaxonomy';
import { QUALIFICATION_LABELS, EXPERIENCE_LABELS } from '@/services/teacherService';
import { DOCUMENT_TYPE_LABELS, DOCUMENT_STATUS_STYLES } from '@/mocks/admin.mock';
import { useT } from '@/hooks/useT';

const QUALIFICATION_OPTIONS = Object.entries(QUALIFICATION_LABELS).map(([value, label]) => ({ value, label }));
const EXPERIENCE_OPTIONS = Object.entries(EXPERIENCE_LABELS).map(([value, label]) => ({ value, label }));
const DOCUMENT_TYPE_OPTIONS = Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => ({ value, label }));

/** يطابق TeacherService::REQUIRED_DOCUMENT_TYPES في الباك تماماً */
const REQUIRED_DOCUMENT_TYPES = ['identity', 'academic', 'experience'];

function StatusScreen({ icon: Icon, tone, title, body }) {
  const toneClasses = {
    warning: 'bg-[#FEF3E2] text-[#B7791F]',
    danger: 'bg-accent-pink/10 text-accent-pink',
    neutral: 'bg-[#F2F2F7] text-ink-soft',
  };
  return (
    <PageContainer>
      <div className="container-app flex justify-center py-16">
        <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-2xl bg-surface p-8 text-center shadow-card">
          <div className={`flex h-16 w-16 items-center justify-center rounded-full ${toneClasses[tone]}`}>
            <Icon size={30} />
          </div>
          <h1 className="text-lg font-bold text-ink">{title}</h1>
          <p className="text-sm leading-relaxed text-ink-soft">{body}</p>
        </div>
      </div>
    </PageContainer>
  );
}

export function CompleteTeacherProfilePage() {
  const t = useT();
  const { user } = useAuth();
  const isTrainingCenter = user?.teacherType === 'training_center';
  const teacherId = user?.teacher?.id;
  const status = user?.teacher?.status;

  const { data: teacher, isLoading } = useMyTeacher(teacherId);
  const updateProfile = useUpdateMyTeacherProfile(teacherId);
  const uploadDocument = useUploadVerificationDocument(teacherId);
  const submitForVerification = useSubmitForVerification(teacherId);
  const uploadAvatar = useUploadAvatar();

  const [form, setForm] = useState({
    bio: '',
    qualification: '',
    experience_years: '',
    subject_ids: [],
    curriculum_ids: [],
    language_ids: [],
    display_name_en: '',
    commercial_register: '',
  });
  const [hydrated, setHydrated] = useState(false);
  const [docType, setDocType] = useState('identity');
  const [docFile, setDocFile] = useState(null);

  const { data: subjects = [] } = useTaxonomyList('subjects');
  const { data: curricula = [] } = useTaxonomyList('curricula');
  const { data: languages = [] } = useTaxonomyList('languages');

  useEffect(() => {
    if (teacher && !hydrated) {
      setForm({
        bio: teacher.bio ?? '',
        qualification: teacher.qualification ?? '',
        experience_years: teacher.experience_years ?? '',
        subject_ids: (teacher.subjects ?? []).map((s) => s.id),
        curriculum_ids: (teacher.curricula ?? []).map((c) => c.id),
        language_ids: (teacher.languages ?? []).map((l) => l.id),
        display_name_en: teacher.display_name_en ?? '',
        commercial_register: teacher.commercial_register ?? '',
      });
      setHydrated(true);
    }
  }, [teacher, hydrated]);

  if (!user) return <Navigate to="/login" replace />;
  if (!user.teacher) return <Navigate to="/" replace />;

  // بعد الإرسال، الحساب محجوز عن لوحة التحكم حتى يقرر الأدمن — انظر ProtectedRoute
  if (status === 'pending_verification') {
    return (
      <StatusScreen
        icon={Clock}
        tone="warning"
        title={t('completeProfile.pendingTitle')}
        body={t('completeProfile.pendingBody')}
      />
    );
  }
  if (status === 'rejected') {
    return (
      <StatusScreen
        icon={XCircle}
        tone="danger"
        title={t('completeProfile.rejectedTitle')}
        body={teacher?.rejection_reason || t('completeProfile.rejectedBody')}
      />
    );
  }
  if (status === 'suspended') {
    return (
      <StatusScreen
        icon={Ban}
        tone="neutral"
        title={t('completeProfile.suspendedTitle')}
        body={t('completeProfile.suspendedBody')}
      />
    );
  }

  const documents = teacher?.verification_documents ?? [];
  const uploadedTypes = new Set(documents.map((d) => d.type));
  const missingTypes = REQUIRED_DOCUMENT_TYPES.filter((type) => !uploadedTypes.has(type));
  const canSubmit = form.bio.trim() !== '' && missingTypes.length === 0;

  const patch = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSaveProfile = () => {
    updateProfile.mutate({
      bio: form.bio || null,
      qualification: form.qualification || null,
      experience_years: form.experience_years || null,
      subject_ids: form.subject_ids,
      curriculum_ids: form.curriculum_ids,
      language_ids: form.language_ids,
      ...(isTrainingCenter
        ? { display_name_en: form.display_name_en, commercial_register: form.commercial_register }
        : {}),
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) uploadAvatar.mutate(file);
  };

  const handleUpload = () => {
    if (!docFile) return;
    uploadDocument.mutate({ type: docType, file: docFile }, { onSuccess: () => setDocFile(null) });
  };

  // بلا تنقّل بعد النجاح عمداً — status يصبح pending_verification فوراً عبر
  // useSubmitForVerification، والصفحة نفسها تعيد العرض تلقائياً بشاشة الانتظار
  const handleSubmitForReview = () => {
    if (!canSubmit) return;
    submitForVerification.mutate();
  };

  const saveError = updateProfile.error?.errors ? Object.values(updateProfile.error.errors).flat()[0] : updateProfile.error?.message;
  const submitError = submitForVerification.error?.errors?.profile?.[0] ?? submitForVerification.error?.message;
  const avatarError = uploadAvatar.error?.errors ? Object.values(uploadAvatar.error.errors).flat()[0] : uploadAvatar.error?.message;

  return (
    <PageContainer>
      <div className="container-app flex justify-center py-10">
        <div className="w-full max-w-2xl rounded-2xl bg-surface p-6 shadow-card sm:p-8">
          <div className="mb-6 flex flex-col items-center gap-3 text-center">
            <div className="relative">
              <Avatar name={user.name} src={user.avatar} size="xl" />
              <label className="absolute -bottom-1 -left-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-card hover:bg-primary-hover">
                <Camera size={15} />
                <input type="file" accept="image/png,image/jpeg" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>
            {uploadAvatar.isPending && <span className="text-xs text-ink-soft">{t('completeProfile.uploading')}</span>}
            {avatarError && <span className="text-xs text-accent-pink">{avatarError}</span>}

            <h1 className="text-xl font-bold text-ink">{t('completeProfile.teacherTitle')}</h1>
            <p className="text-sm text-ink-soft">{t('completeProfile.teacherHint')}</p>
          </div>

          {isLoading ? (
            <p className="text-center text-sm text-ink-soft">…</p>
          ) : (
            <>
              {saveError && (
                <div className="mb-4 rounded-btn bg-accent-pink/10 px-4 py-3 text-sm text-accent-pink">{saveError}</div>
              )}

              <div className="flex flex-col gap-4 text-right">
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-semibold text-ink">{t('completeProfile.bioLabel')}</span>
                  <textarea
                    rows={4}
                    value={form.bio}
                    onChange={patch('bio')}
                    maxLength={2000}
                    className="w-full resize-none rounded-btn border border-line bg-white p-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </label>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <SmoothSelect
                    label={t('completeProfile.qualificationLabel')}
                    value={form.qualification}
                    onChange={(v) => setForm((prev) => ({ ...prev, qualification: v }))}
                    options={QUALIFICATION_OPTIONS}
                    placeholder="—"
                  />
                  <SmoothSelect
                    label={t('completeProfile.experienceLabel')}
                    value={form.experience_years}
                    onChange={(v) => setForm((prev) => ({ ...prev, experience_years: v }))}
                    options={EXPERIENCE_OPTIONS}
                    placeholder="—"
                  />
                </div>

                <MultiSelectChips
                  label={t('completeProfile.subjectsLabel')}
                  values={form.subject_ids}
                  onChange={(v) => setForm((prev) => ({ ...prev, subject_ids: v }))}
                  options={subjects.map((s) => ({ value: s.id, label: s.name_ar }))}
                  placeholder="—"
                />
                <MultiSelectChips
                  label={t('completeProfile.curriculumLabel')}
                  values={form.curriculum_ids}
                  onChange={(v) => setForm((prev) => ({ ...prev, curriculum_ids: v }))}
                  options={curricula.map((c) => ({ value: c.id, label: c.name_ar }))}
                  placeholder="—"
                />
                <MultiSelectChips
                  label={t('completeProfile.languagesLabel')}
                  values={form.language_ids}
                  onChange={(v) => setForm((prev) => ({ ...prev, language_ids: v }))}
                  options={languages.map((l) => ({ value: l.id, label: l.name_ar }))}
                  placeholder="—"
                />

                {isTrainingCenter && (
                  <>
                    <label className="flex flex-col gap-1.5">
                      <span className="text-sm font-semibold text-ink">{t('completeProfile.displayNameEnLabel')}</span>
                      <input
                        type="text"
                        dir="ltr"
                        value={form.display_name_en}
                        onChange={patch('display_name_en')}
                        className="w-full rounded-btn border border-line bg-white p-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="text-sm font-semibold text-ink">{t('completeProfile.commercialRegisterLabel')}</span>
                      <input
                        type="text"
                        dir="ltr"
                        value={form.commercial_register}
                        onChange={patch('commercial_register')}
                        className="w-full rounded-btn border border-line bg-white p-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </label>
                  </>
                )}
              </div>

              <button
                type="button"
                disabled={updateProfile.isPending}
                onClick={handleSaveProfile}
                className="mt-4 w-full rounded-xl border-2 border-primary py-3 text-sm font-medium text-primary transition-opacity hover:opacity-80 disabled:opacity-50"
              >
                {updateProfile.isPending ? t('completeProfile.saving') : t('completeProfile.saveProfile')}
              </button>

              <div className="mt-8 border-t border-line/60 pt-6">
                <h2 className="text-right text-base font-bold text-ink">{t('completeProfile.documentsTitle')}</h2>
                <p className="mt-1 text-right text-sm text-ink-soft">{t('completeProfile.documentsRequiredHint')}</p>

                <ul className="mt-4 flex flex-col gap-2">
                  {REQUIRED_DOCUMENT_TYPES.map((type) => {
                    const uploadedDoc = documents.find((d) => d.type === type);
                    const style = uploadedDoc ? DOCUMENT_STATUS_STYLES[uploadedDoc.status] : null;
                    return (
                      <li
                        key={type}
                        className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-right shadow-card ${
                          uploadedDoc ? 'bg-white' : 'bg-accent-pink/5'
                        }`}
                      >
                        {uploadedDoc ? (
                          <span
                            className="rounded-pill px-3 py-1 text-xs font-bold"
                            style={{ backgroundColor: style?.bg, color: style?.color }}
                          >
                            {style?.label}
                          </span>
                        ) : (
                          <span className="rounded-pill bg-accent-pink/10 px-3 py-1 text-xs font-bold text-accent-pink">
                            {t('completeProfile.documentMissing')}
                          </span>
                        )}
                        <span className="flex items-center gap-2 text-sm font-medium text-ink">
                          {DOCUMENT_TYPE_LABELS[type] ?? type}
                          <FileText size={16} className="text-ink-soft" />
                        </span>
                      </li>
                    );
                  })}

                  {documents
                    .filter((d) => !REQUIRED_DOCUMENT_TYPES.includes(d.type))
                    .map((doc) => {
                      const style = DOCUMENT_STATUS_STYLES[doc.status];
                      return (
                        <li key={doc.id} className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 text-right shadow-card">
                          <span className="rounded-pill px-3 py-1 text-xs font-bold" style={{ backgroundColor: style?.bg, color: style?.color }}>
                            {style?.label}
                          </span>
                          <span className="flex items-center gap-2 text-sm font-medium text-ink">
                            {DOCUMENT_TYPE_LABELS[doc.type] ?? doc.type}
                            <FileText size={16} className="text-ink-soft" />
                          </span>
                        </li>
                      );
                    })}
                </ul>

                <div className="mt-4 flex flex-col gap-3 rounded-xl border border-dashed border-line bg-white p-4 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <SmoothSelect
                      label={t('completeProfile.documentTypeLabel')}
                      value={docType}
                      onChange={setDocType}
                      options={DOCUMENT_TYPE_OPTIONS}
                    />
                  </div>
                  <label className="flex flex-1 flex-col gap-1.5">
                    <span className="text-sm font-semibold text-ink">{t('completeProfile.documentFileLabel')}</span>
                    <input
                      type="file"
                      onChange={(e) => setDocFile(e.target.files?.[0] ?? null)}
                      className="w-full rounded-btn border border-line bg-white p-2.5 text-sm text-ink"
                    />
                  </label>
                  <button
                    type="button"
                    disabled={!docFile || uploadDocument.isPending}
                    onClick={handleUpload}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    <UploadCloud size={16} />
                    {uploadDocument.isPending ? t('completeProfile.uploading') : t('completeProfile.upload')}
                  </button>
                </div>
              </div>

              {submitError && (
                <div className="mt-4 rounded-btn bg-accent-pink/10 px-4 py-3 text-sm text-accent-pink">{submitError}</div>
              )}

              <button
                type="button"
                disabled={!canSubmit || submitForVerification.isPending}
                onClick={handleSubmitForReview}
                className="mt-6 flex w-full items-center justify-center gap-1.5 rounded-xl bg-success py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <Check size={16} />
                {submitForVerification.isPending ? t('completeProfile.submitting') : t('completeProfile.submitForReview')}
              </button>
              {!canSubmit && <p className="mt-2 text-center text-xs text-ink-soft">{t('completeProfile.submitHint')}</p>}
            </>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
