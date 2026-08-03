import { getTranslations, setRequestLocale } from 'next-intl/server';
import { DashboardView } from '@/features/dashboard/components/dashboard-view';
import { PageHeader } from '@/features/dashboard/components/page-header';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('dashboard');

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t('pageTitles.dashboard')} />
      <DashboardView />
    </div>
  );
}
