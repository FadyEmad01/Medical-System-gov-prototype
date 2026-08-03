import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeader } from '@/features/doctor/components/page-header';
import { PatientSearchView } from '@/features/patients/components/patient-search-view';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function DoctorPatientsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('doctor');

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t('pageTitles.patients')}
        description={t('pageSubtitles.patients')}
      />
      <PatientSearchView />
    </div>
  );
}
