import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Camera, Images, Trash2, UserRound } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { SmoothSelect } from '@/components/dashboard/SmoothSelect';
import { MultiSelectChips } from '@/components/dashboard/MultiSelectChips';
import { AcademicSupporterGalleryEditor } from '@/components/academicSupporter/AcademicSupporterGalleryEditor';
import { ApiErrorList, Avatar, ErrorState, Skeleton } from '@/components/ui';
import { ImageCropModal } from '@/components/ui/ImageCropModal';
import { QUALIFICATION_LABELS, EXPERIENCE_LABELS } from '@/services/teacherService';
import { useTaxonomyList } from '@/hooks/useTaxonomy';
import { useAuth } from '@/hooks/useAuth';
import { useUploadAvatar, useDeleteAvatar } from '@/hooks/useProfile';
import {
  useMySupporterProfile,
  useUpdateMySupporterProfile,
  useAddSupporterGalleryItem,
  useRemoveSupporterGalleryItem,
} from '@/hooks/useSupporterAccount';
import { useT } from '@/hooks/useT';

const QUALIFICATION_OPTIONS = Object.entries(QUALIFICATION_LABELS).map(([value, label]) => ({ value, label }));
const EXPERIENCE_OPTIONS = Object.entries(EXPERIENCE_LABELS).map(([value, label]) => ({ value, label }));

