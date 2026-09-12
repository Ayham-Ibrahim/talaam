import { useEffect, useState } from 'react';
import { UploadCloud, Check, FileText, UserCog, Camera, Trash2 } from 'lucide-react';
import { SmoothSelect } from '@/components/dashboard/SmoothSelect';
import { MultiSelectChips } from '@/components/dashboard/MultiSelectChips';
import { TagChipsInput } from '@/components/dashboard/TagChipsInput';
import { TeacherVideosEditor } from '@/components/teacher/TeacherVideosEditor';
import { TeacherFaqEditor } from '@/components/teacher/TeacherFaqEditor';
import { TeacherExperienceEditor } from '@/components/teacher/TeacherExperienceEditor';
import { ApiErrorList, Avatar } from '@/components/ui';
import {
  useAdminUpdateTeacherProfile,
  useAdminUploadDocument,
  useAdminSubmitForVerification,
  useAdminUploadTeacherAvatar,
  useAdminDeleteTeacherAvatar,
  useAdminAddVideo,
  useAdminRemoveVideo,
  useAdminAddFaq,
  useAdminRemoveFaq,
  useAdminAddExperience,
  useAdminRemoveExperience,
} from '@/hooks/useAdmin';
import { useTaxonomyList } from '@/hooks/useTaxonomy';
import { QUALIFICATION_LABELS, EXPERIENCE_LABELS } from '@/services/teacherService';
import { DOCUMENT_TYPE_LABELS, DOCUMENT_STATUS_STYLES } from '@/mocks/admin.mock';
import { isEditingKey, isNameInputCharacterValid, sanitizeName } from '@/lib/accountFormValidation';
import { useT } from '@/hooks/useT';

const QUALIFICATION_OPTIONS = Object.entries(QUALIFICATION_LABELS).map(([value, label]) => ({ value, label }));
const EXPERIENCE_OPTIONS = Object.entries(EXPERIENCE_LABELS).map(([value, label]) => ({ value, label }));
const DOCUMENT_TYPE_OPTIONS = Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => ({ value, label }));

/** يطابق Teacher::REQUIRED_DOCUMENT_TYPES في الباك تماماً (نفس ثابت CompleteTeacherProfilePage) */
const REQUIRED_DOCUMENT_TYPES = ['identity', 'academic', 'experience'];

// نفس الاقتراحات تماماً المستخدَمة في TeacherProfileEditorCard (تحرير المعلم لنفسه)
// — تكرار مقصود مؤقتاً حتى تُستخرَج لملف مشترك.
const TEACHING_METHOD_SUGGESTIONS = [
  'شرح مباشر', 'حل واجبات', 'تدريب امتحانات', 'تدريب عملي', 'مشاريع', 'مراجعة', 'خطة فردية',
];
const EXAM_PREP_SUGGESTIONS = ['SAT', 'ACT', 'IB', 'IGCSE', 'GCSE', 'A-Level', 'AP', 'TOEFL', 'IELTS', 'EmSAT'];

const PROFILE_FIELD_LABELS = {
  bio: 'نبذة عن المعلم',
  qualification: 'المؤهل العلمي',
  experience_years: 'سنوات الخبرة',
  city: 'الموقع',
  subject_ids: 'المواد',
  curriculum_ids: 'المناهج',
  language_ids: 'اللغات',
  teaching_methods: 'طريقة التدريس',
  exam_prep: 'التحضير للامتحانات',
  display_name_en: 'الاسم بالإنجليزية',
  commercial_register: 'السجل التجاري',
};
const profileErrorLabel = (path) => PROFILE_FIELD_LABELS[path.replace(/\.\d+$/, '')] ?? path;

/**
 * يتيح للأدمن إكمال ملف معلم لم يُكمله بنفسه بعد (دُعي أو استُورد ولم يدخل
 * حسابه أصلاً) ثم إرساله للتوثيق واعتماده — دون انتظار المعلم. يعيد استخدام
 * نفس مسارات الباك التي يستخدمها المعلم لنفسه بالضبط (PUT teachers/{id}،
 * POST verification-documents، POST submit-for-verification)؛ التوسيع الوحيد
 * كان في TeacherPolicy::submitForVerification وVerificationDocumentPolicy::create
 * للسماح للأدمن بهما أيضاً (TeacherPolicy::update كانت مفتوحة للأدمن أصلاً).
 *
 * rawStatus (لا status المُبسَّط لأربع حالات في AdminTeacherResource) هو ما
 * يحدّد ما يُعرَض هنا تحديداً — active_unverified/pending_verification كلاهما
 * "pending" في status لكنهما يسمحان بإجراءات مختلفة تماماً هنا.
 */
