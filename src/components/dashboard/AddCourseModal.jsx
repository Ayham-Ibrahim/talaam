import { useState } from 'react';
import { X } from 'lucide-react';
import { WizardStepIndicator } from './WizardStepIndicator';
import { CourseWizardBasicInfo } from './CourseWizardBasicInfo';
import { CourseWizardScheduleCapacity } from './CourseWizardScheduleCapacity';
import { CourseWizardPricing } from './CourseWizardPricing';
import { CourseWizardReview } from './CourseWizardReview';
import { useCreateTeacherCourse } from '@/hooks/useDashboard';
import { useT } from '@/hooks/useT';

const INITIAL_DATA = {
  title: '',
  description: '',
  course_field_id: '',
  subject_id: '',
  level: 'beginner',
  delivery_mode: 'online',
  location: '',
  curriculum_ids: [],
  start_date: '',
  end_date: '',
  total_sessions: '',
  session_duration_min: '60',
  max_seats: '',
  schedules: [],
  provider_price: '',
  pricing_mode: 'total',
  total_hours: '',
  has_certificate: false,
  certificate_type: '',
  certificate_issuer: '',
  certificate_requirements: '',
  requires_laptop: false,
  materials_included: false,
  has_practical_exercises: false,
  sessions_recorded: false,
  prerequisites: '',
  cancellation_policy: '',
};

const STEPS = [
  { no: 4, key: 'review' },
  { no: 3, key: 'pricing' },
  { no: 2, key: 'scheduleCapacity' },
  { no: 1, key: 'basicInfo' },
];

/** Training-center-only wizard — courses are a fully separate backend resource from packages (see ب-3) */
export function AddCourseModal({ onClose }) {
  const t = useT();
  const createCourse = useCreateTeacherCourse();

  const [step, setStep] = useState(1);
  const [data, setData] = useState(INITIAL_DATA);

  const patchData = (patch) => setData((prev) => ({ ...prev, ...patch }));

  const handleSaveDraft = () => {
    createCourse.mutate(
      {
        title: data.title.trim(),
        description: data.description || null,
        course_field_id: Number(data.course_field_id),
        subject_id: data.subject_id ? Number(data.subject_id) : null,
        level: data.level,
        delivery_mode: data.delivery_mode,
        location: data.location || null,
        start_date: data.start_date,
        end_date: data.end_date,
        total_sessions: Number(data.total_sessions),
        session_duration_min: data.session_duration_min ? Number(data.session_duration_min) : null,
        max_seats: Number(data.max_seats),
        provider_price: Number(data.provider_price),
        pricing_mode: data.pricing_mode,
        total_hours: data.pricing_mode === 'hourly' ? Number(data.total_hours) : null,
        currency: 'USD',
        has_certificate: data.has_certificate,
        certificate_type: data.has_certificate ? data.certificate_type || null : null,
        certificate_issuer: data.has_certificate ? data.certificate_issuer || null : null,
        certificate_requirements: data.has_certificate ? data.certificate_requirements || null : null,
        requires_laptop: data.requires_laptop,
        materials_included: data.materials_included,
        has_practical_exercises: data.has_practical_exercises,
        sessions_recorded: data.sessions_recorded,
        prerequisites: data.prerequisites || null,
        cancellation_policy: data.cancellation_policy || null,
        curriculum_ids: data.curriculum_ids,
        schedules: data.schedules,
      },
      { onSuccess: () => onClose?.() }
    );
  };

  return (
    <div className="relative rounded-2xl bg-white p-6 shadow-card sm:p-8">
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label={t('dashboard.teacherPackages.close')}
          className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-line/40 hover:text-ink"
        >
          <X size={18} />
        </button>
      )}

      <WizardStepIndicator steps={STEPS} currentStep={step} translationPrefix="dashboard.addCourse.steps" />

      {step === 1 && <CourseWizardBasicInfo data={data} onChange={patchData} onNext={() => setStep(2)} />}
      {step === 2 && (
        <CourseWizardScheduleCapacity data={data} onChange={patchData} onNext={() => setStep(3)} onBack={() => setStep(1)} />
      )}
      {step === 3 && (
        <CourseWizardPricing data={data} onChange={patchData} onNext={() => setStep(4)} onBack={() => setStep(2)} />
      )}
      {step === 4 && (
        <CourseWizardReview data={data} isPending={createCourse.isPending} onSubmit={handleSaveDraft} onBack={() => setStep(3)} />
      )}
    </div>
  );
}
