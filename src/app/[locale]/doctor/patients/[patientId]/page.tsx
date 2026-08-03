import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeader } from '@/features/doctor/components/page-header';
import { PatientDetailView } from '@/features/patients/components/patient-detail-view';

type Props = {
  params: Promise<{ locale: string; patientId: string }>;
};

export default async function DoctorPatientDetailPage({ params }: Props) {
  const { locale, patientId } = await params;
  const patientIdNumber = Number(patientId);

  if (!Number.isInteger(patientIdNumber) || patientIdNumber <= 0) {
    notFound();
  }

  setRequestLocale(locale);
  const t = await getTranslations('doctor');

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t('pageTitles.patientDetail')}
        description={t('pageSubtitles.patientDetail')}
      />
      <PatientDetailView patientId={patientIdNumber} />
    </div>
  );
}
