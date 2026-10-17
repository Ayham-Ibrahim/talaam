import { useEffect, useState } from 'react';
import { Images } from 'lucide-react';
import { SmoothSelect } from '@/components/dashboard/SmoothSelect';
import { MultiSelectChips } from '@/components/dashboard/MultiSelectChips';
import { AcademicSupporterGalleryEditor } from '@/components/academicSupporter/AcademicSupporterGalleryEditor';
import { ApiErrorList } from '@/components/ui';
import { QUALIFICATION_LABELS, EXPERIENCE_LABELS } from '@/services/teacherService';
import { useTaxonomyList } from '@/hooks/useTaxonomy';
import {
  useAdminUpdateAcademicSupporterProfile,
} from '@/hooks/useAcademicSupporters';
import { academicSupporterService } from '@/services/academicSupporterService';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { useT } from '@/hooks/useT';

const QUALIFICATION_OPTIONS = Object.entries(QUALIFICATION_LABELS).map(([value, label]) => ({ value, label }));
const EXPERIENCE_OPTIONS = Object.entries(EXPERIENCE_LABELS).map(([value, label]) => ({ value, label }));

/** لا مرحلة توثيق هنا — المحرّر محدود بالملف الشخصي + الغاليري فقط (بعكس AdminTeacherProfileEditor). */
export function AdminAcademicSupporterProfileEditor({ supporterId, supporter }) {
  const t = useT();
  const { data: subjects = [] } = useTaxonomyList('subjects');
  const { data: languages = [] } = useTaxonomyList('languages');
  const updateProfile = useAdminUpdateAcademicSupporterProfile(supporterId);
  const queryClient = useQueryClient();

  const [bio, setBio] = useState(supporter.bio ?? '');
  const [qualification, setQualification] = useState(supporter.qualification ?? '');
  const [experienceYears, setExperienceYears] = useState(supporter.experienceYears ?? '');
  const [subjectIds, setSubjectIds] = useState((supporter.subjects ?? []).map((s) => s.id));
  const [languageIds, setLanguageIds] = useState((supporter.languages ?? []).map((l) => l.id));

  useEffect(() => {
    setBio(supporter.bio ?? '');
    setQualification(supporter.qualification ?? '');
    setExperienceYears(supporter.experienceYears ?? '');
    setSubjectIds((supporter.subjects ?? []).map((s) => s.id));
    setLanguageIds((supporter.languages ?? []).map((l) => l.id));
  }, [supporter]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.academicSupporterDetail(supporterId) });

  const addGalleryItem = useMutation({
    mutationFn: ({ file, thumbnail }) => academicSupporterService.addGalleryItem(supporterId, file, thumbnail),
    onSuccess: invalidate,
  });
  const removeGalleryItem = useMutation({
    mutationFn: (itemId) => academicSupporterService.removeGalleryItem(itemId),
    onSuccess: invalidate,
  });

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
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl bg-white p-6 shadow-card">
        <h2 className="mb-4 text-right font-bold text-ink">{t('dashboard.adminAcademicSupporterDetail.profileTitle')}</h2>

        {updateProfile.isError && <ApiErrorList error={updateProfile.error} labelFor={() => null} className="mb-4" />}
        {updateProfile.isSuccess && (
          <div className="mb-4 rounded-xl bg-success-light px-4 py-2.5 text-sm font-medium text-success">
            {t('dashboard.adminAcademicSupporterDetail.saveSuccess')}
          </div>
        )}

        <div className="flex flex-col gap-4 text-right">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink">{t('dashboard.adminAcademicSupporterDetail.bioLabel')}</span>
            <textarea
              rows={4}
              maxLength={500}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full resize-none rounded-btn border border-line bg-surface p-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SmoothSelect
              label={t('dashboard.adminAcademicSupporterDetail.qualificationLabel')}
              value={qualification}
              onChange={setQualification}
              options={QUALIFICATION_OPTIONS}
              placeholder="—"
            />
            <SmoothSelect
              label={t('dashboard.adminAcademicSupporterDetail.experienceLabel')}
              value={experienceYears}
              onChange={setExperienceYears}
              options={EXPERIENCE_OPTIONS}
              placeholder="—"
            />
          </div>

          <MultiSelectChips
            label={t('dashboard.adminAcademicSupporterDetail.subjectsLabel')}
            values={subjectIds}
            onChange={setSubjectIds}
            options={subjectOptions}
            placeholder={t('dashboard.adminAcademicSupporterDetail.subjectsPlaceholder')}
            max={30}
          />

          <MultiSelectChips
            label={t('dashboard.adminAcademicSupporterDetail.languagesLabel')}
            values={languageIds}
            onChange={setLanguageIds}
            options={languageOptions}
            placeholder={t('dashboard.adminAcademicSupporterDetail.languagesPlaceholder')}
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
            {updateProfile.isPending ? t('dashboard.adminAcademicSupporterDetail.saving') : t('dashboard.adminAcademicSupporterDetail.save')}
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
          items={supporter.galleryItems ?? []}
          onAdd={(file, thumbnail) => addGalleryItem.mutate({ file, thumbnail })}
          isAdding={addGalleryItem.isPending}
          addError={addGalleryItem.isError ? addGalleryItem.error : null}
          onRemove={(id) => removeGalleryItem.mutate(id)}
          removingId={removeGalleryItem.isPending ? removeGalleryItem.variables : null}
        />
      </div>
    </div>
  );
}
