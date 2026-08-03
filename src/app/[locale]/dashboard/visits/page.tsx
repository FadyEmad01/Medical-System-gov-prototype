import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeader } from '@/features/dashboard/components/page-header';
import { VisitsView } from '@/features/visits/components/visits-view';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function VisitsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('dashboard');

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t('pageTitles.visits')}
        description={t('pageSubtitles.visits')}
      />
      <VisitsView />
    </div>
  );
}
