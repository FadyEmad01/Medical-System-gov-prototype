import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AssignedPatientsView } from '@/features/assignments/components/assigned-patients-view';
import { PageHeader } from '@/features/doctor/components/page-header';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function DoctorPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('doctor');

  return (
    <div className="flex flex-col gap-6 px-4 lg:gap-2 lg:px-6 pt-5">
      <PageHeader
        title={t('pageTitles.doctor')}
        description={t('pageSubtitles.doctor')}
      />
      <AssignedPatientsView />
    </div>
  );
}