/**
 * teacherId يُمرَّر صراحة (بدل الاعتماد على teacher.id القادم من الـ API) —
 * يجب أن يطابق نوعاً وقيمةً الـ id نفسه الذي بُني به queryKeys.admin.teacherDetail
 * في الصفحة الأم (سلسلة نصية من useParams)، وإلا فإن invalidateQueries هنا
 * يستهدف مفتاح كاش مختلف (رقم لا سلسلة) فلا يحدَّث شيء ظاهرياً رغم نجاح
 * الطلب فعلياً (كان هذا هو العطل: "تم الرفع بنجاح" يظهر، لكن قائمة الوثائق
 * تبقى على "لم تُرفع بعد").
 */
export function AdminTeacherProfileEditor({ teacherId, teacher, documents }) {
  const t = useT();
  const isTrainingCenter = teacher.type === 'training_center';
  const rawStatus = teacher.rawStatus;

  // كان مقصوراً سابقاً على invited/active_unverified فقط (إكمال ملف لم يُكمله
  // المعلم بعد) — الآن يظهر دوماً، فالأدمن يحتاج تعديل بيانات معلم موثَّق
  // بالفعل أيضاً تماماً كما يستطيع المعلم نفسه عبر TeacherProfileEditorCard.
  const showProfileForm = true;
  const showDocumentUpload = rawStatus !== 'verified' && rawStatus !== 'rejected';
  // "invited" مقبولة أيضاً — معلم مستورَد/مدعوّ لم يقبل دعوته بعد (بلا كلمة
  // مرور، لا طريق له ليصل إلى active_unverified بنفسه)؛ الباك اند
  // (TeacherService::submitForVerification) يقبل الحالتين معاً لهذا السبب تحديداً.
  const showSubmitButton = rawStatus === 'invited' || rawStatus === 'active_unverified';
  // الصورة والفيديوهات ليست جزءاً من متطلبات التوثيق — تُعرَض دوماً بصرف
  // النظر عن حالة المعلم (خلافاً لبقية أقسام هذا المكوّن)، فالتبويب لا يبقى
  // فارغاً تماماً لمعلم موثَّق بالفعل.
  const showMediaSection = true;

  const updateProfile = useAdminUpdateTeacherProfile(teacherId);
  const uploadDocument = useAdminUploadDocument(teacherId);
  const submitForVerification = useAdminSubmitForVerification(teacherId);
  const uploadAvatar = useAdminUploadTeacherAvatar(teacherId);
  const deleteAvatar = useAdminDeleteTeacherAvatar(teacherId);
  const addVideo = useAdminAddVideo(teacherId);
  const removeVideo = useAdminRemoveVideo(teacherId);
  const addFaq = useAdminAddFaq(teacherId);
  const removeFaq = useAdminRemoveFaq(teacherId);
  const addExperience = useAdminAddExperience(teacherId);
  const removeExperience = useAdminRemoveExperience(teacherId);

  const [form, setForm] = useState({
    bio: '',
    qualification: '',
    experience_years: '',
    city: '',
    subject_ids: [],
    curriculum_ids: [],
    language_ids: [],
    teaching_methods: [],
    exam_prep: [],
    display_name_en: '',
    commercial_register: '',
  });
  const [hydrated, setHydrated] = useState(false);
  const [docType, setDocType] = useState('identity');
  const [docFile, setDocFile] = useState(null);
  const [docInputKey, setDocInputKey] = useState(0);
  const [displayNameHasInvalidChars, setDisplayNameHasInvalidChars] = useState(false);
  const [profileSuccessMessage, setProfileSuccessMessage] = useState('');

  const { data: subjects = [] } = useTaxonomyList('subjects');
  const { data: curricula = [] } = useTaxonomyList('curricula');
  const { data: languages = [] } = useTaxonomyList('languages');

  useEffect(() => {
    if (teacher && !hydrated) {
      setForm({
        bio: teacher.bio ?? '',
        qualification: teacher.qualification ?? '',
        experience_years: teacher.experienceYears ?? '',
        city: teacher.city ?? '',
        subject_ids: (teacher.subjects ?? []).map((s) => s.id),
        curriculum_ids: (teacher.curricula ?? []).map((c) => c.id),
        language_ids: (teacher.languages ?? []).map((l) => l.id),
        teaching_methods: teacher.teachingMethods ?? [],
        exam_prep: teacher.examPrep ?? [],
        display_name_en: teacher.displayNameEn ?? '',
        commercial_register: teacher.commercialRegister ?? '',
      });
      setHydrated(true);
    }
  }, [teacher, hydrated]);

  if (!showProfileForm && !showDocumentUpload && !showMediaSection) return null;

  const uploadedTypes = new Set(documents.map((d) => d.type));
  const missingTypes = REQUIRED_DOCUMENT_TYPES.filter((type) => !uploadedTypes.has(type));
  const canSubmit = form.bio.trim() !== '' && missingTypes.length === 0;

  const patch = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleDisplayNameChange = (e) => {
    const nextValue = e.target.value;
    setDisplayNameHasInvalidChars(!isNameInputCharacterValid(nextValue));
    setForm((prev) => ({ ...prev, display_name_en: sanitizeName(nextValue) }));
  };

  const handleDisplayNameKeyDown = (e) => {
    if (isEditingKey(e) || isNameInputCharacterValid(e.key)) {
      setDisplayNameHasInvalidChars(false);
      return;
    }
    e.preventDefault();
    setDisplayNameHasInvalidChars(true);
  };

  const handleDisplayNamePaste = (e) => {
    const pastedText = e.clipboardData.getData('text');
    if (!isNameInputCharacterValid(pastedText)) {
      e.preventDefault();
      setDisplayNameHasInvalidChars(true);
      return;
    }
    setDisplayNameHasInvalidChars(false);
  };

  const handleSaveProfile = () => {
    updateProfile.mutate(
      {
        bio: form.bio || null,
        qualification: form.qualification || null,
        experience_years: form.experience_years || null,
        city: form.city || null,
        subject_ids: form.subject_ids,
        curriculum_ids: form.curriculum_ids,
        language_ids: form.language_ids,
        teaching_methods: form.teaching_methods,
        exam_prep: form.exam_prep,
        ...(isTrainingCenter
          ? { display_name_en: form.display_name_en, commercial_register: form.commercial_register }
          : {}),
      },
      {
        onSuccess: () => {
          setProfileSuccessMessage(t('dashboard.adminTeacherDetail.profileEditor.saveSuccess'));
          setTimeout(() => setProfileSuccessMessage(''), 4000);
        },
      },
    );
  };

  const handleUpload = () => {
    if (!docFile) return;
    uploadDocument.mutate(
      { type: docType, file: docFile },
      {
        onSuccess: () => {
          setDocFile(null);
          setDocInputKey((k) => k + 1);
        },
      },
    );
  };

  const handleSubmitForReview = () => {
    if (!canSubmit) return;
    submitForVerification.mutate();
  };

  /**
   * تحديث مستقل عن حفظ الملف الشخصي الرئيسي — يُرسِل حقول المركز التدريبي
   * الإلزامية بقيمها الحالية دون تغيير حين يكون المعلم مركزاً تدريبياً (form
   * مُهيَّأة دوماً من teacher أعلاه بصرف النظر عن ظهور نموذج البروفايل نفسه)،
   * وإلا يرفضها الباك اند رغم أنها لم تتغيّر أصلاً.
   */
  const handleSaveIntro = (value) => {
    updateProfile.mutate({
      intro_youtube_id: value || null,
      ...(isTrainingCenter
        ? { display_name_en: form.display_name_en, commercial_register: form.commercial_register }
        : {}),
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) uploadAvatar.mutate(file);
  };

  return (
    <div className="rounded-2xl border border-[#F2F2F7] bg-white p-5 shadow-card sm:p-6">
      <div className="mb-5 flex items-center justify-end gap-2 border-b border-line/60 pb-4 text-right">
        <div>
          <h3 className="text-base font-bold text-ink">{t('dashboard.adminTeacherDetail.profileEditor.title')}</h3>
          <p className="mt-0.5 text-sm text-ink-soft">{t('dashboard.adminTeacherDetail.profileEditor.subtitle')}</p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
          <UserCog size={18} />
        </div>
      </div>

      {showMediaSection && (
        <div className="mb-6 flex flex-col items-center gap-3 border-b border-line/60 pb-6 text-center">
          <div className="relative">
            <Avatar name={teacher.name} src={teacher.avatar} size="lg" />
            <label className="absolute -bottom-1 -left-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-card hover:bg-primary-hover">
              <Camera size={13} />
              <input type="file" accept="image/png,image/jpeg" onChange={handleAvatarChange} className="hidden" />
            </label>
            {teacher.avatar && (
              <button
                type="button"
                onClick={() => deleteAvatar.mutate()}
                disabled={deleteAvatar.isPending}
                title={t('dashboard.adminTeacherDetail.profileEditor.removePhoto')}
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-accent-pink shadow-card hover:bg-accent-pink/10 disabled:opacity-50"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
          {uploadAvatar.isPending && <span className="text-xs text-ink-soft">{t('dashboard.adminTeacherDetail.profileEditor.uploadingPhoto')}</span>}
          {uploadAvatar.isError && <ApiErrorList error={uploadAvatar.error} labelFor={() => null} className="text-xs" />}
          {deleteAvatar.isError && <ApiErrorList error={deleteAvatar.error} labelFor={() => null} className="text-xs" />}
        </div>
      )}

      {showProfileForm && (
        <>
          {updateProfile.isError && <ApiErrorList error={updateProfile.error} labelFor={profileErrorLabel} className="mb-4" />}

          <div className="flex flex-col gap-4 text-right">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-ink">{t('dashboard.adminTeacherDetail.profileEditor.bioLabel')}</span>
              <textarea
                rows={4}
                value={form.bio}
                onChange={patch('bio')}
                maxLength={500}
                className="w-full resize-none rounded-btn border border-line bg-white p-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <div className="text-left text-xs text-ink-soft/70">{form.bio.length}/500</div>
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SmoothSelect
                label={t('dashboard.adminTeacherDetail.profileEditor.qualificationLabel')}
                value={form.qualification}
                onChange={(v) => setForm((prev) => ({ ...prev, qualification: v }))}
                options={QUALIFICATION_OPTIONS}
                placeholder="—"
              />
              <SmoothSelect
                label={t('dashboard.adminTeacherDetail.profileEditor.experienceLabel')}
                value={form.experience_years}
                onChange={(v) => setForm((prev) => ({ ...prev, experience_years: v }))}
                options={EXPERIENCE_OPTIONS}
                placeholder="—"
              />
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-ink">
                {t('dashboard.adminTeacherDetail.profileEditor.cityLabel')}
              </span>
              <input
                type="text"
                maxLength={80}
                value={form.city}
                onChange={patch('city')}
                className="w-full rounded-btn border border-line bg-white p-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </label>

            <MultiSelectChips
              label={t('dashboard.adminTeacherDetail.profileEditor.subjectsLabel')}
              values={form.subject_ids}
              onChange={(v) => setForm((prev) => ({ ...prev, subject_ids: v }))}
              options={subjects.map((s) => ({ value: s.id, label: s.name_ar }))}
              placeholder="—"
              max={30}
            />
            <MultiSelectChips
              label={t('dashboard.adminTeacherDetail.profileEditor.curriculumLabel')}
              values={form.curriculum_ids}
              onChange={(v) => setForm((prev) => ({ ...prev, curriculum_ids: v }))}
              options={curricula.map((c) => ({ value: c.id, label: c.name_ar }))}
              placeholder="—"
              max={20}
            />
            <MultiSelectChips
              label={t('dashboard.adminTeacherDetail.profileEditor.languagesLabel')}
              values={form.language_ids}
              onChange={(v) => setForm((prev) => ({ ...prev, language_ids: v }))}
              options={languages.map((l) => ({ value: l.id, label: l.name_ar }))}
              placeholder="—"
              max={20}
            />

            <TagChipsInput
              label={t('dashboard.adminTeacherDetail.profileEditor.teachingMethodsLabel')}
              values={form.teaching_methods}
              onChange={(v) => setForm((prev) => ({ ...prev, teaching_methods: v }))}
              suggestions={TEACHING_METHOD_SUGGESTIONS}
              placeholder={t('teacherSettings.addTagPlaceholder')}
            />
            <TagChipsInput
              label={t('dashboard.adminTeacherDetail.profileEditor.examPrepLabel')}
              values={form.exam_prep}
              onChange={(v) => setForm((prev) => ({ ...prev, exam_prep: v }))}
              suggestions={EXAM_PREP_SUGGESTIONS}
              placeholder={t('teacherSettings.addTagPlaceholder')}
            />

            {isTrainingCenter && (
              <>
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-semibold text-ink">
                    {t('dashboard.adminTeacherDetail.profileEditor.displayNameEnLabel')}
                  </span>
                  <input
                    type="text"
                    dir="ltr"
                    maxLength={180}
                    value={form.display_name_en}
                    onKeyDown={handleDisplayNameKeyDown}
                    onPaste={handleDisplayNamePaste}
                    onChange={handleDisplayNameChange}
                    aria-invalid={displayNameHasInvalidChars}
                    className={`w-full rounded-btn border bg-white p-3 text-sm text-ink focus:outline-none focus:ring-2 ${
                      displayNameHasInvalidChars
                        ? 'border-accent-pink focus:ring-accent-pink/30'
                        : 'border-line focus:border-primary focus:ring-primary/20'
                    }`}
                  />
                  {displayNameHasInvalidChars && (
                    <span className="text-xs text-accent-pink">
                      {t('dashboard.adminTeacherDetail.profileEditor.displayNameEnInvalid')}
                    </span>
                  )}
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-semibold text-ink">
                    {t('dashboard.adminTeacherDetail.profileEditor.commercialRegisterLabel')}
                  </span>
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
            {updateProfile.isPending
              ? t('dashboard.adminTeacherDetail.profileEditor.saving')
              : t('dashboard.adminTeacherDetail.profileEditor.saveProfile')}
          </button>
          {profileSuccessMessage && (
            <div className="mt-2 rounded-btn bg-success-light px-4 py-2.5 text-xs font-medium text-success">
              {profileSuccessMessage}
            </div>
          )}
        </>
      )}

      {showDocumentUpload && (
        <div className={showProfileForm ? 'mt-8 border-t border-line/60 pt-6' : ''}>
          <h4 className="text-right text-sm font-bold text-ink">{t('dashboard.adminTeacherDetail.profileEditor.documentsTitle')}</h4>

          <ul className="mt-3 flex flex-col gap-2">
            {REQUIRED_DOCUMENT_TYPES.map((type) => {
              const uploadedDoc = documents.find((d) => d.type === type);
              const style = uploadedDoc ? DOCUMENT_STATUS_STYLES[uploadedDoc.status] : null;
              return (
                <li
                  key={type}
                  className={`flex items-center justify-between gap-3 rounded-xl px-4 py-2.5 text-right ${
                    uploadedDoc ? 'bg-[#F8F9FB]' : 'bg-accent-pink/5'
                  }`}
                >
                  {uploadedDoc ? (
                    <span className="rounded-pill px-3 py-1 text-xs font-bold" style={{ backgroundColor: style?.bg, color: style?.color }}>
                      {style?.label}
                    </span>
                  ) : (
                    <span className="rounded-pill bg-accent-pink/10 px-3 py-1 text-xs font-bold text-accent-pink">
                      {t('dashboard.adminTeacherDetail.profileEditor.documentMissing')}
                    </span>
                  )}
                  <span className="flex items-center gap-2 text-sm font-medium text-ink">
                    {DOCUMENT_TYPE_LABELS[type] ?? type}
                    <FileText size={15} className="text-ink-soft" />
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 flex flex-col gap-3 rounded-xl border border-dashed border-line bg-white p-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <SmoothSelect
                label={t('dashboard.adminTeacherDetail.profileEditor.documentTypeLabel')}
                value={docType}
                onChange={setDocType}
                options={DOCUMENT_TYPE_OPTIONS}
              />
            </div>
            <label className="flex flex-1 flex-col gap-1.5">
              <span className="text-sm font-semibold text-ink">{t('dashboard.adminTeacherDetail.profileEditor.documentFileLabel')}</span>
              <input
                key={docInputKey}
                type="file"
                accept="image/png,image/jpeg,application/pdf"
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
              {uploadDocument.isPending
                ? t('dashboard.adminTeacherDetail.profileEditor.uploading')
                : t('dashboard.adminTeacherDetail.profileEditor.upload')}
            </button>
          </div>
          {uploadDocument.isSuccess && (
            <div className="mt-2 rounded-btn bg-success-light px-4 py-2.5 text-xs font-medium text-success">
              {t('dashboard.adminTeacherDetail.profileEditor.documentUploaded')}
            </div>
          )}
          {uploadDocument.isError && <ApiErrorList error={uploadDocument.error} labelFor={() => null} className="mt-2 text-xs" />}
        </div>
      )}

      {showMediaSection && (
        <div className={showProfileForm || showDocumentUpload ? 'mt-8 border-t border-line/60 pt-6' : ''}>
          <h4 className="text-right text-sm font-bold text-ink">{t('teacherVideos.sectionTitle')}</h4>
          <p className="mt-1 text-right text-xs text-ink-soft">{t('teacherVideos.sectionHint')}</p>
          <div className="mt-3">
            <TeacherVideosEditor
              introYoutubeId={teacher.introYoutubeId}
              videos={teacher.videos ?? []}
              onSaveIntro={handleSaveIntro}
              isSavingIntro={updateProfile.isPending}
              onAddVideo={(payload, opts) => addVideo.mutate(payload, opts)}
              isAddingVideo={addVideo.isPending}
              addVideoError={addVideo.isError ? addVideo.error : null}
              onRemoveVideo={(id) => removeVideo.mutate(id)}
              removingVideoId={removeVideo.isPending ? removeVideo.variables : null}
            />
          </div>
        </div>
      )}

      {showMediaSection && (
        <div className="mt-8 border-t border-line/60 pt-6">
          <h4 className="text-right text-sm font-bold text-ink">{t('teacherFaqs.listLabel')}</h4>
          <p className="mt-1 text-right text-xs text-ink-soft">{t('teacherFaqs.sectionHint')}</p>
          <div className="mt-3">
            <TeacherFaqEditor
              faqs={teacher.faqs ?? []}
              onAdd={(payload, opts) => addFaq.mutate(payload, opts)}
              isAdding={addFaq.isPending}
              addError={addFaq.isError ? addFaq.error : null}
              onRemove={(id) => removeFaq.mutate(id)}
              removingId={removeFaq.isPending ? removeFaq.variables : null}
            />
          </div>
        </div>
      )}

      {showMediaSection && (
        <div className="mt-8 border-t border-line/60 pt-6">
          <h4 className="text-right text-sm font-bold text-ink">{t('teacherExperiences.listLabel')}</h4>
          <p className="mt-1 text-right text-xs text-ink-soft">{t('teacherExperiences.sectionHint')}</p>
          <div className="mt-3">
            <TeacherExperienceEditor
              experiences={teacher.experiences ?? []}
              onAdd={(payload, opts) => addExperience.mutate(payload, opts)}
              isAdding={addExperience.isPending}
              addError={addExperience.isError ? addExperience.error : null}
              onRemove={(id) => removeExperience.mutate(id)}
              removingId={removeExperience.isPending ? removeExperience.variables : null}
            />
          </div>
        </div>
      )}

      {showSubmitButton && (
        <>
          {submitForVerification.isError && (
            <ApiErrorList error={submitForVerification.error} labelFor={() => null} className="mt-4" />
          )}
          <button
            type="button"
            disabled={!canSubmit || submitForVerification.isPending}
            onClick={handleSubmitForReview}
            className="mt-6 flex w-full items-center justify-center gap-1.5 rounded-xl bg-success py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Check size={16} />
            {submitForVerification.isPending
              ? t('dashboard.adminTeacherDetail.profileEditor.submitting')
              : t('dashboard.adminTeacherDetail.profileEditor.submitForReview')}
          </button>
          {!canSubmit && (
            <p className="mt-2 text-center text-xs text-ink-soft">{t('dashboard.adminTeacherDetail.profileEditor.submitHint')}</p>
          )}
        </>
      )}
    </div>
  );
}