export function SupporterSettingsPage() {
  const t = useT();
  const { user } = useAuth();
  const supporterId = user?.academicSupporter?.id;
  const { data: subjects = [] } = useTaxonomyList('subjects');
  const { data: languages = [] } = useTaxonomyList('languages');
  const { data: supporter, isLoading, isError, refetch } = useMySupporterProfile(supporterId);
  const updateProfile = useUpdateMySupporterProfile(supporterId);
  const addGalleryItem = useAddSupporterGalleryItem(supporterId);
  const removeGalleryItem = useRemoveSupporterGalleryItem(supporterId);
  const uploadAvatar = useUploadAvatar();
  const deleteAvatar = useDeleteAvatar();

  const [bio, setBio] = useState('');
  const [qualification, setQualification] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [subjectIds, setSubjectIds] = useState([]);
  const [languageIds, setLanguageIds] = useState([]);
  const [cropFile, setCropFile] = useState(null);

  useEffect(() => {
    if (!supporter) return;
    setBio(supporter.bio ?? '');
    setQualification(supporter.qualification ?? '');
    setExperienceYears(supporter.experienceYears ?? '');
    setSubjectIds((supporter.subjects ?? []).map((s) => s.id));
    setLanguageIds((supporter.languages ?? []).map((l) => l.id));
  }, [supporter]);

  if (!user) return <Navigate to="/login" replace />;

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setCropFile(file);
    e.target.value = '';
  };

  const handleCropConfirm = (croppedFile) => {
    uploadAvatar.mutate(croppedFile, { onSuccess: () => setCropFile(null) });
  };

  const handleSave = () => {
    updateProfile.mutate({
      bio: bio.trim() || null,
      qualification: qualification || null,
      experience_years: experienceYears || null,
      subject_ids: subjectIds,
      language_ids: languageIds,
    });
  };

  const subjectOptions = subjects.map((s) => ({ value: s.id, label: s.name_ar }));
  const languageOptions = languages.map((l) => ({ value: l.id, label: l.name_ar }));

  return (
    <DashboardLayout>
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        {isError ? (
          <ErrorState onRetry={refetch} />
        ) : isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-48 rounded-2xl" />
          </div>
        ) : (
          <>
            <div className="rounded-2xl bg-white p-6 shadow-card">
              <h2 className="flex items-center gap-2 font-bold text-ink">
                <UserRound size={20} className="text-primary" />
                {t('academicSupporter.settings.avatarTitle')}
              </h2>
              <p className="mt-1 text-sm text-ink-soft">{t('academicSupporter.settings.avatarHint')}</p>

              <div className="mt-4 flex items-center gap-4">
                <div className="relative">
                  <Avatar name={user.name} src={user.avatar} size="lg" />
                  <label className="absolute -bottom-1 -left-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-card hover:bg-primary-hover">
                    <Camera size={13} />
                    <input type="file" accept="image/png,image/jpeg" onChange={handleAvatarChange} className="hidden" />
                  </label>
                  {user.avatar && (
                    <button
                      type="button"
                      onClick={() => deleteAvatar.mutate()}
                      disabled={deleteAvatar.isPending}
                      title={t('studentSettings.removePhoto')}
                      className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-accent-pink shadow-card hover:bg-accent-pink/10 disabled:opacity-50"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
                {uploadAvatar.isPending && <span className="text-xs text-ink-soft">{t('studentSettings.uploading')}</span>}
                {deleteAvatar.isPending && <span className="text-xs text-ink-soft">{t('studentSettings.deletingAvatar')}</span>}
              </div>
              {uploadAvatar.isError && <ApiErrorList error={uploadAvatar.error} labelFor={() => null} className="mt-2" />}
              {deleteAvatar.isError && <ApiErrorList error={deleteAvatar.error} labelFor={() => null} className="mt-2" />}
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-card">
              <h2 className="mb-4 text-right font-bold text-ink">{t('academicSupporter.settings.profileTitle')}</h2>

              {updateProfile.isError && <ApiErrorList error={updateProfile.error} labelFor={() => null} className="mb-4" />}
              {updateProfile.isSuccess && (
                <div className="mb-4 rounded-xl bg-success-light px-4 py-2.5 text-sm font-medium text-success">
                  {t('academicSupporter.settings.saveSuccess')}
                </div>
              )}

              <div className="flex flex-col gap-4 text-right">
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-semibold text-ink">{t('academicSupporter.settings.bioLabel')}</span>
                  <textarea
                    rows={4}
                    maxLength={500}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder={t('academicSupporter.settings.bioPlaceholder')}
                    className="w-full resize-none rounded-btn border border-line bg-surface p-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </label>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <SmoothSelect
                    label={t('academicSupporter.settings.qualificationLabel')}
                    value={qualification}
                    onChange={setQualification}
                    options={QUALIFICATION_OPTIONS}
                    placeholder="—"
                  />
                  <SmoothSelect
                    label={t('academicSupporter.settings.experienceLabel')}
                    value={experienceYears}
                    onChange={setExperienceYears}
                    options={EXPERIENCE_OPTIONS}
                    placeholder="—"
                  />
                </div>

                <MultiSelectChips
                  label={t('academicSupporter.settings.subjectsLabel')}
                  values={subjectIds}
                  onChange={setSubjectIds}
                  options={subjectOptions}
                  placeholder={t('academicSupporter.settings.subjectsPlaceholder')}
                  max={30}
                />

                <MultiSelectChips
                  label={t('academicSupporter.settings.languagesLabel')}
                  values={languageIds}
                  onChange={setLanguageIds}
                  options={languageOptions}
                  placeholder={t('academicSupporter.settings.languagesPlaceholder')}
                  max={20}
                />
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  disabled={updateProfile.isPending}
                  onClick={handleSave}
                  className="rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {updateProfile.isPending ? t('academicSupporter.settings.saving') : t('academicSupporter.settings.save')}
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-card">
              <h2 className="mb-1 flex items-center gap-2 font-bold text-ink">
                <Images size={20} className="text-primary" />
                {t('teacherGallery.sectionTitle')}
              </h2>
              <p className="mb-4 text-sm text-ink-soft">{t('teacherGallery.sectionHint')}</p>
              <AcademicSupporterGalleryEditor
                items={supporter?.galleryItems ?? []}
                onAdd={(file, thumbnail) => addGalleryItem.mutate({ file, thumbnail })}
                isAdding={addGalleryItem.isPending}
                addError={addGalleryItem.isError ? addGalleryItem.error : null}
                onRemove={(id) => removeGalleryItem.mutate(id)}
                removingId={removeGalleryItem.isPending ? removeGalleryItem.variables : null}
              />
            </div>
          </>
        )}
      </div>

      {cropFile && (
        <ImageCropModal
          file={cropFile}
          onCancel={() => setCropFile(null)}
          onConfirm={handleCropConfirm}
          isSaving={uploadAvatar.isPending}
        />
      )}
    </DashboardLayout>
  );
}
