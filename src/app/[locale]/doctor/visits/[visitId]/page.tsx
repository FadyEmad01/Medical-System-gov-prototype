import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeader } from '@/features/doctor/components/page-header';
import { VisitDetailView } from '@/features/visits/components/visit-detail-view';

type Props = {
  params: Promise<{ locale: string; visitId: string }>;
};

export default async function DoctorVisitDetailPage({ params }: Props) {
  const { locale, visitId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('doctor');

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t('pageTitles.visitDetail')}
        description={t('pageSubtitles.visitDetail')}
      />
      <VisitDetailView visitId={visitId} />
    </div>
  );
}
